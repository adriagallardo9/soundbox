function jsonError(status, message) {
  return Response.json({ error: message }, { status });
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

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

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

    return env.ASSETS.fetch(request);
  },
};
