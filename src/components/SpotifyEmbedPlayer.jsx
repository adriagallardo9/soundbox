import React from 'react';
import { X } from 'lucide-react';

export default function SpotifyEmbedPlayer({ track, onClose }) {
  if (!track?.id) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
    >
      <section
        className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#111827] p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="spotify-player-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="spotify-player-title" className="truncate text-lg font-bold text-white">
              {track.title}
            </h2>
            <p className="truncate text-sm text-slate-400">{track.artist}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Tancar reproductor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <iframe
          title={`Reproductor de Spotify: ${track.title}`}
          src={`https://open.spotify.com/embed/track/${encodeURIComponent(track.id)}?utm_source=generator&theme=0`}
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl border-0"
        />
        <p className="mt-3 text-xs text-slate-500">
          Prem el botó de reproducció del reproductor de Spotify per escoltar la pista.
        </p>
      </section>
    </div>
  );
}
