import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { searchAll } from '../services/spotifyApi';
import { X, Plus, Search, Music, Loader2 } from 'lucide-react';

function normalizeTrackValue(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase();
}

function getTrackIdentity(track) {
  return [
    normalizeTrackValue(track.title),
    normalizeTrackValue(track.artist),
    normalizeTrackValue(track.album),
  ].join('|');
}

export default function AddTrackToPlaylistModal({
  isOpen,
  onClose,
  track = null,
  playlistId = null,
  existingTracks = [],
}) {
  const { currentUser } = useAuth();
  const { allAlbums, allPlaylists, addTrackToUserPlaylist } = useData();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !currentUser) return null;

  const playlists = allPlaylists.filter((playlist) => (
    playlist.user_id === currentUser.id || playlist.owner_google_id === currentUser.googleId
  ));
  const targetPlaylist = playlistId == null
    ? null
    : allPlaylists.find((playlist) => String(playlist.id) === String(playlistId));

  const findLocalTracks = (searchQuery) => {
    const normalizedQuery = normalizeTrackValue(searchQuery);
    return allAlbums.flatMap((album) => (album.tracks || [])
      .map((item) => ({
        ...item,
        _type: 'track',
        artist: item.artist || album.artist,
        album: item.album || album.title,
        albumId: item.albumId || album.id,
        cover_url: item.cover_url || album.cover_url,
      }))
      .filter((item) => normalizeTrackValue(`${item.title} ${item.artist} ${item.album}`).includes(normalizedQuery)));
  };

  const searchTracks = async () => {
    const searchQuery = query.trim();
    if (searchQuery.length < 2) {
      setError('Escriu almenys dues lletres per cercar cançons.');
      return;
    }

    setSearching(true);
    setError('');
    setHasSearched(true);
    try {
      const data = await searchAll(searchQuery);
      const seen = new Set();
      const foundTracks = [...(data.tracks || []), ...findLocalTracks(searchQuery)]
        .filter((item) => {
          const identity = getTrackIdentity(item);
          if (seen.has(identity)) return false;
          seen.add(identity);
          return true;
        });
      setResults(foundTracks.slice(0, 12));
      if (!data.isSpotify) {
        setError('Spotify no està disponible; es mostren els resultats del catàleg local.');
      }
    } catch (searchError) {
      console.error('[Spotify] No s’han pogut cercar cançons:', searchError);
      setResults(findLocalTracks(searchQuery).slice(0, 12));
      setError('No s’han pogut cercar cançons a Spotify. Es mostren els resultats locals disponibles.');
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (destinationPlaylistId, selectedTrack) => {
    if (await addTrackToUserPlaylist(destinationPlaylistId, selectedTrack)) onClose();
  };

  const alreadyInTarget = (selectedTrack) => existingTracks.some(
    (existing) => getTrackIdentity(existing) === getTrackIdentity(selectedTrack),
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <section className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-800 bg-[#111827] p-6 text-left shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-xl p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          aria-label="Tancar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex items-center gap-3 border-b border-slate-800 pb-4">
          {track?.cover_url ? (
            <img src={track.cover_url} alt="" className="h-12 w-12 rounded-xl object-cover" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Music className="h-6 w-6" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="font-extrabold text-white">
              {track ? 'Afegir cançó a una llista' : `Afegir cançons a ${targetPlaylist?.title || 'la llista'}`}
            </h2>
            {track && (
              <p className="truncate text-xs text-slate-400">{track.title} · {track.artist}</p>
            )}
          </div>
        </div>

        {track ? (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {playlists.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">
                Encara no tens cap llista. Crea’n una des de la pàgina de llistes.
              </p>
            ) : (
              playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  type="button"
                  onClick={() => handleAdd(playlist.id, track)}
                  className="group flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-left transition-colors hover:border-emerald-500/40 hover:bg-emerald-950/40"
                >
                  <span>
                    <span className="block text-sm font-bold text-slate-200 transition-colors group-hover:text-emerald-400">
                      {playlist.title}
                    </span>
                    <span className="text-[11px] text-slate-400">{playlist.is_public ? 'Pública' : 'Privada'}</span>
                  </span>
                  <Plus className="h-4 w-4 text-slate-500 group-hover:text-emerald-400" />
                </button>
              ))
            )}
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    searchTracks();
                  }
                }}
                placeholder="Cerca per títol, artista o àlbum..."
                aria-label="Cerca cançons per afegir"
                className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              />
              <button
                type="button"
                onClick={searchTracks}
                disabled={searching}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Cercar
              </button>
            </div>

            {error && <p className="mt-3 text-xs text-amber-300" role="status">{error}</p>}
            {hasSearched && results.length === 0 && !searching && (
              <p className="py-5 text-center text-sm text-slate-400">No s’han trobat cançons amb aquesta cerca.</p>
            )}

            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
              {results.map((result) => {
                const isAlreadyAdded = alreadyInTarget(result);
                return (
                  <div
                    key={getTrackIdentity(result)}
                    className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-2"
                  >
                    {result.cover_url ? (
                      <img src={result.cover_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
                        <Music className="h-4 w-4 text-slate-400" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-white">{result.title}</span>
                      <span className="block truncate text-xs text-slate-400">
                        {result.artist}{result.album ? ` · ${result.album}` : ''}
                      </span>
                    </span>
                    <button
                      type="button"
                      disabled={isAlreadyAdded}
                      onClick={() => handleAdd(playlistId, result)}
                      className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600 disabled:cursor-default disabled:text-slate-500"
                    >
                      {isAlreadyAdded ? 'Afegida' : <><Plus className="h-3.5 w-3.5" /> Afegir</>}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-5 flex justify-end border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Tancar
          </button>
        </div>
      </section>
    </div>
  );
}
