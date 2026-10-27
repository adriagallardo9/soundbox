import React, { useState, useEffect, useRef } from 'react';
import { searchAll } from '../services/spotifyApi';
import { useNotification } from '../context/NotificationContext';
import {
  Search, Loader2, Sparkles, AlertTriangle,
  Music, Mic2, Disc3, Play, ExternalLink,
  Clock, Users, BarChart2, Radio,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function ArtistCard({ artist, onNavigate }) {
  return (
    <div
      className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800 transition-all cursor-pointer"
      onClick={() => onNavigate && onNavigate('search', { initialQuery: artist.name })}
    >
      <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700 ring-2 ring-slate-600 group-hover:ring-emerald-500/60 transition-all flex-shrink-0">
        {artist.image ? (
          <img
            src={artist.image}
            alt={artist.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Mic2 className="w-10 h-10 text-slate-500" />
          </div>
        )}
      </div>

      <div className="text-center min-w-0 w-full">
        <p className="font-bold text-white text-sm truncate group-hover:text-emerald-400 transition-colors">
          {artist.name}
        </p>

        {artist.genres?.length > 0 && (
          <p className="text-xs text-emerald-400/80 mt-0.5 truncate">
            {artist.genres.slice(0, 2).join(' · ')}
          </p>
        )}

        <div className="flex items-center justify-center gap-3 mt-2 text-xs text-slate-400">
          {artist.popularity !== null && (
            <span className="flex items-center gap-1">
              <BarChart2 className="w-3 h-3" />
              {artist.popularity}
            </span>
          )}
          {artist.followers !== null && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {artist.followers >= 1_000_000
                ? `${(artist.followers / 1_000_000).toFixed(1)}M`
                : artist.followers >= 1_000
                ? `${(artist.followers / 1_000).toFixed(0)}K`
                : artist.followers}
            </span>
          )}
        </div>
      </div>

      {artist.spotifyUrl && (
        <a
          href={artist.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-3 h-3" />
          Spotify
        </a>
      )}
    </div>
  );
}

function AlbumCard({ album, onNavigate }) {
  const typeLabel = {
    album: 'Àlbum',
    single: 'Single',
    compilation: 'Recopilatori',
  }[album.album_type] ?? 'Àlbum';

  return (
    <div
      className="group flex gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800 transition-all cursor-pointer"
      onClick={() => onNavigate && onNavigate('album', { albumId: album.id })}
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0 shadow-md">
        <img
          src={album.cover_url}
          alt={album.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop'; }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-bold text-white text-sm truncate group-hover:text-emerald-400 transition-colors">
          {album.title}
        </p>
        <p className="text-xs text-slate-400 truncate mt-0.5">{album.artist}</p>

        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs text-slate-500">
          {album.release_year && <span>{album.release_year}</span>}
          <span className="capitalize">{typeLabel}</span>
          {album.total_tracks > 0 && (
            <span className="flex items-center gap-0.5">
              <Music className="w-3 h-3" />
              {album.total_tracks} cançons
            </span>
          )}
        </div>
      </div>

      {album.spotifyUrl && (
        <a
          href={album.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-center text-slate-500 hover:text-emerald-400 transition-colors ml-1 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}

function TrackRow({ track, index, onNavigate }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePreview = (e) => {
    e.stopPropagation();
    if (!track.preview_url) return;
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      audioRef.current?.play();
      setPlaying(true);
    }
  };

  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  return (
    <div
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/60 transition-all cursor-pointer"
      onClick={() => track.albumId && onNavigate && onNavigate('album', { albumId: track.albumId })}
    >
      {/* Número / play preview */}
      <div className="w-7 flex-shrink-0 flex items-center justify-center">
        {track.preview_url ? (
          <button
            onClick={togglePreview}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              playing
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-700 text-slate-400 hover:bg-emerald-500 hover:text-slate-950 opacity-0 group-hover:opacity-100'
            }`}
          >
            {playing ? (
              <Radio className="w-3.5 h-3.5 animate-pulse" />
            ) : (
              <Play className="w-3 h-3 ml-0.5" />
            )}
          </button>
        ) : (
          <span className="text-xs text-slate-600 group-hover:hidden">{index}</span>
        )}
        {track.preview_url && (
          <audio
            ref={audioRef}
            src={track.preview_url}
            onEnded={() => setPlaying(false)}
          />
        )}
      </div>

      {/* Portada mini */}
      <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-700 flex-shrink-0">
        <img
          src={track.cover_url}
          alt={track.album}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-white text-sm truncate group-hover:text-emerald-400 transition-colors">
            {track.title}
          </p>
          {track.explicit && (
            <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-slate-600 text-slate-300 flex-shrink-0">
              E
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate">
          {track.artist}
          {track.album && (
            <span className="text-slate-600"> · {track.album}</span>
          )}
        </p>
      </div>

      {/* Popularitat */}
      {track.popularity !== null && (
        <div className="hidden sm:flex flex-col items-center gap-0.5 flex-shrink-0 w-8">
          <div className="w-full bg-slate-700 rounded-full h-1">
            <div
              className="bg-emerald-500 h-1 rounded-full"
              style={{ width: `${track.popularity}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500">{track.popularity}</span>
        </div>
      )}

      {/* Durada */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs text-slate-500 hidden sm:block font-mono">
          {track.duration}
        </span>
        {track.spotifyUrl && (
          <a
            href={track.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab button
// ─────────────────────────────────────────────────────────────────────────────
function TabBtn({ active, icon: Icon, label, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        active
          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-900/30'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count > 0 && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
            active ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-700 text-slate-300'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SearchPage
// ─────────────────────────────────────────────────────────────────────────────
const CHIPS = ['Beatles', 'Thriller', 'Pink Floyd', 'Rosalía', 'Radiohead', 'Daft Punk', 'Bad Bunny', 'Taylor Swift'];

export default function SearchPage({ initialQuery = '', onNavigate }) {
  const [query, setQuery] = useState(initialQuery || '');
  const [results, setResults] = useState({ artists: [], albums: [], tracks: [], isSpotify: false });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('albums');
  const [plaBActive, setPlaBActive] = useState(false);
  const { addToast } = useNotification();
  const inputRef = useRef(null);

  const doSearch = async (searchTerm) => {
    const q = (searchTerm !== undefined ? searchTerm : query).trim();
    if (!q) return;

    setLoading(true);
    setHasSearched(true);
    setPlaBActive(false);

    try {
      const data = await searchAll(q, () => {
        setPlaBActive(true);
        addToast("Mode local actiu: Spotify no disponible amb les credencials actuals.", 'info');
      });
      setResults(data);
      // Auto-seleccionar la pestanya amb més resultats
      const counts = {
        artists: data.artists.length,
        albums: data.albums.length,
        tracks: data.tracks.length,
      };
      const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      if (counts[best] > 0) setActiveTab(best);
    } catch (err) {
      console.error(err);
      setPlaBActive(true);
      addToast('Error de connexió. Activant Pla B amb catàleg local.', 'error');
      setResults({ artists: [], albums: [], tracks: [], isSpotify: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = initialQuery || 'a';
    setQuery(initialQuery || '');
    doSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSubmit = (e) => { e.preventDefault(); doSearch(); };

  const totalResults = results.artists.length + results.albums.length + results.tracks.length;

  return (
    <div className="space-y-6 pb-16">
      {/* ── Header ── */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Cerca al Catàleg Musical
        </h1>
        <p className="text-sm text-slate-400">
          Cerca artistes, àlbums i cançons directament a Spotify
        </p>

        {/* Barra de cerca */}
        <form onSubmit={handleSubmit} className="relative flex items-center mt-6">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Artista, àlbum, cançó..."
            className="w-full bg-[#131c2e] border-2 border-slate-700/80 focus:border-emerald-500 rounded-2xl pl-12 pr-28 py-3.5 text-sm sm:text-base text-slate-100 placeholder-slate-500 outline-none transition-all shadow-xl shadow-black/40"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-1.5 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cercar'}
          </button>
        </form>

        {/* Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Prova amb:
          </span>
          {CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => { setQuery(chip); doSearch(chip); }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-emerald-950/40 hover:text-emerald-400 text-slate-300 border border-slate-700/60 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* ── Banner Pla B ── */}
      {plaBActive && (
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Pla B actiu (Mode Local):</span>{' '}
            L'API de Spotify requereix credencials amb accés estès. Mostrant el catàleg local de SoundBoxd.
            Afegeix les claus a{' '}
            <code className="bg-amber-900/30 px-1 rounded">.env</code> per activar Spotify.
          </div>
        </div>
      )}

      {/* ── Contingut ── */}
      {hasSearched && !loading && (
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Pestanyes */}
          <div className="flex items-center gap-2 flex-wrap">
            <TabBtn
              active={activeTab === 'artists'}
              icon={Mic2}
              label="Artistes"
              count={results.artists.length}
              onClick={() => setActiveTab('artists')}
            />
            <TabBtn
              active={activeTab === 'albums'}
              icon={Disc3}
              label="Àlbums"
              count={results.albums.length}
              onClick={() => setActiveTab('albums')}
            />
            <TabBtn
              active={activeTab === 'tracks'}
              icon={Music}
              label="Cançons"
              count={results.tracks.length}
              onClick={() => setActiveTab('tracks')}
            />
            <span className="ml-auto text-xs text-slate-500">
              {totalResults} resultats
              {results.isSpotify && (
                <span className="ml-2 text-emerald-500 font-semibold">· via Spotify</span>
              )}
            </span>
          </div>

          {/* ── Tab: Artistes ── */}
          {activeTab === 'artists' && (
            <div>
              {results.artists.length === 0 ? (
                <EmptyState label="artistes" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {results.artists.map((a) => (
                    <ArtistCard key={a.id} artist={a} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Àlbums ── */}
          {activeTab === 'albums' && (
            <div>
              {results.albums.length === 0 ? (
                <EmptyState label="àlbums" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {results.albums.map((a) => (
                    <AlbumCard key={a.id} album={a} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Cançons ── */}
          {activeTab === 'tracks' && (
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden">
              {/* Capçalera de columna */}
              <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-700/50 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <span className="w-7" />
                <span className="w-10" />
                <span className="flex-1">Títol / Artista</span>
                <span className="hidden sm:block w-8 text-center">Pop.</span>
                <span className="hidden sm:flex items-center gap-1 w-10">
                  <Clock className="w-3 h-3" />
                </span>
                <span className="w-4" />
              </div>

              {results.tracks.length === 0 ? (
                <EmptyState label="cançons" />
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {results.tracks.map((t, i) => (
                    <TrackRow
                      key={t.id}
                      track={t}
                      index={i + 1}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm">Cercant a Spotify...</p>
        </div>
      )}

      {/* Estat inicial (no s'ha cercat encara) */}
      {!hasSearched && !loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-600">
          <Search className="w-12 h-12" />
          <p className="text-base font-semibold">Comença la teva cerca</p>
          <p className="text-sm">Escriu el nom d'un artista, àlbum o cançó</p>
        </div>
      )}
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="py-12 text-center text-slate-500">
      <p className="text-sm">No s'han trobat {label} per a aquesta cerca.</p>
    </div>
  );
}
