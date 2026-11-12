import React from 'react';
import { getPlaylistById } from '../services/storageService';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import AlbumGrid from '../components/AlbumGrid';
import { ArrowLeft, Trash2, Globe, Lock, Calendar, User, Music } from 'lucide-react';

export default function PlaylistDetailPage({ playlistId, onNavigate }) {
  const { currentUser, isAdmin } = useAuth();
  const { dataVersion, removeAlbumFromUserPlaylist, removePlaylist } = useData();

  const playlist = getPlaylistById(playlistId);

  if (!playlist) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Llista no trobada</h2>
        <button
          onClick={() => onNavigate('playlists')}
          className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
        >
          Tornar a les Llistes
        </button>
      </div>
    );
  }

  const isOwner = currentUser && currentUser.id === playlist.user_id;
  const canManage = isOwner || isAdmin;

  const handleDeleteEntirePlaylist = () => {
    if (window.confirm('Segur que vols eliminar aquesta llista?')) {
      removePlaylist(playlist.id);
      onNavigate('playlists');
    }
  };

  return (
    <div className="space-y-10 pb-16">
      <button
        onClick={() => onNavigate('playlists')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Tornar a totes les Llistes
      </button>

      {/* Playlist Header */}
      <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#131c2e] via-[#111827] to-[#0b0f17] border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 flex items-center gap-1.5">
              {playlist.is_public ? <Globe className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
              {playlist.is_public ? 'Llista Pública' : 'Llista Privada'}
            </span>
            <span className="text-xs text-slate-500">
              {playlist.tracks.length} {playlist.tracks.length === 1 ? 'cançó' : 'cançons'} · {playlist.albums.length} {playlist.albums.length === 1 ? 'àlbum' : 'àlbums'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {playlist.title}
          </h1>

          {playlist.description && (
            <p className="text-sm text-slate-300 leading-relaxed">
              {playlist.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Creada per {playlist.author?.username || 'Anònim'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(playlist.created_at).toLocaleDateString('ca-ES')}
            </span>
          </div>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleDeleteEntirePlaylist}
            className="px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 hover:bg-rose-900/50 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar Llista
          </button>
        )}
      </section>

      {playlist.tracks.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-emerald-400" />
            Cançons de la llista
          </h2>
          <div className="space-y-2">
            {playlist.tracks.map((track) => (
              <button
                key={`${track.id}:${track.albumId || track.album || ''}`}
                type="button"
                onClick={() => onNavigate('track', { track })}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#131c2e] border border-slate-800 hover:border-emerald-500/50 text-left transition-colors"
              >
                {track.cover_url ? (
                  <img
                    src={track.cover_url}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(event) => { event.currentTarget.src = '/album-placeholder.svg'; }}
                  />
                ) : (
                  <span className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                    <Music className="w-5 h-5 text-slate-400" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-white truncate">{track.title}</span>
                  <span className="block text-xs text-slate-400 truncate">
                    {track.artist}{track.album ? ` · ${track.album}` : ''}
                  </span>
                </span>
                {track.duration && <span className="text-xs font-mono text-slate-500">{track.duration}</span>}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Albums in playlist */}
      <section className="space-y-4">
        <AlbumGrid
          title="Discos en aquesta col·lecció"
          albums={playlist.albums.map(pa => pa.album)}
          onSelectAlbum={(id) => onNavigate('album', { albumId: id })}
          onNavigate={onNavigate}
          emptyMessage="Encara no s'han afegit àlbums a aquesta llista. Navega pel cercador i prem 'Afegir a una llista' a la fitxa d'un àlbum!"
        />
      </section>
    </div>
  );
}
