import React, { useEffect, useRef, useState } from 'react';
import { getPlaylistById } from '../services/storageService';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import AlbumGrid from '../components/AlbumGrid';
import AddTrackToPlaylistModal from '../components/AddTrackToPlaylistModal';
import RatingStars from '../components/RatingStars';
import { ArrowLeft, Trash2, Globe, Lock, Calendar, User, Music, Plus, X, Eye, Star } from 'lucide-react';

export default function PlaylistDetailPage({ playlistId, onNavigate }) {
  const { currentUser, cloudUser, cloudAuthReady, cloudAuthError, isAdmin } = useAuth();
  const {
    sharedPlaylists,
    sharedPlaylistsLoading,
    sharedPlaylistsError,
    removeTrackFromUserPlaylist,
    removePlaylist,
    ratePlaylist,
    viewPlaylist
  } = useData();
  const [isAddTracksOpen, setIsAddTracksOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const recordedViewId = useRef(null);

  const sharedPlaylist = sharedPlaylists.find((item) => String(item.id) === String(playlistId));
  const foundPlaylist = sharedPlaylist || getPlaylistById(playlistId);
  const playlist = foundPlaylist
    ? {
        ...foundPlaylist,
        tracks: Array.isArray(foundPlaylist.tracks) ? foundPlaylist.tracks : [],
        albums: Array.isArray(foundPlaylist.albums) ? foundPlaylist.albums : [],
      }
    : null;
  const isShared = Boolean(sharedPlaylist);
  const isOwner = isShared
    ? cloudUser?.sub === playlist.owner_google_id
    : currentUser?.id === playlist?.user_id;
  const canManage = isShared ? isOwner : isOwner || isAdmin;

  useEffect(() => {
    if (isShared && recordedViewId.current !== playlist.id) {
      recordedViewId.current = playlist.id;
      viewPlaylist(playlist.id);
    }
  }, [isShared, playlist?.id, viewPlaylist]);

  useEffect(() => {
    setSelectedRating(Number(playlist?.user_rating) || 0);
  }, [playlist?.id, playlist?.user_rating]);

  if (!playlist) {
    if (sharedPlaylistsLoading) {
      return <p className="py-20 text-center text-slate-400">Carregant la llista...</p>;
    }
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {sharedPlaylistsError ? 'No s’ha pogut carregar la llista' : 'Llista no trobada'}
        </h2>
        {sharedPlaylistsError && <p className="mx-auto max-w-lg text-sm text-rose-300">{sharedPlaylistsError}</p>}
        <button
          onClick={() => onNavigate('playlists')}
          className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
        >
          Tornar a les Llistes
        </button>
      </div>
    );
  }

  if (!playlist.is_public && !canManage) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Aquesta llista és privada</h2>
        <button
          onClick={() => onNavigate('playlists')}
          className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
        >
          Tornar a les Llistes
        </button>
      </div>
    );
  }

  const handleDeleteEntirePlaylist = async () => {
    if (window.confirm('Segur que vols eliminar aquesta llista?')) {
      if (await removePlaylist(playlist.id)) onNavigate('playlists');
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
            {isShared && (
              <>
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Eye className="h-3.5 w-3.5" /> {playlist.views || 0} visites
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Star className="h-3.5 w-3.5 text-amber-300" />
                  {playlist.rating_count
                    ? `${playlist.average_rating}/5 (${playlist.rating_count})`
                    : 'Sense valoracions'}
                </span>
              </>
            )}
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

      {isShared && (
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-[#131c2e] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-white">Valora aquesta llista</h2>
            <p className="mt-1 text-xs text-slate-400">
              {!cloudAuthReady
                ? 'Comprovant la sessió...'
                : cloudUser
                ? 'La teva valoració es compartirà amb la comunitat.'
                : currentUser && cloudAuthError
                ? cloudAuthError
                : 'Inicia sessió amb Google per poder valorar-la.'}
            </p>
            {playlist.user_rating && (
              <p className="mt-1 text-xs text-emerald-300">La teva valoració: {playlist.user_rating}/5</p>
            )}
          </div>
          {!cloudAuthReady ? (
            <p className="text-xs text-slate-400" role="status">Comprovant la sessió...</p>
          ) : cloudUser ? (
            <div className="flex flex-wrap items-center gap-3">
              <RatingStars
                value={selectedRating}
                onChange={setSelectedRating}
                interactive
                size="sm"
                showNumber
              />
              <button
                type="button"
                disabled={selectedRating < 0.1}
                onClick={() => ratePlaylist(playlist.id, selectedRating)}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Desar valoració
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              {currentUser ? 'Torna a validar Google' : 'Iniciar sessió'}
            </button>
          )}
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-emerald-400" />
            Cançons de la llista
          </h2>
          {canManage && (
            <button
              type="button"
              onClick={() => setIsAddTracksOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              <Plus className="h-4 w-4" />
              Afegir cançons
            </button>
          )}
        </div>

        {playlist.tracks.length > 0 ? (
          <div className="space-y-2">
            {playlist.tracks.map((track) => (
              <div
                key={`${track.id}:${track.albumId || track.album || ''}`}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#131c2e] p-3"
              >
                <button
                  type="button"
                  onClick={() => onNavigate('track', { track })}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  {track.cover_url ? (
                    <img
                      src={track.cover_url}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover"
                      onError={(event) => { event.currentTarget.src = '/album-placeholder.svg'; }}
                    />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800">
                      <Music className="h-5 w-5 text-slate-400" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-white">{track.title}</span>
                    <span className="block truncate text-xs text-slate-400">
                      {track.artist}{track.album ? ` · ${track.album}` : ''}
                    </span>
                  </span>
                  {track.duration && <span className="text-xs font-mono text-slate-500">{track.duration}</span>}
                </button>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => removeTrackFromUserPlaylist(playlist.id, track)}
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-950/60 hover:text-rose-300"
                    aria-label={`Treure ${track.title} de la llista`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
            Encara no hi ha cançons en aquesta llista.
            {canManage ? ' Fes servir «Afegir cançons» per començar.' : ''}
          </p>
        )}
      </section>

      {canManage && (
        <AddTrackToPlaylistModal
          isOpen={isAddTracksOpen}
          onClose={() => setIsAddTracksOpen(false)}
          playlistId={playlist.id}
          existingTracks={playlist.tracks}
        />
      )}

      {/* Albums in playlist */}
      <section className="space-y-4">
        <AlbumGrid
          title="Discos en aquesta col·lecció"
          albums={playlist.albums.map((item) => item.album || item)}
          onSelectAlbum={(id) => onNavigate('album', { albumId: id })}
          onNavigate={onNavigate}
          emptyMessage="Encara no s'han afegit àlbums a aquesta llista. Navega pel cercador i prem 'Afegir a una llista' a la fitxa d'un àlbum!"
        />
      </section>
    </div>
  );
}
