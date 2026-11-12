import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { searchAll } from '../services/spotifyApi';
import { X, ListPlus, Lock, Globe, Search, Music, Plus, Check, Loader2 } from 'lucide-react';

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

export default function PlaylistModal({ isOpen, onClose }) {
  const { createNewPlaylist, allAlbums } = useData();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResults, setTrackResults] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [searchingTracks, setSearchingTracks] = useState(false);
  const [trackSearchError, setTrackSearchError] = useState('');
  const [hasSearchedTracks, setHasSearchedTracks] = useState(false);

  if (!isOpen) return null;

  const findLocalTracks = (query) => {
    const normalizedQuery = normalizeTrackValue(query);

    return allAlbums.flatMap((album) => (album.tracks || [])
      .map((track) => ({
        ...track,
        _type: 'track',
        artist: track.artist || album.artist,
        album: track.album || album.title,
        albumId: track.albumId || album.id,
        cover_url: track.cover_url || album.cover_url,
      }))
      .filter((track) => normalizeTrackValue(`${track.title} ${track.artist} ${track.album}`).includes(normalizedQuery)));
  };

  const getTrackKey = (track) => `${track.id}:${track.albumId || track.album || ''}`;

  const handleTrackSearch = async () => {
    const query = trackQuery.trim();
    if (query.length < 2) {
      setTrackSearchError('Escriu almenys dues lletres per cercar cançons.');
      return;
    }

    setSearchingTracks(true);
    setTrackSearchError('');
    setHasSearchedTracks(true);
    try {
      const results = await searchAll(query);
      const tracks = [...(results.tracks || []), ...findLocalTracks(query)];
      const seen = new Set();
      setTrackResults(tracks.filter((track) => {
        const key = getTrackIdentity(track);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 12));
      if (!results.isSpotify) {
        setTrackSearchError('Spotify no està disponible ara mateix; es mostren els resultats del catàleg local.');
      }
    } catch (searchError) {
      console.error('[Spotify] No s’han pogut cercar cançons:', searchError);
      setTrackResults(findLocalTracks(query).slice(0, 12));
      setTrackSearchError('No s’han pogut cercar cançons a Spotify. Es mostren els resultats locals disponibles.');
    } finally {
      setSearchingTracks(false);
    }
  };

  const toggleTrack = (track) => {
    const key = getTrackKey(track);
    setSelectedTracks((current) => (
      current.some((selected) => getTrackKey(selected) === key)
        ? current.filter((selected) => getTrackKey(selected) !== key)
        : [...current, track]
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Si us plau, introdueix un títol per a la llista.');
      return;
    }

    const created = createNewPlaylist({
      title: title.trim(),
      description: description.trim(),
      isPublic,
      tracks: selectedTracks
    });

    if (created) {
      setTitle('');
      setDescription('');
      setIsPublic(true);
      setError('');
      setTrackQuery('');
      setTrackResults([]);
      setSelectedTracks([]);
      setTrackSearchError('');
      setHasSearchedTracks(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
          aria-label="Tancar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
            <ListPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white">Nova Llista Temàtica</h3>
            <p className="text-xs text-slate-400">Crea una llista amb les cançons que vulguis</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-600/70 text-rose-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Títol de la llista *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Cançons per a l'estiu"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Descripció (Opcional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="De què tracta aquesta selecció de cançons o discos?"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 resize-none"
            />
          </div>

          <section className="space-y-3">
            <label htmlFor="playlist-track-search" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Cançons de la llista ({selectedTracks.length})
            </label>
            <div className="flex gap-2">
              <input
                id="playlist-track-search"
                type="search"
                value={trackQuery}
                onChange={(event) => setTrackQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleTrackSearch();
                  }
                }}
                placeholder="Cerca per títol, artista o àlbum..."
                className="min-w-0 flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              />
              <button
                type="button"
                onClick={handleTrackSearch}
                disabled={searchingTracks}
                className="inline-flex items-center gap-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white disabled:opacity-50"
              >
                {searchingTracks ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Cercar
              </button>
            </div>

            {trackSearchError && (
              <p className="text-xs text-amber-300" role="status">{trackSearchError}</p>
            )}

            {hasSearchedTracks && trackResults.length === 0 && !searchingTracks && (
              <p className="text-xs text-slate-400">No s’han trobat cançons amb aquesta cerca.</p>
            )}

            {trackResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {trackResults.map((track) => {
                  const isSelected = selectedTracks.some((selected) => getTrackKey(selected) === getTrackKey(track));
                  return (
                    <button
                      key={getTrackKey(track)}
                      type="button"
                      onClick={() => toggleTrack(track)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 text-left"
                    >
                      {track.cover_url ? (
                        <img src={track.cover_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <span className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                          <Music className="w-4 h-4 text-slate-400" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-white truncate">{track.title}</span>
                        <span className="block text-xs text-slate-400 truncate">
                          {track.artist}{track.album ? ` · ${track.album}` : ''}
                        </span>
                      </span>
                      {isSelected
                        ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        : <Plus className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedTracks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-emerald-300">
                  {selectedTracks.length} {selectedTracks.length === 1 ? 'cançó seleccionada' : 'cançons seleccionades'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTracks.map((track) => (
                    <button
                      key={getTrackKey(track)}
                      type="button"
                      onClick={() => toggleTrack(track)}
                      className="inline-flex max-w-full items-center gap-2 rounded-lg bg-emerald-950/60 px-2.5 py-1.5 text-xs text-emerald-200 hover:bg-rose-950/60 hover:text-rose-200"
                      aria-label={`Treure ${track.title} de la llista`}
                    >
                      <span className="truncate">{track.title} · {track.artist}</span>
                      <X className="h-3.5 w-3.5 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2.5">
              {isPublic ? <Globe className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
              <span className="text-xs font-medium text-slate-200">
                {isPublic ? 'Llista pública (visible al teu perfil)' : 'Llista privada (només tu)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white"
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20"
            >
              Crear Llista
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
