async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('El servidor no ha retornat una resposta vàlida.');
  }

  if (!response.ok) {
    throw new Error(result.error || 'No s’ha pogut completar l’operació.');
  }
  return result;
}

export function establishGoogleSession(accessToken) {
  return request('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ accessToken }),
  });
}

export function getCloudSession() {
  return request('/api/auth/session');
}

export function clearCloudSession() {
  return request('/api/auth/logout', { method: 'POST' });
}

export function getSharedPlaylists() {
  return request('/api/playlists');
}

export function createSharedPlaylist(playlist) {
  return request('/api/playlists', {
    method: 'POST',
    body: JSON.stringify(playlist),
  });
}

export function importSharedPlaylist(playlist) {
  return request('/api/playlists', {
    method: 'POST',
    body: JSON.stringify(playlist),
  });
}

export function updateSharedPlaylist(playlistId, changes) {
  return request(`/api/playlists/${encodeURIComponent(playlistId)}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}

export function deleteSharedPlaylist(playlistId) {
  return request(`/api/playlists/${encodeURIComponent(playlistId)}`, {
    method: 'DELETE',
  });
}

export function rateSharedPlaylist(playlistId, rating) {
  return request(`/api/playlists/${encodeURIComponent(playlistId)}/ratings`, {
    method: 'POST',
    body: JSON.stringify({ rating }),
  });
}

export function recordSharedPlaylistView(playlistId) {
  return request(`/api/playlists/${encodeURIComponent(playlistId)}/views`, {
    method: 'POST',
  });
}
