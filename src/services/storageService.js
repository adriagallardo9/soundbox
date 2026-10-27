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
  CURRENT_USER: 'soundboxd_current_user_v1'
};

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
  return getItem(KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user) {
  setItem(KEYS.CURRENT_USER, user);
}

export function registerUser({ username, email, password, name = '' }) {
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
    password, // En producció s'utilitzaria bcrypt
    role: 'user',
    avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}`,
    bio: 'Nou membre apassionat per la música a SoundBoxd.',
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  setItem(KEYS.USERS, users);
  setCurrentUser(newUser);
  return newUser;
}

export function loginUser({ email, password }) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    throw new Error('Credencials incorrectes. Comprova el correu o contrasenya.');
  }
  setCurrentUser(user);
  return user;
}

export function logoutUser() {
  localStorage.removeItem(KEYS.CURRENT_USER);
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
    .filter(r => r.album_id === albumId)
    .map(r => ({
      ...r,
      user: users.find(u => u.id === r.user_id) || { username: 'Usuari anònim', avatar: '' }
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
      album: albums.find(a => a.id === r.album_id) || { title: 'Àlbum desconegut', artist: '' }
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getAlbumRatingStats(albumId) {
  const reviews = getReviews().filter(r => r.album_id === albumId);
  if (reviews.length === 0) {
    return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
  }
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
  const average = Number((sum / reviews.length).toFixed(1));
  const distribution = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    const starIndex = Math.min(Math.max(Math.round(r.rating) - 1, 0), 4);
    distribution[starIndex]++;
  });
  return { average, count: reviews.length, distribution };
}

export function addOrUpdateReview({ id, userId, albumId, rating, reviewText, albumMeta }) {
  if (!reviewText || reviewText.trim().length === 0) {
    throw new Error('El camp de text de la ressenya no pot estar buit.');
  }
  if (reviewText.length > 2000) {
    throw new Error('La ressenya no pot superar el límit de 2000 caràcters.');
  }

  // Assegura que l'àlbum estigui guardat a la BDD local
  if (albumMeta) {
    saveAlbum(albumMeta);
  }

  const reviews = getReviews();
  const numericRating = Number(rating);

  if (id) {
    // Actualitzar ressenya existent
    const index = reviews.findIndex(r => r.id === id);
    if (index >= 0) {
      reviews[index] = {
        ...reviews[index],
        rating: numericRating,
        review_text: reviewText.trim(),
        updated_at: new Date().toISOString()
      };
      setItem(KEYS.REVIEWS, reviews);
      return reviews[index];
    }
  }

  // Comprovar si aquest usuari ja tenia una ressenya per aquest àlbum
  const existingIndex = reviews.findIndex(r => r.user_id === userId && r.album_id === albumId);
  if (existingIndex >= 0) {
    reviews[existingIndex] = {
      ...reviews[existingIndex],
      rating: numericRating,
      review_text: reviewText.trim(),
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
    rating: numericRating,
    review_text: reviewText.trim(),
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
  const playlist = playlists.find(p => p.id === Number(playlistId));
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
    albums: items
  };
}

export function getUserPlaylists(userId) {
  const playlists = getPlaylists();
  return playlists.filter(p => p.user_id === userId);
}

export function createPlaylist({ userId, title, description, isPublic = true }) {
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
