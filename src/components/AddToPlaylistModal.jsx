import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getUserPlaylists } from '../services/storageService';
import { X, Plus, FolderPlus, Check } from 'lucide-react';

export default function AddToPlaylistModal({
  isOpen,
  onClose,
  album,
  onCreateNewPlaylist
}) {
  const { currentUser } = useAuth();
  const { addAlbumToUserPlaylist } = useData();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');

  if (!isOpen || !currentUser) return null;

  const playlists = getUserPlaylists(currentUser.id);

  const handleAdd = (playlistId) => {
    addAlbumToUserPlaylist(playlistId, album.id, album);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
          aria-label="Tancar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
          <img
            src={album?.cover_url}
            alt={album?.title}
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div>
            <h3 className="font-extrabold text-base text-white">Afegir a una llista</h3>
            <p className="text-xs text-slate-400 line-clamp-1">{album?.title} · {album?.artist}</p>
          </div>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {playlists.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              Encara no has creat cap llista personalitzada.
            </p>
          ) : (
            playlists.map((pl) => (
              <button
                key={pl.id}
                type="button"
                onClick={() => handleAdd(pl.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-emerald-950/40 border border-slate-800/80 hover:border-emerald-500/40 transition-colors text-left group"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {pl.title}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {pl.is_public ? 'Pública' : 'Privada'}
                  </p>
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
              </button>
            ))
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onCreateNewPlaylist) onCreateNewPlaylist();
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <FolderPlus className="w-4 h-4" />
            Crear nova llista...
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg"
          >
            Tancar
          </button>
        </div>
      </div>
    </div>
  );
}
