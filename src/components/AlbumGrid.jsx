import React from 'react';
import AlbumCard from './AlbumCard';
import { Disc3 } from 'lucide-react';

export default function AlbumGrid({
  albums = [],
  onSelectAlbum,
  title = null,
  subtitle = null,
  emptyMessage = "No s'han trobat àlbums disponibles.",
  loading = false
}) {
  if (loading) {
    return (
      <div className="w-full">
        {title && <h2 className="text-xl font-bold text-white mb-4">{title}</h2>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-800/40 rounded-2xl aspect-[3/4] p-3 flex flex-col justify-between">
              <div className="bg-slate-700/50 aspect-square rounded-xl w-full" />
              <div className="space-y-2 mt-3">
                <div className="h-4 bg-slate-700/50 rounded w-3/4" />
                <div className="h-3 bg-slate-700/30 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="w-full">
      {(title || subtitle) && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            {title && <h2 className="text-2xl font-extrabold text-white tracking-tight">{title}</h2>}
            {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800/80 text-emerald-400 self-start sm:self-auto">
            {albums.length} {albums.length === 1 ? 'àlbum' : 'àlbums'}
          </span>
        </div>
      )}

      {albums.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#111827]/40 rounded-2xl border border-slate-800/60 flex flex-col items-center justify-center">
          <Disc3 className="w-12 h-12 text-slate-600 mb-3 animate-spin-slow" />
          <p className="text-slate-400 font-medium">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} onSelect={onSelectAlbum} />
          ))}
        </div>
      )}
    </section>
  );
}
