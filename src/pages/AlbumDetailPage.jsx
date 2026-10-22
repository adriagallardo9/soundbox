import React, { useState, useEffect } from 'react';
import { getAlbumDetails } from '../services/spotifyApi';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import RatingStars from '../components/RatingStars';
import ReviewCard from '../components/ReviewCard';
import ReviewModal from '../components/ReviewModal';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import PlaylistModal from '../components/PlaylistModal';
import {
  Bookmark,
  Star,
  Play,
  Pause,
  Plus,
  ArrowLeft,
  Calendar,
  Music,
  Share2,
  ListMusic,
  MessageSquarePlus,
  Loader2,
  Clock,
  Sparkles
} from 'lucide-react';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';

export default function AlbumDetailPage({ albumId, onNavigate }) {
  const { currentUser } = useAuth();
  const {
    getAlbumStats,
    getAlbumReviews,
    checkInListenlist,
    toggleListenlistAlbum
  } = useData();
  const { addToast } = useNotification();

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);

  // Audio preview playback
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [audioInstance, setAudioInstance] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getAlbumDetails(albumId, (msg) => addToast(msg, 'info'))
      .then((data) => {
        if (isMounted) {
          setAlbum(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      if (audioInstance) {
        audioInstance.pause();
      }
    };
  }, [albumId]);

  const handlePlayPreview = (track) => {
    if (!track.preview_url) {
      addToast('No hi ha fragment d\'àudio disponible per a aquesta pista.', 'info');
      return;
    }

    if (playingTrackId === track.id) {
      if (audioInstance) {
        audioInstance.pause();
      }
      setPlayingTrackId(null);
      setAudioInstance(null);
      return;
    }

    if (audioInstance) {
      audioInstance.pause();
    }

    const newAudio = new Audio(track.preview_url);
    newAudio.play().catch(e => console.warn('Audio play error:', e));
    newAudio.onended = () => {
      setPlayingTrackId(null);
      setAudioInstance(null);
    };

    setPlayingTrackId(track.id);
    setAudioInstance(newAudio);
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center text-center">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Carregant fitxa de l'àlbum des de Spotify...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Àlbum no trobat</h2>
        <p className="text-slate-400 mb-6">No s'ha pogut trobar la fitxa del disc sol·licitat.</p>
        <button
          onClick={() => onNavigate('search')}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold"
        >
          Tornar al cercador
        </button>
      </div>
    );
  }

  const stats = getAlbumStats(album.id);
  const reviews = getAlbumReviews(album.id);
  const inListenlist = checkInListenlist(album.id);

  const userExistingReview = currentUser
    ? reviews.find(r => r.user_id === currentUser.id)
    : null;

  const handleOpenReview = (revToEdit = null) => {
    if (!currentUser) {
      addToast('Inicia sessió per escriure una ressenya.', 'info');
      onNavigate('login');
      return;
    }
    setEditingReview(revToEdit || userExistingReview || null);
    setIsReviewModalOpen(true);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast("Enllaç de l'àlbum copiat al porta-retalls!", 'success');
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Back button */}
      <button
        onClick={() => onNavigate('search')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Tornar als resultats
      </button>

      {/* Album Hero Header (RF-04) */}
      <section className="relative rounded-3xl bg-gradient-to-b from-[#151f33] via-[#111827] to-[#0b0f17] border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* Big High-Res Cover */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-slate-700/60 group">
            <img
              src={album.cover_url || DEFAULT_COVER}
              alt={`Portada de ${album.title}`}
              onError={(e) => { e.currentTarget.src = DEFAULT_COVER; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {inListenlist && (
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-lg">
                <Bookmark className="w-3 h-3 fill-slate-950" />
                A la Listenlist
              </div>
            )}
          </div>

          {/* Details & Community Rating */}
          <div className="flex-1 flex flex-col justify-between text-center md:text-left">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                {album.release_year && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 text-xs font-semibold">
                    <Calendar className="w-3 h-3 text-emerald-400" />
                    {album.release_year}
                  </span>
                )}
                {album.genres && album.genres.map((g, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 text-xs font-medium">
                    {g}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {album.title}
              </h1>
              <p className="text-lg sm:text-xl font-bold text-emerald-400 mt-1">
                {album.artist}
              </p>

              {album.description && (
                <p className="text-sm text-slate-300 mt-4 leading-relaxed max-w-2xl line-clamp-3">
                  {album.description}
                </p>
              )}
            </div>

            {/* Score & Rating Breakdown */}
            <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-center md:justify-start gap-8">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Nota de la Comunitat
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black text-white">
                    {stats.average > 0 ? stats.average.toFixed(1) : '—'}
                  </span>
                  <div>
                    <RatingStars value={stats.average} size="md" />
                    <div className="text-xs text-slate-400 mt-0.5">
                      {stats.count} {stats.count === 1 ? 'ressenya' : 'ressenyes'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons (RF-05, RF-06, RF-07) */}
              <div className="flex flex-wrap items-center gap-3 mt-2 sm:mt-0">
                {/* Review Button */}
                <button
                  type="button"
                  onClick={() => handleOpenReview()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  {userExistingReview ? 'Editar la meva ressenya' : 'Escriure ressenya'}
                </button>

                {/* Listenlist Toggle Button (RF-06) */}
                <button
                  type="button"
                  onClick={() => toggleListenlistAlbum(album.id, album)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all flex items-center gap-2 ${
                    inListenlist
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title={inListenlist ? "Treure de la llista" : "Guardar a Escoltar més tard"}
                >
                  <Bookmark className={`w-4 h-4 ${inListenlist ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                  {inListenlist ? 'A pendents' : 'Escoltar més tard'}
                </button>

                {/* Add to Playlist Button (RF-07) */}
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      addToast('Inicia sessió per afegir a llistes.', 'info');
                      onNavigate('login');
                      return;
                    }
                    setIsAddToPlaylistOpen(true);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Afegir a una llista temàtica"
                  aria-label="Afegir a llista temàtica"
                >
                  <ListMusic className="w-4 h-4" />
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Compartir àlbum"
                  aria-label="Compartir enllaç d'àlbum"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Tracklist (Left) & Community Reviews (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Tracklist Column (5 cols) */}
        <section className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-emerald-400" />
              Llista de Cançons
            </h3>
            <span className="text-xs text-slate-400">
              {album.tracks ? album.tracks.length : 0} pistes
            </span>
          </div>

          <div className="bg-[#111827]/70 rounded-2xl border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
            {(!album.tracks || album.tracks.length === 0) ? (
              <p className="p-6 text-xs text-slate-400 text-center">
                No hi ha llista de cançons detallada per a aquest àlbum.
              </p>
            ) : (
              album.tracks.map((track, idx) => {
                const isPlaying = playingTrackId === track.id;
                return (
                  <div
                    key={track.id || idx}
                    className={`flex items-center justify-between p-3.5 hover:bg-slate-800/40 transition-colors text-sm ${
                      isPlaying ? 'bg-emerald-950/30 text-emerald-300' : 'text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 mr-2 min-w-0">
                      <span className="text-xs font-mono text-slate-500 w-5 flex-shrink-0">
                        {idx + 1}
                      </span>

                      {/* Play Preview Button if available */}
                      {track.preview_url ? (
                        <button
                          type="button"
                          onClick={() => handlePlayPreview(track)}
                          className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                            isPlaying
                              ? 'bg-emerald-500 text-slate-950 shadow-md'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                          title={isPlaying ? "Pausar previsualització" : "Escoltar 30s"}
                          aria-label={isPlaying ? "Pausar àudio" : `Escoltar pista ${track.title}`}
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        </button>
                      ) : (
                        <div className="w-7 h-7 flex-shrink-0" />
                      )}

                      <span className="font-medium truncate text-xs sm:text-sm">
                        {track.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <Clock className="w-3 h-3" />
                      {track.duration}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Community Reviews Column (7 cols) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                Ressenyes dels Usuaris
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Opinions i valoracions de la comunitat SoundBoxd
              </p>
            </div>

            <button
              onClick={() => handleOpenReview()}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
            >
              + Escriure la teva
            </button>
          </div>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="p-8 text-center bg-[#111827]/40 rounded-2xl border border-slate-800">
                <p className="text-slate-400 text-sm mb-4">
                  Encara no hi ha cap ressenya per a aquest àlbum. Sigues el primer a valorar-lo!
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenReview()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Puntuar i Escriure Ressenya
                </button>
              </div>
            ) : (
              reviews.map((rev) => (
                <ReviewCard
                  key={rev.id}
                  review={rev}
                  onEdit={() => handleOpenReview(rev)}
                />
              ))
            )}
          </div>
        </section>
      </div>

      {/* Review Modal (Pantalla 6 - RF-05) */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setEditingReview(null);
        }}
        album={album}
        initialReview={editingReview}
        onRequireLogin={() => {
          addToast('Has d\'iniciar sessió per publicar una ressenya.', 'info');
          onNavigate('login');
        }}
      />

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        isOpen={isAddToPlaylistOpen}
        onClose={() => setIsAddToPlaylistOpen(false)}
        album={album}
        onCreateNewPlaylist={() => setIsCreatePlaylistOpen(true)}
      />

      {/* Create Playlist Modal (RF-07) */}
      <PlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />
    </div>
  );
}
