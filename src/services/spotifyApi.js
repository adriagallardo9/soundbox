// Integració amb l'API de Spotify i implementació del Pla B (Bloc 6.2 i 6.3)
import { getAlbums } from './storageService';

let cachedSpotifyToken = null;
let tokenExpiresAt = 0;

const PLACEHOLDER_COVER = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';

// Obtenir Token Client Credentials de Spotify si s'han configurat claus a .env
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
        'Authorization': `Basic ${creds}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!res.ok) {
      throw new Error(`Error obtenint token de Spotify: ${res.status}`);
    }

    const data = await res.json();
    cachedSpotifyToken = data.access_token;
    // Expira en (expires_in - 60) segons per marge de seguretat
    tokenExpiresAt = now + (data.expires_in - 60) * 1000;
    return cachedSpotifyToken;
  } catch (error) {
    console.warn('No s\'ha pogut connectar amb Spotify Auth, s\'activa el Pla B local.', error);
    return null;
  }
}

// Cerca d'àlbums (RF-03)
export async function searchAlbums(query, onFallbackNotice = null) {
  const cleanQuery = (query || '').trim().toLowerCase();
  if (!cleanQuery) return [];

  const token = await getSpotifyAccessToken();

  if (token) {
    try {
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(cleanQuery)}&type=album&limit=20`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`Spotify API error ${res.status}`);
      }

      const data = await res.json();
      if (data.albums && data.albums.items) {
        return data.albums.items.map(item => ({
          id: item.id,
          title: item.name,
          artist: item.artists ? item.artists.map(a => a.name).join(', ') : 'Artista desconegut',
          cover_url: (item.images && item.images[0] && item.images[0].url) || PLACEHOLDER_COVER,
          release_year: item.release_date ? parseInt(item.release_date.substring(0, 4), 10) : null,
          total_tracks: item.total_tracks || 0
        }));
      }
    } catch (err) {
      console.warn('Error a Spotify API, activant Pla B:', err);
      if (onFallbackNotice) {
        onFallbackNotice("No s'ha pogut connectar amb el catàleg extern de Spotify. Mostrant contingut desemmagatzemat localment.");
      }
    }
  } else {
    // Si no hi ha claus configurades, informar de mode local
    if (onFallbackNotice) {
      onFallbackNotice("No s'ha pogut connectar amb el catàleg extern de Spotify. Mostrant contingut desemmagatzemat localment.");
    }
  }

  // Pla B: Catàleg local (filtra per títol, artista o any)
  const localAlbums = getAlbums();
  return localAlbums.filter(album => {
    const titleMatch = album.title.toLowerCase().includes(cleanQuery);
    const artistMatch = album.artist.toLowerCase().includes(cleanQuery);
    const yearMatch = album.release_year ? album.release_year.toString().includes(cleanQuery) : false;
    return titleMatch || artistMatch || yearMatch;
  });
}

// Obtenir detall complet d'un àlbum (RF-04)
export async function getAlbumDetails(albumId, onFallbackNotice = null) {
  // Comprovar primer si el tenim a la BDD local
  const localAlbums = getAlbums();
  const cached = localAlbums.find(a => a.id === albumId);

  const token = await getSpotifyAccessToken();

  if (token) {
    try {
      const url = `https://api.spotify.com/v1/albums/${albumId}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const item = await res.json();
        return {
          id: item.id,
          title: item.name,
          artist: item.artists ? item.artists.map(a => a.name).join(', ') : 'Artista desconegut',
          cover_url: (item.images && item.images[0] && item.images[0].url) || (cached && cached.cover_url) || PLACEHOLDER_COVER,
          release_year: item.release_date ? parseInt(item.release_date.substring(0, 4), 10) : null,
          genres: item.genres && item.genres.length > 0 ? item.genres : (cached && cached.genres) || ['Música General'],
          description: cached ? cached.description : `Àlbum llançat per ${item.artists ? item.artists[0]?.name : 'l\'artista'} l'any ${item.release_date ? item.release_date.substring(0, 4) : ''}.`,
          tracks: item.tracks && item.tracks.items
            ? item.tracks.items.map(t => ({
                id: t.id,
                title: t.name,
                duration: formatDurationMs(t.duration_ms),
                preview_url: t.preview_url
              }))
            : (cached && cached.tracks) || []
        };
      }
    } catch (err) {
      console.warn('Error consultant detall a Spotify API:', err);
      if (onFallbackNotice) {
        onFallbackNotice("No s'ha pogut connectar amb el catàleg extern de Spotify. Mostrant contingut desemmagatzemat localment.");
      }
    }
  }

  // Pla B: Retornar l'àlbum de memòria local
  if (cached) {
    return cached;
  }

  // Fallback genèric si no existeix
  return {
    id: albumId,
    title: 'Àlbum',
    artist: 'Artista desconegut',
    cover_url: PLACEHOLDER_COVER,
    release_year: 2026,
    genres: ['Música'],
    description: 'Informació disponible només en mode local.',
    tracks: []
  };
}

function formatDurationMs(ms) {
  if (!ms) return '3:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
