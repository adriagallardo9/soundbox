import React from 'react';
import { Bookmark, Star, Music } from 'lucide-react';
import { useData } from '../context/DataContext';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';

export default function AlbumCard({ album, onSelect }) {
  const { checkInListenlist, toggleListenlistAlbum, getAlbumStats } = useData();

  const inListenlist = checkInListenlist(album.id);
  const stats = getAlbumStats(album.id);

  const handleToggleListenlist = (e) => {
    e.stopPropagation();
    toggleListenlistAlbum(album.id, album);
  };

  return (
    <div
      onClick={() => onSelect && onSelect(album.id)}
      className="group relative bg-[#131c2e] hover:bg-[#19243a] border border-slate-800/80 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/20 hover:-translate-y-1.5 cursor-pointer flex flex-col"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-900">
        <img
          src={album.cover_url || DEFAULT_COVER}
          alt={`Portada de ${album.title} de ${album.artist}`}
          onError={(e) => {
            e.currentTarget.src = DEFAULT_COVER;
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131c2e] via-transparent to-black/30 opacity-70 group-hover:opacity-40 transition-opacity" />

        {/* Bookmark / Listenlist Quick Button (RF-06) */}
        <button
          type="button"
          onClick={handleToggleListenlist}
          aria-label={inListenlist ? "Treure d'Escoltar més tard" : "Afegir a Escoltar més tard"}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all duration-200 ${
            inListenlist
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
              : 'bg-black/60 text-slate-300 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100'
          }`}
          title={inListenlist ? "A la llista de pendents" : "Afegir a Escoltar més tard"}
        >
          <Bookmark className={`w-4 h-4 ${inListenlist ? 'fill-white' : ''}`} />
        </button>

        {/* Community Rating Badge */}
        {stats.average > 0 && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-xs font-semibold text-emerald-400 shadow-md">
            <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            <span>{stats.average}</span>
            <span className="text-slate-400 text-[10px]">({stats.count})</span>
          </div>
        )}

        {/* Release Year Badge */}
        {album.release_year && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-medium text-slate-300">
            {album.release_year}
          </div>
        )}
      </div>

      {/* Album Info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <h3
            className="font-bold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1"
            title={album.title}
          >
            {album.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1" title={album.artist}>
            {album.artist}
          </p>
        </div>

        {album.genres && album.genres.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/50">
              {album.genres[0]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
