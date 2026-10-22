import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import PlaylistModal from '../components/PlaylistModal';
import { ListMusic, Plus, Globe, Lock, ArrowRight, User } from 'lucide-react';

export default function PlaylistsPage({ onNavigate }) {
  const { allPlaylists, allAlbums } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenCreate = () => {
    if (!currentUser) {
      addToast('Has d\'iniciar sessió per crear una llista.', 'info');
      onNavigate('login');
      return;
    }
    setIsModalOpen(true);
  };

  // Filter: show all public playlists, or user's own private playlists
  const visiblePlaylists = allPlaylists.filter(p => {
    if (p.is_public) return true;
    return currentUser && p.user_id === currentUser.id;
  });

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ListMusic className="w-8 h-8 text-emerald-400" />
            Llistes i Col·leccions Temàtiques
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Explora seleccions curades per la comunitat o crea les teves pròpies llistes
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Crear Nova Llista
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visiblePlaylists.map((pl) => (
          <div
            key={pl.id}
            onClick={() => onNavigate('playlist-detail', { playlistId: pl.id })}
            className="group p-6 rounded-3xl bg-[#131c2e] hover:bg-[#18233a] border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 flex items-center gap-1">
                  {pl.is_public ? <Globe className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-amber-400" />}
                  {pl.is_public ? 'Pública' : 'Privada'}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(pl.created_at).toLocaleDateString('ca-ES')}
                </span>
              </div>

              <h3 className="font-extrabold text-xl text-white group-hover:text-emerald-400 transition-colors mb-2">
                {pl.title}
              </h3>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {pl.description || 'Sense descripció introduïda.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                {pl.user_id === 1 ? 'Adrià Melòman' : pl.user_id === 2 ? 'Adrià Gallardo' : 'Clara Valls'}
              </span>

              <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Explorar <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      <PlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
