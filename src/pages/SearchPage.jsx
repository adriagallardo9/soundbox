import React, { useState, useEffect } from 'react';
import { searchAlbums } from '../services/spotifyApi';
import { useNotification } from '../context/NotificationContext';
import AlbumGrid from '../components/AlbumGrid';
import { Search, Loader2, Sparkles, AlertTriangle, Disc } from 'lucide-react';

export default function SearchPage({ initialQuery = '', onNavigate }) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [plaBActive, setPlaBActive] = useState(false);
  const { addToast } = useNotification();

  const handlePerformSearch = async (searchTerm) => {
    const q = (searchTerm !== undefined ? searchTerm : query).trim();
    if (!q) return;

    setLoading(true);
    setHasSearched(true);
    setPlaBActive(false);

    try {
      const data = await searchAlbums(q, (noticeMsg) => {
        setPlaBActive(true);
        addToast(noticeMsg, 'info');
      });
      setResults(data);
    } catch (err) {
      console.error(err);
      setPlaBActive(true);
      addToast("Error de connexió. Activant Pla B amb catàleg local.", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handlePerformSearch(initialQuery);
    } else {
      // Carregar el catàleg recomanat d'inici
      handlePerformSearch('a');
    }
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handlePerformSearch();
  };

  const sampleChips = ['Beatles', 'Thriller', 'Pink Floyd', 'Rosalía', 'Radiohead', 'Daft Punk', '1977'];

  return (
    <div className="space-y-8 pb-12">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Cerca al Catàleg Musical
        </h1>
        <p className="text-sm text-slate-400">
          Explora per títol d'àlbum, artista o any de llançament amb dades de Spotify i la comunitat
        </p>

        {/* Search Input Bar (RF-03) */}
        <form onSubmit={handleSubmit} className="relative flex items-center mt-6">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: Abbey Road, Michael Jackson, Rosalía..."
            className="w-full bg-[#131c2e] border-2 border-slate-700/80 focus:border-emerald-500 rounded-2xl pl-12 pr-28 py-3.5 text-sm sm:text-base text-slate-100 placeholder-slate-500 outline-none transition-all shadow-xl shadow-black/40"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cercar'}
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Prova amb:
          </span>
          {sampleChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setQuery(chip);
                handlePerformSearch(chip);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-emerald-950/40 hover:text-emerald-400 text-slate-300 border border-slate-700/60 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Pla B Alert Banner (Bloc 6.3) */}
      {plaBActive && (
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Pla B Activat (Mode Local / Cache):</span> No s'ha pogut connectar directament amb l'API externa de Spotify (o s'opera sense claus privades). L'aplicació està mostrant els àlbums desemmagatzemats localment a la base de dades SoundBoxd.
          </div>
        </div>
      )}

      {/* Search Results Grid */}
      <div className="max-w-7xl mx-auto">
        <AlbumGrid
          title={hasSearched ? `Resultats per a "${query}"` : 'Àlbums Destacats'}
          subtitle={hasSearched ? `${results.length} coincidències trobades` : 'Tria un àlbum per veure la fitxa completa i escriure una ressenya'}
          albums={results}
          loading={loading}
          emptyMessage="No s'han trobat àlbums ni cançons que coincideixin amb la cerca."
          onSelectAlbum={(id) => onNavigate('album', { albumId: id })}
        />
      </div>
    </div>
  );
}
