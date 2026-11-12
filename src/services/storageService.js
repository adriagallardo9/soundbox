// Servei de persistència local seguint el model relacional de la memòria
import {
  INITIAL_USERS,
  INITIAL_ALBUMS,
  INITIAL_REVIEWS,
  INITIAL_PLAYLISTS,
  INITIAL_PLAYLIST_ALBUMS,
  INITIAL_LISTENLIST
} from './mockData';

const KEYS = {
  USERS: 'soundboxd_users_v1',
  ALBUMS: 'soundboxd_albums_v1',
  REVIEWS: 'soundboxd_reviews_v1',
  PLAYLISTS: 'soundboxd_playlists_v1',
  PLAYLIST_ALBUMS: 'soundboxd_playlist_albums_v1',
  LISTENLIST: 'soundboxd_listenlist_v1',
  CURRENT_USER: 'soundboxd_current_user_v1',
  SESSION: 'soundboxd_session_v1'
};

// Sessió de 2 setmanes en mil·lisegons
const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000;

// ---- Gestió de sessió amb expiració ----
export function saveSession(user) {
  const session = {
    user,
    expiresAt: Date.now() + SESSION_DURATION_MS
  };
  setItem(KEYS.SESSION, session);
  setItem(KEYS.CURRENT_USER, user);
}

export function getSession() {
  try {
    const session = getItem(KEYS.SESSION, null);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      // Sessió caducada → netejar
      localStorage.removeItem(KEYS.SESSION);
      localStorage.removeItem(KEYS.CURRENT_USER);
      return null;
    }
    return session.user;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(KEYS.SESSION);
  localStorage.removeItem(KEYS.CURRENT_USER);
}

function getItem(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

// Inicialització amb dades per defecte si no existeixen
export function initDatabase() {
  if (!localStorage.getItem(KEYS.USERS)) {
    setItem(KEYS.USERS, INITIAL_USERS);
  }
  if (!localStorage.getItem(KEYS.ALBUMS)) {
    setItem(KEYS.ALBUMS, INITIAL_ALBUMS);
  } else {
    const albums = getItem(KEYS.ALBUMS, INITIAL_ALBUMS);
    const albumsWithoutPlaceholderCovers = albums.map((album) => (
      album.cover_url && !isSpotifyArtwork(album.cover_url)
        ? { ...album, cover_url: null }
        : album
    ));
    if (albumsWithoutPlaceholderCovers.some((album, index) => album !== albums[index])) {
      setItem(KEYS.ALBUMS, albumsWithoutPlaceholderCovers);
    }
  }
  if (!localStorage.getItem(KEYS.REVIEWS)) {
    setItem(KEYS.REVIEWS, INITIAL_REVIEWS);
  }
  if (!localStorage.getItem(KEYS.PLAYLISTS)) {
    setItem(KEYS.PLAYLISTS, INITIAL_PLAYLISTS);
  }
  if (!localStorage.getItem(KEYS.PLAYLIST_ALBUMS)) {
    setItem(KEYS.PLAYLIST_ALBUMS, INITIAL_PLAYLIST_ALBUMS);
  }
  if (!localStorage.getItem(KEYS.LISTENLIST)) {
    setItem(KEYS.LISTENLIST, INITIAL_LISTENLIST);
  }
  if (!localStorage.getItem(KEYS.CURRENT_USER)) {
    // Inicia per defecte amb l'usuari meloman_cat per facilitar proves immediates
    setItem(KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }
}

// ----------------- USERS -----------------
export function getUsers() {
  return getItem(KEYS.USERS, INITIAL_USERS);
}

export function getCurrentUser() {
  return getSession();
}

export function setCurrentUser(user) {
  saveSession(user);
}

export function registerUser({ username, email, password, name = '', googleId = null, avatar = null }) {
  const users = getUsers();
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Aquest nom d\'usuari ja està en ús.');
  }
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Aquest correu electrònic ja està registrat.');
  }

  const newUser = {
    id: Date.now(),
    username: username.trim(),
    name: name.trim() || username.trim(),
    email: email.trim().toLowerCase(),
    password: googleId ? null : password, // Google users no guarden contrasenya
    googleId: googleId || null,
    role: 'user',
    avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}`,
    bio: 'Nou membre apassionat per la música a SoundBoxd.',
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  setItem(KEYS.USERS, users);
  saveSession(newUser);
  return newUser;
}

export function loginUser({ email, password }) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    throw new Error('Credencials incorrectes. Comprova el correu o contrasenya.');
  }
  saveSession(user);
  return user;
}

export function loginWithGoogle({ googleId, email, name, avatar }) {
  const users = getUsers();
  // Buscar usuari existent per Google ID o email
  let user = users.find(u => u.googleId === googleId || u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    // Actualitzar dades de Google si cal
    if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = avatar || user.avatar;
      const index = users.findIndex(u => u.id === user.id);
      users[index] = user;
      setItem(KEYS.USERS, users);
    }
    saveSession(user);
    return { user, isNew: false };
  }

  // Usuari nou via Google → crear compte automàticament
  const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
  let finalUsername = username;
  let counter = 1;
  while (users.some(u => u.username.toLowerCase() === finalUsername.toLowerCase())) {
    finalUsername = `${username}${counter++}`;
  }

  const newUser = {
    id: Date.now(),
    username: finalUsername,
    name: name || finalUsername,
    email: email.toLowerCase(),
    password: null,
    googleId,
    role: 'user',
    avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(finalUsername)}`,
    bio: 'Nou membre apassionat per la música a SoundBoxd.',
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  setItem(KEYS.USERS, users);
  saveSession(newUser);
  return { user: newUser, isNew: true };
}

export function logoutUser() {
  clearSession();
}

// ----------------- ALBUMS -----------------
export function getAlbums() {
  return getItem(KEYS.ALBUMS, INITIAL_ALBUMS);
}

export function getAlbumById(id) {
  const albums = getAlbums();
  return albums.find(a => a.id === id) || null;
}

export function saveAlbum(albumData) {
  const albums = getAlbums();
  const index = albums.findIndex(a => a.id === albumData.id);
  if (index >= 0) {
    albums[index] = { ...albums[index], ...albumData };
  } else {
    albums.push(albumData);
  }
  setItem(KEYS.ALBUMS, albums);
  return albumData;
}

export function updateAlbumCover(albumId, coverUrl) {
  const albums = getAlbums();
  const album = albums.find((item) => item.id === albumId);
  if (!album || album.cover_url === coverUrl) return false;

  album.cover_url = coverUrl;
  setItem(KEYS.ALBUMS, albums);
  return true;
}

function isSpotifyArtwork(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.endsWith('.scdn.co') || hostname.endsWith('.spotifycdn.com');
  } catch {
    return false;
  }
}

// ----------------- REVIEWS -----------------
export function getReviews() {
  return getItem(KEYS.REVIEWS, INITIAL_REVIEWS);
}

export function getReviewsByAlbum(albumId) {
  const reviews = getReviews();
  const users = getUsers();
  return reviews
    .filter(r => (r.review_type || 'album') === 'album' && r.album_id === albumId)
    .map(r => ({
      ...r,
      user: users.find(u => u.id === r.user_id) || { username: 'Usuari anònim', avatar: '' }
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getReviewsByTrack(trackId) {
  const reviews = getReviews();
  const users = getUsers();
  return reviews
    .filter((review) => review.review_type === 'track' && review.track_id === trackId)
    .map((review) => ({
      ...review,
      user: users.find((user) => user.id === review.user_id) || { username: 'Usuari anònim', avatar: '' }
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getReviewsByUser(userId) {
  const reviews = getReviews();
  const albums = getAlbums();
  return reviews
    .filter(r => r.user_id === userId)
    .map(r => ({
      ...r,
      album: r.review_type === 'track'
        ? { id: r.album_id, title: r.track_album || 'Cançó', artist: r.track_artist || '', cover_url: r.track_cover_url }
        : albums.find(a => a.id === r.album_id) || { title: 'Àlbum desconegut', artist: '' }
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getAlbumRatingStats(albumId) {
  const reviews = getReviews().filter(r => (r.review_type || 'album') === 'album' && r.album_id === albumId);
  if (reviews.length === 0) {
    return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
  }
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
  const average = Number((sum / reviews.length).toFixed(2));
  const distribution = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    const starIndex = Math.min(Math.max(Math.round(r.rating) - 1, 0), 4);
    distribution[starIndex]++;
  });
  return { average, count: reviews.length, distribution };
}

export function addOrUpdateReview({
  id,
  userId,
  albumId,
  rating,
  reviewText,
  albumMeta,
  reviewType = 'album',
  trackId = null,
  trackMeta = null
}) {
  if ((reviewText || '').length > 2000) {
    throw new Error('La ressenya no pot superar el límit de 2000 caràcters.');
  }
  if (!['album', 'track'].includes(reviewType)) {
    throw new Error('El tipus de ressenya no és vàlid.');
  }
  if (reviewType === 'track' && (!trackId || !trackMeta?.title)) {
    throw new Error('Falten les dades de la cançó per publicar el comentari.');
  }
  if (!Number.isFinite(Number(rating)) || Number(rating) < 0.1 || Number(rating) > 5 || Math.abs(Number(rating) * 10 - Math.round(Number(rating) * 10)) > 1e-8) {
    throw new Error('La valoració ha d’estar entre 0,1 i 5, en increments de 0,1.');
  }

  if (reviewType === 'album' && albumMeta) {
    saveAlbum(albumMeta);
  }

  const reviews = getReviews();
  const numericRating = Number(rating);
  const metadata = reviewType === 'track'
    ? {
        review_type: 'track',
        track_id: trackId,
        track_title: trackMeta?.title || '',
        track_artist: trackMeta?.artist || '',
        track_album: trackMeta?.album || '',
        track_cover_url: trackMeta?.cover_url || null
      }
    : { review_type: 'album' };

  if (id) {
    // Actualitzar ressenya existent
    const index = reviews.findIndex(r => r.id === id);
    if (index >= 0) {
      reviews[index] = {
        ...reviews[index],
        ...metadata,
        rating: numericRating,
        review_text: (reviewText || '').trim(),
        updated_at: new Date().toISOString()
      };
      setItem(KEYS.REVIEWS, reviews);
      return reviews[index];
    }
  }

  // Comprovar si aquest usuari ja tenia una ressenya per aquest àlbum
  const existingIndex = reviewType === 'track'
    ? reviews.findIndex((review) => (
        review.user_id === userId &&
        review.review_type === 'track' &&
        review.track_id === trackId
      ))
    : reviews.findIndex((review) => (
        review.user_id === userId &&
        (review.review_type || 'album') === 'album' &&
        review.album_id === albumId
      ));
  if (existingIndex >= 0) {
    reviews[existingIndex] = {
      ...reviews[existingIndex],
      ...metadata,
      rating: numericRating,
      review_text: (reviewText || '').trim(),
      updated_at: new Date().toISOString()
    };
    setItem(KEYS.REVIEWS, reviews);
    return reviews[existingIndex];
  }

  // Crear nova ressenya
  const newReview = {
    id: Date.now(),
    user_id: userId,
    album_id: albumId,
    ...metadata,
    rating: numericRating,
    review_text: (reviewText || '').trim(),
    created_at: new Date().toISOString()
  };

  reviews.unshift(newReview);
  setItem(KEYS.REVIEWS, reviews);
  return newReview;
}

export function deleteReview(reviewId, currentUserId, userRole) {
  const reviews = getReviews();
  const target = reviews.find(r => r.id === reviewId);
  if (!target) return false;

  // Permís: o és l'autor o és administrador (RF-08, RF-09)
  if (target.user_id !== currentUserId && userRole !== 'admin') {
    throw new Error('No tens permisos per eliminar aquesta ressenya.');
  }

  const filtered = reviews.filter(r => r.id !== reviewId);
  setItem(KEYS.REVIEWS, filtered);
  return true;
}

// ----------------- LISTENLIST (Escoltar més tard) -----------------
export function getListenlist(userId) {
  const list = getItem(KEYS.LISTENLIST, INITIAL_LISTENLIST);
  const albums = getAlbums();
  return list
    .filter(item => item.user_id === userId)
    .map(item => ({
      ...item,
      album: albums.find(a => a.id === item.album_id)
    }))
    .filter(item => item.album !== undefined)
    .sort((a, b) => new Date(b.added_at) - new Date(a.added_at));
}

export function isInListenlist(userId, albumId) {
  if (!userId) return false;
  const list = getItem(KEYS.LISTENLIST, INITIAL_LISTENLIST);
  return list.some(item => item.user_id === userId && item.album_id === albumId);
}

export function toggleListenlist(userId, albumId, albumMeta) {
  if (!userId) throw new Error('Cal iniciar sessió per desar a la llista d\'escolta.');
  if (albumMeta) {
    saveAlbum(albumMeta);
  }
  const list = getItem(KEYS.LISTENLIST, INITIAL_LISTENLIST);
  const exists = list.some(item => item.user_id === userId && item.album_id === albumId);

  let updated;
  if (exists) {
    updated = list.filter(item => !(item.user_id === userId && item.album_id === albumId));
  } else {
    updated = [{ user_id: userId, album_id: albumId, added_at: new Date().toISOString() }, ...list];
  }
  setItem(KEYS.LISTENLIST, updated);
  return !exists;
}

// ----------------- PLAYLISTS -----------------
export function getPlaylists() {
  return getItem(KEYS.PLAYLISTS, INITIAL_PLAYLISTS);
}

export function getPlaylistById(playlistId) {
  const playlists = getPlaylists();
  const playlist = playlists.find(p => String(p.id) === String(playlistId));
  if (!playlist) return null;

  const users = getUsers();
  const playlistAlbums = getItem(KEYS.PLAYLIST_ALBUMS, INITIAL_PLAYLIST_ALBUMS);
  const albums = getAlbums();

  const author = users.find(u => u.id === playlist.user_id) || { username: 'Anònim' };
  const items = playlistAlbums
    .filter(pa => pa.playlist_id === playlist.id)
    .map(pa => ({
      ...pa,
      album: albums.find(a => a.id === pa.album_id)
    }))
    .filter(pa => pa.album !== undefined);

  return {
    ...playlist,
    author,
    albums: items,
    tracks: Array.isArray(playlist.tracks) ? playlist.tracks : []
  };
}

export function replacePlaylistId(localId, sharedId) {
  const playlists = getPlaylists();
  const playlist = playlists.find((item) => String(item.id) === String(localId));
  if (!playlist) return false;

  playlist.id = sharedId;
  setItem(KEYS.PLAYLISTS, playlists);

  const playlistAlbums = getItem(KEYS.PLAYLIST_ALBUMS, INITIAL_PLAYLIST_ALBUMS)
    .map((item) => (
      String(item.playlist_id) === String(localId)
        ? { ...item, playlist_id: sharedId }
        : item
    ));
  setItem(KEYS.PLAYLIST_ALBUMS, playlistAlbums);
  return true;
}

export function getUserPlaylists(userId) {
  const playlists = getPlaylists();
  return playlists.filter(p => p.user_id === userId);
}

export function createPlaylist({ userId, title, description, isPublic = true, tracks = [] }) {
  if (!title || title.trim().length === 0) {
    throw new Error('El títol de la llista és obligatori.');
  }
  const playlists = getPlaylists();
  const newPlaylist = {
    id: Date.now(),
    user_id: userId,
    title: title.trim(),
    description: (description || '').trim(),
    is_public: isPublic,
    tracks: Array.isArray(tracks) ? tracks : [],
    created_at: new Date().toISOString()
  };
  playlists.unshift(newPlaylist);
  setItem(KEYS.PLAYLISTS, playlists);
  return newPlaylist;
}

export function addAlbumToPlaylist(playlistId, albumId, albumMeta) {
  if (albumMeta) {
    saveAlbum(albumMeta);
  }
  const playlistAlbums = getItem(KEYS.PLAYLIST_ALBUMS, INITIAL_PLAYLIST_ALBUMS);
  const exists = playlistAlbums.some(pa => pa.playlist_id === Number(playlistId) && pa.album_id === albumId);
  if (!exists) {
    playlistAlbums.push({
      playlist_id: Number(playlistId),
      album_id: albumId,
      added_at: new Date().toISOString()
    });
    setItem(KEYS.PLAYLIST_ALBUMS, playlistAlbums);
  }
  return true;
}

function normalizeTrackValue(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase();
}

export function tracksMatch(first, second) {
  const firstIsSpotifyTrack = /^[A-Za-z0-9]{22}$/.test(first.id || '');
  const secondIsSpotifyTrack = /^[A-Za-z0-9]{22}$/.test(second.id || '');
  if (firstIsSpotifyTrack && secondIsSpotifyTrack) return first.id === second.id;
  return (
    normalizeTrackValue(first.title) === normalizeTrackValue(second.title)
    && normalizeTrackValue(first.artist) === normalizeTrackValue(second.artist)
    && normalizeTrackValue(first.album) === normalizeTrackValue(second.album)
  ) || Boolean(first.id && second.id && first.id === second.id && (!first.title || !second.title));
}

function getManageablePlaylist(playlistId, currentUserId, userRole) {
  const playlists = getPlaylists();
  const playlist = playlists.find(item => item.id === Number(playlistId));
  if (!playlist) throw new Error('No s’ha trobat la llista.');
  if (playlist.user_id !== currentUserId && userRole !== 'admin') {
    throw new Error('No tens permís per modificar aquesta llista.');
  }
  return { playlists, playlist };
}

export function addTrackToPlaylist(playlistId, track, currentUserId, userRole) {
  if (!track?.title || !track?.artist) {
    throw new Error('La cançó no té prou informació per afegir-la a la llista.');
  }

  const { playlists, playlist } = getManageablePlaylist(playlistId, currentUserId, userRole);
  const tracks = Array.isArray(playlist.tracks) ? playlist.tracks : [];
  if (tracks.some(existing => tracksMatch(existing, track))) return false;

  playlist.tracks = [...tracks, track];
  setItem(KEYS.PLAYLISTS, playlists);
  return true;
}

export function removeTrackFromPlaylist(playlistId, track, currentUserId, userRole) {
  const { playlists, playlist } = getManageablePlaylist(playlistId, currentUserId, userRole);
  const tracks = Array.isArray(playlist.tracks) ? playlist.tracks : [];
  const updatedTracks = tracks.filter(existing => !tracksMatch(existing, track));
  if (updatedTracks.length === tracks.length) return false;

  playlist.tracks = updatedTracks;
  setItem(KEYS.PLAYLISTS, playlists);
  return true;
}

export function removeAlbumFromPlaylist(playlistId, albumId) {
  const playlistAlbums = getItem(KEYS.PLAYLIST_ALBUMS, INITIAL_PLAYLIST_ALBUMS);
  const updated = playlistAlbums.filter(pa => !(pa.playlist_id === Number(playlistId) && pa.album_id === albumId));
  setItem(KEYS.PLAYLIST_ALBUMS, updated);
  return true;
}

export function deletePlaylist(playlistId, currentUserId, userRole) {
  const playlists = getPlaylists();
  const target = playlists.find(p => p.id === Number(playlistId));
  if (!target) return false;
  if (target.user_id !== currentUserId && userRole !== 'admin') {
    throw new Error('No tens permís per eliminar aquesta llista.');
  }

  // Cascade delete in playlist_albums
  const playlistAlbums = getItem(KEYS.PLAYLIST_ALBUMS, INITIAL_PLAYLIST_ALBUMS);
  setItem(KEYS.PLAYLIST_ALBUMS, playlistAlbums.filter(pa => pa.playlist_id !== Number(playlistId)));

  const updatedPlaylists = playlists.filter(p => p.id !== Number(playlistId));
  setItem(KEYS.PLAYLISTS, updatedPlaylists);
  return true;
}
