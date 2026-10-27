// ─────────────────────────────────────────────────────────────────────────────
// spotifyApi.js — Integració amb l'API de Spotify (Bloc 6.2 i 6.3)
//
// Arquitectura:
//   Navegador → /spotify-token   → Proxy Vite → accounts.spotify.com/api/token
//   Navegador → /spotify-api/v1/ → Proxy Vite → api.spotify.com/v1/
//
// El client_secret mai surt del servidor de dev (no hi ha CORS issues).
// ─────────────────────────────────────────────────────────────────────────────
import { getAlbums, updateAlbumCover } from './storageService';

let cachedToken = null;
let tokenExpiresAt = 0;

const PLACEHOLDER_COVER =
  '/album-placeholder.svg';

let albumCoverRefreshPromise = null;

// ── Helpers ───────────────────────────────────────────────────────────────────
function getBestImage(images = [], fallback = PLACEHOLDER_COVER) {
  if (!images?.length) return fallback;
  return (images[1] || images[0])?.url || fallback;
}

export function formatDurationMs(ms) {
  if (!ms) return '—';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ── Autenticació via proxy de Vite ────────────────────────────────────────────
async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) return cachedToken;

  try {
    // /spotify-token → el proxy de vite.config.js ho reenvia a accounts.spotify.com/api/token
    // afegint les credencials server-side (sense CORS, sense exposar el secret al browser)
    const res = await fetch('/spotify-token', { method: 'POST' });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Token error ${res.status}: ${text}`);
    }

    const data = await res.json();
    if (!data.access_token) throw new Error('Resposta sense access_token');

    cachedToken = data.access_token;
    tokenExpiresAt = now + (data.expires_in - 60) * 1000;
    console.info('[Spotify] Token obtingut. Expira en', data.expires_in, 's');
    return cachedToken;
  } catch (err) {
    console.warn('[Spotify] No s\'ha pogut obtenir token → Pla B actiu.', err.message);
    return null;
  }
}

// ── Fetch genèric via proxy ───────────────────────────────────────────────────
// Ús: spotifyGet('/v1/search?q=...') → crida a /spotify-api/v1/search?q=...
async function spotifyGet(path, token) {
  const res = await fetch(`/spotify-api${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Spotify ${res.status} – ${body?.error?.message || path}`);
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// CERCA UNIFICADA — Retorna { artists, albums, tracks, isSpotify }
// Documentació: https://developer.spotify.com/documentation/web-api/reference/search
// ─────────────────────────────────────────────────────────────────────────────
export async function searchAll(query, onFallback = null) {
  const q = (query || '').trim();
  if (!q) return { artists: [], albums: [], tracks: [], isSpotify: false };

  const token = await getToken();

  if (token) {
    try {
      const enc = encodeURIComponent(q);
      // Spotify currently allows up to 10 results per type.
      const data = await spotifyGet(
        `/v1/search?q=${enc}&type=artist,album,track&limit=10&market=ES`,
        token,
      );

      return {
        isSpotify: true,
        artists: parseArtists(data.artists?.items || []),
        albums:  parseAlbums(data.albums?.items   || []),
        tracks:  parseTracks(data.tracks?.items   || []),
      };
    } catch (err) {
      console.warn('[Spotify] Error a /search → Pla B:', err.message);
      if (onFallback) onFallback();
    }
  } else {
    if (onFallback) onFallback();
  }

  // Pla B: catàleg local
  return { isSpotify: false, artists: [], albums: localSearch(q), tracks: [] };
}

export async function getArtistDiscography(artistId, offset = 0) {
  const token = await getToken();
  if (!token) throw new Error("No s'ha pogut obtenir un token de Spotify.");

  const data = await spotifyGet(
    `/v1/artists/${encodeURIComponent(artistId)}/albums?include_groups=album,single,compilation&market=ES&limit=10&offset=${offset}`,
    token,
  );
  return {
    albums: parseAlbums(data.items || []),
    total: data.total ?? 0,
    nextOffset: data.next ? offset + (data.limit || 10) : null,
  };
}

function normalizeText(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isSpotifyArtwork(url) {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname;
    return hostname.endsWith('.scdn.co') || hostname.endsWith('.spotifycdn.com');
  } catch {
    return false;
  }
}

async function findSpotifyAlbumCover(album, token) {
  const title = normalizeText(album.title);
  const artist = normalizeText(album.artist?.split(',')[0]);
  if (!title || !artist) return null;

  const quoteQuery = (value) => value.replace(/["\\]/g, '\\$&');
  const query = encodeURIComponent(`album:"${quoteQuery(album.title)}" artist:"${quoteQuery(album.artist.split(',')[0])}"`);
  const data = await spotifyGet(`/v1/search?q=${query}&type=album&limit=10&market=ES`, token);
  const match = (data.albums?.items || []).find((candidate) => {
    const candidateTitle = normalizeText(candidate.name);
    const hasMatchingTitle = candidateTitle === title || candidateTitle.startsWith(`${title} `);
    const hasMatchingArtist = candidate.artists?.some((candidateArtist) => {
      const candidateName = normalizeText(candidateArtist.name);
      return candidateName === artist || candidateName.includes(artist) || artist.includes(candidateName);
    });
    return hasMatchingTitle && hasMatchingArtist && candidate.images?.length;
  });

  return match ? getBestImage(match.images, null) : null;
}

export async function refreshLocalAlbumCovers() {
  if (albumCoverRefreshPromise) return albumCoverRefreshPromise;

  albumCoverRefreshPromise = (async () => {
    const albums = getAlbums().filter((album) => !isSpotifyArtwork(album.cover_url));
    if (albums.length === 0) return 0;

    const token = await getToken();
    if (!token) return 0;

    let updated = 0;
    let nextIndex = 0;
    const workers = Array.from({ length: Math.min(3, albums.length) }, async () => {
      while (nextIndex < albums.length) {
        const album = albums[nextIndex];
        nextIndex += 1;
        try {
          const coverUrl = await findSpotifyAlbumCover(album, token);
          if (coverUrl && updateAlbumCover(album.id, coverUrl)) updated += 1;
        } catch (error) {
          console.error(`[Spotify] No s'ha pogut carregar la portada de "${album.title}":`, error);
        }
      }
    });

    await Promise.all(workers);
    if (updated > 0) console.info(`[Spotify] Portades actualitzades: ${updated}/${albums.length}.`);
    return updated;
  })().finally(() => {
    albumCoverRefreshPromise = null;
  });

  return albumCoverRefreshPromise;
}

// ── Pla B ─────────────────────────────────────────────────────────────────────
function localSearch(q) {
  const lq = q.toLowerCase();
  return getAlbums().filter(
    (a) =>
      a.title?.toLowerCase().includes(lq) ||
      a.artist?.toLowerCase().includes(lq) ||
      a.release_year?.toString().includes(lq),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Parsers (tots els camps disponibles a l'API de Spotify)
// ─────────────────────────────────────────────────────────────────────────────

function parseArtists(items) {
  return (items || []).filter(Boolean).map((a) => ({
    _type:      'artist',
    id:         a.id,
    name:       a.name,
    image:      getBestImage(a.images),
    popularity: a.popularity ?? null,
    followers:  a.followers?.total ?? null,
    genres:     a.genres ?? [],
    spotifyUrl: a.external_urls?.spotify ?? null,
    uri:        a.uri,
  }));
}

function parseAlbums(items) {
  return (items || []).filter(Boolean).map((a) => ({
    _type:       'album',
    id:          a.id,
    title:       a.name,
    artist:      a.artists?.map((x) => x.name).join(', ') ?? 'Artista desconegut',
    artistIds:   a.artists?.map((x) => x.id) ?? [],
    cover_url:   getBestImage(a.images),
    release_date: a.release_date ?? null,
    release_year: a.release_date ? parseInt(a.release_date, 10) : null,
    total_tracks: a.total_tracks ?? 0,
    album_type:  a.album_type ?? 'album',   // 'album' | 'single' | 'compilation'
    label:       a.label ?? null,
    spotifyUrl:  a.external_urls?.spotify ?? null,
    uri:         a.uri,
  }));
}

function parseTracks(items) {
  return (items || []).filter(Boolean).map((t) => ({
    _type:        'track',
    id:           t.id,
    title:        t.name,
    artist:       t.artists?.map((x) => x.name).join(', ') ?? 'Artista desconegut',
    artistIds:    t.artists?.map((x) => x.id) ?? [],
    album:        t.album?.name ?? null,
    albumId:      t.album?.id ?? null,
    cover_url:    getBestImage(t.album?.images),
    duration:     formatDurationMs(t.duration_ms),
    duration_ms:  t.duration_ms ?? 0,
    track_number: t.track_number ?? null,
    disc_number:  t.disc_number ?? 1,
    explicit:     t.explicit ?? false,
    popularity:   t.popularity ?? null,
    preview_url:  t.preview_url ?? null,
    spotifyUrl:   t.external_urls?.spotify ?? null,
    isrc:         t.external_ids?.isrc ?? null,
    uri:          t.uri,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPATIBILITAT — mantinguts per a AlbumDetailPage i altres components
// ─────────────────────────────────────────────────────────────────────────────

export async function searchAlbums(query, onFallbackNotice = null) {
  const result = await searchAll(query, onFallbackNotice
    ? () => onFallbackNotice("No s'ha pogut connectar amb Spotify. Mostrant catàleg local.")
    : null,
  );
  return result.albums;
}

export async function getAlbumDetails(albumId, onFallbackNotice = null) {
  const localAlbums = getAlbums();
  const cached = localAlbums.find((a) => a.id === albumId);

  const token = await getToken();

  if (token) {
    try {
      // https://developer.spotify.com/documentation/web-api/reference/get-an-album
      const item = await spotifyGet(`/v1/albums/${albumId}?market=ES`, token);

      return {
        id:           item.id,
        title:        item.name,
        artist:       item.artists?.map((a) => a.name).join(', ') ?? 'Artista desconegut',
        cover_url:    getBestImage(item.images) || cached?.cover_url || PLACEHOLDER_COVER,
        release_date: item.release_date,
        release_year: item.release_date ? parseInt(item.release_date, 10) : null,
        total_tracks: item.total_tracks ?? 0,
        label:        item.label ?? null,
        genres:       item.genres?.length > 0 ? item.genres : cached?.genres ?? ['Música General'],
        description:
          cached?.description ??
          `Àlbum llançat per ${item.artists?.[0]?.name ?? "l'artista"} l'any ${item.release_date?.slice(0, 4) ?? ''}.`,
        tracks: item.tracks?.items?.map((t) => ({
          id:           t.id,
          title:        t.name,
          duration:     formatDurationMs(t.duration_ms),
          preview_url:  t.preview_url ?? null,
          track_number: t.track_number,
          explicit:     t.explicit ?? false,
        })) ?? cached?.tracks ?? [],
        spotifyUrl: item.external_urls?.spotify ?? null,
      };
    } catch (err) {
      console.warn('[Spotify] Error consultant àlbum:', err.message);
      if (onFallbackNotice) onFallbackNotice("No s'ha pogut connectar amb Spotify.");
    }
  }

  if (cached) return cached;

  return {
    id: albumId, title: 'Àlbum', artist: 'Artista desconegut',
    cover_url: PLACEHOLDER_COVER, release_year: 2026,
    genres: ['Música'], description: 'Informació disponible en mode local.', tracks: [],
  };
}
