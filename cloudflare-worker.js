function jsonError(status, message) {
  return Response.json({ error: message }, { status });
}

function jsonResponse(data, init = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      ...init.headers,
    },
  });
}

function base64UrlEncodeBytes(bytes) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function base64UrlEncode(value) {
  return base64UrlEncodeBytes(new TextEncoder().encode(value));
}

function base64UrlDecode(value) {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function getSigningKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function signSession(user, env) {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14;
  const payload = base64UrlEncode(JSON.stringify({ user, expiresAt }));
  const key = await getSigningKey(env.SESSION_SECRET);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const signatureText = base64UrlEncodeBytes(new Uint8Array(signature));
  return `${payload}.${signatureText}`;
}

async function readSession(request, env) {
  if (!env.SESSION_SECRET) return null;
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)soundbox_session=([^;]+)/);
  if (!match) return null;

  try {
    const [payload, signature] = match[1].split('.');
    if (!payload || !signature) return null;
    const key = await getSigningKey(env.SESSION_SECRET);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlDecode(signature),
      new TextEncoder().encode(payload),
    );
    if (!valid) return null;

    const session = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
    if (session.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return session.user;
  } catch {
    return null;
  }
}

function sessionCookie(value, request, maxAge) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `soundbox_session=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function visitorCookie(value, request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `soundbox_visitor=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure}`;
}

function getCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const prefix = `${name}=`;
  const entry = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return entry ? entry.slice(prefix.length) : null;
}

function requireDatabase(env) {
  return env.DB ? null : jsonError(503, 'La base de dades compartida no està configurada al Worker.');
}

function validatePlaylistItems(value, field, maxItems) {
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new Error(`El camp ${field} no és vàlid.`);
  }
  if (JSON.stringify(value).length > 100_000) {
    throw new Error(`El camp ${field} supera la mida màxima permesa.`);
  }
  return JSON.stringify(value);
}

function formatPlaylist(row) {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.owner_user_id ?? row.owner_google_id,
    owner_google_id: row.owner_google_id,
    title: row.title,
    description: row.description,
    is_public: true,
    tracks: JSON.parse(row.tracks_json),
    albums: JSON.parse(row.albums_json).map((album) => ({ album })),
    created_at: row.created_at,
    author: { username: row.author_name },
    views: row.views,
    average_rating: row.average_rating ? Number(Number(row.average_rating).toFixed(2)) : 0,
    rating_count: row.rating_count,
    user_rating: row.user_rating ?? null,
  };
}

const PLAYLIST_STATS_QUERY = `
    SELECT p.id, p.owner_google_id, p.owner_user_id, p.author_name, p.title, p.description,
      p.tracks_json, p.albums_json, p.created_at,
      (SELECT COUNT(*) FROM playlist_views v WHERE v.playlist_id = p.id) AS views,
      (SELECT AVG(r.rating) FROM playlist_ratings r WHERE r.playlist_id = p.id) AS average_rating,
      (SELECT COUNT(*) FROM playlist_ratings r WHERE r.playlist_id = p.id) AS rating_count,
      own.rating AS user_rating
    FROM shared_playlists p
    LEFT JOIN playlist_ratings own
      ON own.playlist_id = p.id AND own.google_user_id = ?
`;

async function getPlaylistStats(env, playlistId, userId = null) {
  const row = await env.DB.prepare(`${PLAYLIST_STATS_QUERY} WHERE p.id = ?`)
    .bind(userId, playlistId)
    .first();
  return formatPlaylist(row);
}

async function listSharedPlaylists(env, userId) {
  const { results } = await env.DB.prepare(`${PLAYLIST_STATS_QUERY} ORDER BY p.created_at DESC`)
    .bind(userId)
    .all();
  return results.map(formatPlaylist);
}

function requireUser(user) {
  return user || jsonError(401, 'Inicia sessió amb Google per fer aquesta acció.');
}

async function handleGoogleSession(request, env) {
  if (request.method !== 'POST') return jsonError(405, 'Mètode no permès.');
  if (!env.GOOGLE_CLIENT_ID || !env.SESSION_SECRET) {
    return jsonError(503, 'Falta configurar Google OAuth o el secret de sessió al Worker.');
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'La petició no és vàlida.');
  }
  if (typeof body.accessToken !== 'string' || body.accessToken.length < 20) {
    return jsonError(400, 'El token de Google no és vàlid.');
  }

  const verification = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(body.accessToken)}`,
  );
  if (!verification.ok) return jsonError(401, 'La sessió de Google no és vàlida o ha caducat.');
  const tokenInfo = await verification.json();
  const audiences = [tokenInfo.aud, tokenInfo.issued_to, tokenInfo.audience, tokenInfo.azp];
  if (
    !audiences.includes(env.GOOGLE_CLIENT_ID)
    || !Number.isFinite(Number(tokenInfo.expires_in))
    || Number(tokenInfo.expires_in) <= 0
  ) {
    return jsonError(401, 'El token no pertany a aquest client de Google.');
  }

  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${body.accessToken}` },
  });
  if (!profileResponse.ok) return jsonError(401, 'No s’ha pogut verificar el perfil de Google.');
  const profile = await profileResponse.json();
  if (
    !profile.sub
    || !profile.email
    || ![true, 'true'].includes(profile.email_verified)
    || (tokenInfo.user_id && tokenInfo.user_id !== profile.sub)
  ) {
    return jsonError(401, 'El compte de Google no té una adreça de correu verificada.');
  }

  const user = {
    sub: profile.sub,
    name: profile.name || profile.email.split('@')[0],
    email: profile.email,
    picture: profile.picture || null,
  };
  const token = await signSession(user, env);
  return jsonResponse({ user }, {
    headers: { 'Set-Cookie': sessionCookie(token, request, 60 * 60 * 24 * 14) },
  });
}

async function handlePlaylistApi(request, env) {
  const { pathname } = new URL(request.url);
  const user = await readSession(request, env);

  if (pathname === '/api/auth/google') return handleGoogleSession(request, env);
  if (pathname === '/api/auth/session' && request.method === 'GET') {
    return jsonResponse({ user: user || null });
  }
  if (pathname === '/api/auth/logout' && request.method === 'POST') {
    return jsonResponse({ ok: true }, {
      headers: { 'Set-Cookie': sessionCookie('', request, 0) },
    });
  }

  const unavailable = requireDatabase(env);
  if (unavailable) return unavailable;

  if (pathname === '/api/playlists' && request.method === 'GET') {
    return jsonResponse({ playlists: await listSharedPlaylists(env, user?.sub || null) });
  }

  if (pathname === '/api/playlists' && request.method === 'POST') {
    const authenticatedUser = requireUser(user);
    if (authenticatedUser instanceof Response) return authenticatedUser;

    let body;
    try {
      body = await request.json();
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      const description = typeof body.description === 'string' ? body.description.trim() : '';
      if (!title || title.length > 100 || description.length > 1000) {
        return jsonError(400, 'El títol o la descripció de la llista no són vàlids.');
      }

      const tracks = validatePlaylistItems(body.tracks || [], 'cançons', 200);
      const albums = validatePlaylistItems(body.albums || [], 'àlbums', 100);
      const sourceLocalId = body.sourceLocalId == null ? null : Number(body.sourceLocalId);
      if (sourceLocalId !== null && (!Number.isSafeInteger(sourceLocalId) || sourceLocalId < 1)) {
        return jsonError(400, 'La identificació de la llista importada no és vàlida.');
      }
      const id = sourceLocalId === null
        ? crypto.randomUUID()
        : `legacy-${authenticatedUser.sub}-${sourceLocalId}`;
      await env.DB.prepare(`
        INSERT OR IGNORE INTO shared_playlists
          (id, owner_google_id, author_name, title, description, tracks_json, albums_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        authenticatedUser.sub,
        authenticatedUser.name,
        title,
        description,
        tracks,
        albums,
        new Date().toISOString(),
      ).run();
      return jsonResponse({ playlist: await getPlaylistStats(env, id, authenticatedUser.sub) }, { status: 201 });
    } catch (error) {
      if (error instanceof SyntaxError) return jsonError(400, 'La petició no és un JSON vàlid.');
      if (error instanceof Error && !error.message.includes('D1')) {
        return jsonError(400, error.message);
      }
      console.error('Could not create shared playlist:', error);
      return jsonError(500, 'No s’ha pogut crear la llista pública.');
    }
  }

  const match = pathname.match(/^\/api\/playlists\/([^/]+)(?:\/(ratings|views))?$/);
  if (!match) return jsonError(404, 'Ruta API no trobada.');
  const playlistId = decodeURIComponent(match[1]);
  const action = match[2] || null;
  const playlist = await getPlaylistStats(env, playlistId, user?.sub || null);
  if (!playlist) return jsonError(404, 'No s’ha trobat la llista pública.');

  if (!action && request.method === 'GET') {
    return jsonResponse({ playlist });
  }

  if (action === 'views' && request.method === 'POST') {
    let visitorId = getCookie(request, 'soundbox_visitor');
    let createdVisitor = false;
    if (!visitorId || !/^[0-9a-f-]{36}$/i.test(visitorId)) {
      visitorId = crypto.randomUUID();
      createdVisitor = true;
    }
    const visitorHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(`${env.SESSION_SECRET || ''}:${visitorId}`),
    );
    const hashText = Array.from(new Uint8Array(visitorHash), (byte) => byte.toString(16).padStart(2, '0')).join('');
    await env.DB.prepare(`
      INSERT OR IGNORE INTO playlist_views (playlist_id, visitor_hash, viewed_on)
      VALUES (?, ?, date('now'))
    `).bind(playlistId, hashText).run();
    const headers = createdVisitor ? { 'Set-Cookie': visitorCookie(visitorId, request) } : {};
    return jsonResponse({ playlist: await getPlaylistStats(env, playlistId, user?.sub || null) }, { headers });
  }

  if (action === 'ratings' && request.method === 'POST') {
    const authenticatedUser = requireUser(user);
    if (authenticatedUser instanceof Response) return authenticatedUser;

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonError(400, 'La petició no és un JSON vàlid.');
    }
    const rating = Number(body.rating);
    if (!Number.isFinite(rating) || rating < 0.1 || rating > 5 || Math.abs(rating * 10 - Math.round(rating * 10)) > 1e-8) {
      return jsonError(400, 'La valoració ha d’estar entre 0,1 i 5, en increments de 0,1.');
    }
    await env.DB.prepare(`
      INSERT INTO playlist_ratings (playlist_id, google_user_id, rating, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(playlist_id, google_user_id)
      DO UPDATE SET rating = excluded.rating, updated_at = excluded.updated_at
    `).bind(playlistId, authenticatedUser.sub, rating, new Date().toISOString()).run();
    return jsonResponse({ playlist: await getPlaylistStats(env, playlistId, authenticatedUser.sub) });
  }

  if (!action && request.method === 'PATCH') {
    const authenticatedUser = requireUser(user);
    if (authenticatedUser instanceof Response) return authenticatedUser;

    let body;
    try {
      body = await request.json();
      const updates = [];
      const values = [];
      if (Object.hasOwn(body, 'tracks')) {
        updates.push('tracks_json = ?');
        values.push(validatePlaylistItems(body.tracks, 'cançons', 200));
      }
      if (Object.hasOwn(body, 'albums')) {
        updates.push('albums_json = ?');
        values.push(validatePlaylistItems(body.albums, 'àlbums', 100));
      }
      if (!updates.length) return jsonError(400, 'No hi ha cap camp modificable.');
      values.push(playlistId, authenticatedUser.sub);
      const result = await env.DB.prepare(
        `UPDATE shared_playlists SET ${updates.join(', ')} WHERE id = ? AND owner_google_id = ?`,
      ).bind(...values).run();
      if (!result.meta.changes) return jsonError(403, 'No tens permís per modificar aquesta llista.');
      return jsonResponse({ playlist: await getPlaylistStats(env, playlistId, authenticatedUser.sub) });
    } catch (error) {
      if (error instanceof SyntaxError) return jsonError(400, 'La petició no és un JSON vàlid.');
      if (error instanceof Error && !error.message.includes('D1')) return jsonError(400, error.message);
      console.error('Could not update shared playlist:', error);
      return jsonError(500, 'No s’ha pogut actualitzar la llista pública.');
    }
  }

  if (!action && request.method === 'DELETE') {
    const authenticatedUser = requireUser(user);
    if (authenticatedUser instanceof Response) return authenticatedUser;
    const result = await env.DB.prepare(
      'DELETE FROM shared_playlists WHERE id = ? AND owner_google_id = ?',
    ).bind(playlistId, authenticatedUser.sub).run();
    if (!result.meta.changes) return jsonError(403, 'No tens permís per eliminar aquesta llista.');
    return jsonResponse({ ok: true });
  }

  return jsonError(405, 'Mètode no permès.');
}

async function getSpotifyToken(env) {
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET) {
    return jsonError(500, 'Spotify credentials are not configured on this Worker.');
  }

  const credentials = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function proxySpotifyApi(request) {
  if (request.method !== 'GET') {
    return jsonError(405, 'Only GET requests are supported.');
  }

  const requestUrl = new URL(request.url);
  const spotifyPath = requestUrl.pathname.replace(/^\/spotify-api/, '');
  if (!spotifyPath.startsWith('/v1/')) {
    return jsonError(404, 'Spotify API route not found.');
  }

  const headers = new Headers();
  const authorization = request.headers.get('Authorization');
  if (authorization) headers.set('Authorization', authorization);
  headers.set('Accept', 'application/json');

  const spotifyUrl = new URL(`https://api.spotify.com${spotifyPath}${requestUrl.search}`);
  const response = await fetch(spotifyUrl, { headers });
  const responseHeaders = new Headers(response.headers);
  responseHeaders.set('Cache-Control', 'no-store');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

async function serveAsset(request, env) {
  const response = await env.ASSETS.fetch(request);
  if (!response.headers.get('Content-Type')?.toLowerCase().includes('text/html')) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith('/api/')) {
      try {
        return await handlePlaylistApi(request, env);
      } catch (error) {
        console.error('Shared playlist API request failed:', error);
        return jsonError(500, 'No s’ha pogut completar la petició.');
      }
    }

    if (pathname === '/spotify-token') {
      if (request.method !== 'POST') {
        return jsonError(405, 'Only POST requests are supported.');
      }
      try {
        return await getSpotifyToken(env);
      } catch (error) {
        console.error('Spotify token request failed:', error);
        return jsonError(502, 'Could not obtain a Spotify access token.');
      }
    }

    if (pathname.startsWith('/spotify-api/')) {
      try {
        return await proxySpotifyApi(request);
      } catch (error) {
        console.error('Spotify API request failed:', error);
        return jsonError(502, 'Could not reach the Spotify Web API.');
      }
    }

    return serveAsset(request, env);
  },
};
