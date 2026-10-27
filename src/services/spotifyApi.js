// ─────────────────────────────────────────────────────────────────────────────
// spotifyApi.js — Integració amb l'API de Spotify (Bloc 6.2 i 6.3)
// ─────────────────────────────────────────────────────────────────────────────
import { getAlbums } from './storageService';

let cachedSpotifyToken = null;
let tokenExpiresAt = 0;

const PLACEHOLDER_COVER =
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';

// ── Helpers d'imatge ──────────────────────────────────────────────────────────
function getBestImage(images = [], fallback = PLACEHOLDER_COVER) {
  if (!images || images.length === 0) return fallback;
  // Preferir imatge 640x640 (índex 1) o la primera disponible
  return (images[1] || images[0])?.url || fallback;
}

// ── Autenticació Client Credentials ──────────────────────────────────────────
async function getSpotifyAccessToken() {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId === 'el_teu_spotify_client_id') {
    return null;
  }

  const now = Date.now();
  if (cachedSpotifyToken && now < tokenExpiresAt) {
    return cachedSpotifyToken;
  }

  try {
    const creds = btoa(`${clientId}:${clientSecret}`);
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${creds}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) throw new Error(`Auth error: ${res.status}`);

    const data = await res.json();
    cachedSpotifyToken = data.access_token;
    tokenExpiresAt = now + (data.expires_in - 60) * 1000;
    return cachedSpotifyToken;
  } catch (err) {
    console.warn('No s\'ha pogut connectar amb Spotify Auth → Pla B actiu.', err);
    return null;
  }
}

// ── Fetch genèric amb Bearer token ────────────────────────────────────────────
async function spotifyFetch(token, url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Spotify ${res.status}: ${url}`);
  return res.json();
}

// ── Formatar durada en ms → "M:SS" ───────────────────────────────────────────
export function formatDurationMs(ms) {
  if (!ms) return '—';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CERCA UNIFICADA — Retorna { artists, albums, tracks, isSpotify }
// ─────────────────────────────────────────────────────────────────────────────
export async function searchAll(query, onFallback = null) {
  const q = (query || '').trim();
  if (!q) return { artists: [], albums: [], tracks: [], isSpotify: false };

  const token = await getSpotifyAccessToken();

  if (token) {
    try {
      const enc = encodeURIComponent(q);
      const url =
        `https://api.spotify.com/v1/search?q=${enc}` +
        `&type=artist,album,track&limit=12&market=ES`;

      const data = await spotifyFetch(token, url);

      return {
        isSpotify: true,
        artists: parseArtists(data.artists?.items || []),
        albums: parseAlbums(data.albums?.items || []),
        tracks: parseTracks(data.tracks?.items || []),
      };
    } catch (err) {
      console.warn('Spotify search error → Pla B:', err);
      if (onFallback) onFallback();
    }
  } else {
    if (onFallback) onFallback();
  }

  // Pla B: catàleg local
  return {
    isSpotify: false,
    artists: [],
    albums: localAlbumSearch(q),
    tracks: [],
  };
}

// ── Pla B: filtre sobre catàleg localStorage ──────────────────────────────────
function localAlbumSearch(q) {
  const lq = q.toLowerCase();
  return getAlbums().filter(
    (a) =>
      a.title?.toLowerCase().includes(lq) ||
      a.artist?.toLowerCase().includes(lq) ||
      a.release_year?.toString().includes(lq),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Parsers — convertir resposta de Spotify a model intern normalitzat
// ─────────────────────────────────────────────────────────────────────────────

function parseArtists(items) {
  return items
    .filter(Boolean)
    .map((a) => ({
      _type: 'artist',
      id: a.id,
      name: a.name,
      image: getBestImage(a.images),
      // popularity i genres disponibles quan la resposta els inclou
      popularity: a.popularity ?? null,
      followers: a.followers?.total ?? null,
      genres: a.genres ?? [],
      spotifyUrl: a.external_urls?.spotify ?? null,
      uri: a.uri,
    }));
}

function parseAlbums(items) {
  return items
    .filter(Boolean)
    .map((a) => ({
      _type: 'album',
      id: a.id,
      title: a.name,
      artist: a.artists?.map((x) => x.name).join(', ') ?? 'Artista desconegut',
      artistIds: a.artists?.map((x) => x.id) ?? [],
      cover_url: getBestImage(a.images),
      release_date: a.release_date ?? null,
      release_year: a.release_date ? parseInt(a.release_date, 10) : null,
      total_tracks: a.total_tracks ?? 0,
      album_type: a.album_type ?? 'album',   // album | single | compilation
      label: a.label ?? null,
      spotifyUrl: a.external_urls?.spotify ?? null,
      uri: a.uri,
    }));
}

function parseTracks(items) {
  return items
    .filter(Boolean)
    .map((t) => ({
      _type: 'track',
      id: t.id,
      title: t.name,
      artist: t.artists?.map((x) => x.name).join(', ') ?? 'Artista desconegut',
      artistIds: t.artists?.map((x) => x.id) ?? [],
      album: t.album?.name ?? null,
      albumId: t.album?.id ?? null,
      cover_url: getBestImage(t.album?.images),
      duration: formatDurationMs(t.duration_ms),
      duration_ms: t.duration_ms ?? 0,
      track_number: t.track_number ?? null,
      disc_number: t.disc_number ?? 1,
      explicit: t.explicit ?? false,
      popularity: t.popularity ?? null,
      preview_url: t.preview_url ?? null,
      spotifyUrl: t.external_urls?.spotify ?? null,
      isrc: t.external_ids?.isrc ?? null,
      uri: t.uri,
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// DETALL D'ÀLBUM (RF-04) — mantingut per compatibilitat
// ─────────────────────────────────────────────────────────────────────────────
export async function searchAlbums(query, onFallbackNotice = null) {
  const result = await searchAll(query, onFallbackNotice ? () => {
    onFallbackNotice("No s'ha pogut connectar amb Spotify. Mostrant catàleg local.");
  } : null);
  return result.albums;
}

export async function getAlbumDetails(albumId, onFallbackNotice = null) {
  const localAlbums = getAlbums();
  const cached = localAlbums.find((a) => a.id === albumId);

  const token = await getSpotifyAccessToken();

  if (token) {
    try {
      const item = await spotifyFetch(
        token,
        `https://api.spotify.com/v1/albums/${albumId}?market=ES`,
      );

      return {
        id: item.id,
        title: item.name,
        artist: item.artists?.map((a) => a.name).join(', ') ?? 'Artista desconegut',
        cover_url: getBestImage(item.images) || cached?.cover_url || PLACEHOLDER_COVER,
        release_date: item.release_date,
        release_year: item.release_date ? parseInt(item.release_date, 10) : null,
        total_tracks: item.total_tracks ?? 0,
        label: item.label ?? null,
        genres:
          item.genres?.length > 0
            ? item.genres
            : cached?.genres ?? ['Música General'],
        description:
          cached?.description ??
          `Àlbum llançat per ${item.artists?.[0]?.name ?? "l'artista"} l'any ${item.release_date?.substring(0, 4) ?? ''}.`,
        tracks: item.tracks?.items?.map((t) => ({
          id: t.id,
          title: t.name,
          duration: formatDurationMs(t.duration_ms),
          preview_url: t.preview_url ?? null,
          track_number: t.track_number,
          explicit: t.explicit ?? false,
        })) ?? cached?.tracks ?? [],
        spotifyUrl: item.external_urls?.spotify ?? null,
      };
    } catch (err) {
      console.warn('Error consultant detall àlbum a Spotify:', err);
      if (onFallbackNotice) {
        onFallbackNotice("No s'ha pogut connectar amb Spotify. Mostrant dades locals.");
      }
    }
  }

  if (cached) return cached;

  return {
    id: albumId,
    title: 'Àlbum',
    artist: 'Artista desconegut',
    cover_url: PLACEHOLDER_COVER,
    release_year: 2026,
    genres: ['Música'],
    description: 'Informació disponible només en mode local.',
    tracks: [],
  };
}
