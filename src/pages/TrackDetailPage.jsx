import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Disc3, Loader2, MessageSquarePlus, Pause, Play } from 'lucide-react';
import SpotifyEmbedPlayer from '../components/SpotifyEmbedPlayer';
import RatingStars from '../components/RatingStars';
import ReviewCard from '../components/ReviewCard';
import ReviewModal from '../components/ReviewModal';
import { playPreview, stopPreview, subscribeToPlayback } from '../services/audioPlayer';
import { resolveTrackForPlayback } from '../services/spotifyApi';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';

const DEFAULT_COVER = '/album-placeholder.svg';

export default function TrackDetailPage({ track: initialTrack, onNavigate }) {
  const [track, setTrack] = useState(initialTrack || null);
  const [loading, setLoading] = useState(Boolean(initialTrack));
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [draftRating, setDraftRating] = useState(null);
  const requestId = useRef(0);
  const { currentUser } = useAuth();
  const { getTrackReviews } = useData();
  const { addToast } = useNotification();

  useEffect(() => {
    const unsubscribe = subscribeToPlayback(setPlayingTrackId);
    return () => {
      requestId.current += 1;
      stopPreview();
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!initialTrack) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const currentRequestId = ++requestId.current;
    setTrack(initialTrack);
    setLoading(true);

    resolveTrackForPlayback(initialTrack)
      .then((resolvedTrack) => {
        if (!isMounted || requestId.current !== currentRequestId) return;
        if (!resolvedTrack) {
          addToast('No s’ha pogut trobar aquesta cançó a Spotify.', 'error');
          return;
        }
        setTrack({ ...initialTrack, ...resolvedTrack });
      })
      .catch((error) => {
        console.error('[Spotify] No s\'ha pogut carregar la cançó:', error);
        if (isMounted) addToast('No s’ha pogut carregar la informació de la cançó.', 'error');
      })
      .finally(() => {
        if (isMounted && requestId.current === currentRequestId) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialTrack, addToast]);

  const handlePlay = async () => {
    if (!track?.id) return;
    if (playingTrackId === track.id) {
      stopPreview(track.id);
      return;
    }

    if (track.preview_url) {
      const started = await playPreview(
        track.id,
        track.preview_url,
        () => addToast('No s’ha pogut reproduir la previsualització.', 'error'),
      );
      if (started) return;
    }
    setIsEmbedOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-emerald-400" />
        <p className="font-medium text-slate-400">Carregant la cançó des de Spotify...</p>
      </div>
    );
  }

  if (!track?.title) {
    return (
      <div className="py-20 text-center">
        <h1 className="mb-3 text-2xl font-bold text-white">Cançó no trobada</h1>
        <button
          type="button"
          onClick={() => onNavigate('search')}
          className="rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-slate-950"
        >
          Tornar a la cerca
        </button>
      </div>
    );
  }

  const isPlaying = playingTrackId === track.id;
  const comments = getTrackReviews(track.id);
  const ratedComments = comments.filter((comment) => Number(comment.rating) > 0);
  const averageRating = ratedComments.length
    ? ratedComments.reduce((total, comment) => total + Number(comment.rating), 0) / ratedComments.length
    : 0;
  const userComment = currentUser
    ? comments.find((comment) => comment.user_id === currentUser.id)
    : null;

  const handleOpenComment = (comment = null, rating = null) => {
    if (!currentUser) {
      addToast('Inicia sessió per valorar o comentar una cançó.', 'info');
      onNavigate('login');
      return;
    }
    setEditingComment(comment || userComment || null);
    setDraftRating(rating);
    setIsCommentModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <button
        type="button"
        onClick={() => track.albumId
          ? onNavigate('album', { albumId: track.albumId })
          : onNavigate('search')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-emerald-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {track.album ? `Tornar a ${track.album}` : 'Tornar a la cerca'}
      </button>

      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#18243a] via-[#111827] to-[#0b0f17] p-6 shadow-2xl sm:p-10">
        <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-end sm:text-left">
          <img
            src={track.cover_url || DEFAULT_COVER}
            alt={`Portada de ${track.album || track.title}`}
            onError={(event) => { event.currentTarget.src = DEFAULT_COVER; }}
            className="h-56 w-56 flex-shrink-0 rounded-2xl border border-slate-700/60 object-cover shadow-2xl sm:h-64 sm:w-64"
          />

          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 sm:justify-start">
              <Disc3 className="h-4 w-4" />
              Cançó
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              {track.title}
            </h1>
            <p className="mt-2 text-lg font-semibold text-slate-300">{track.artist}</p>
            {track.album && (
              <p className="mt-1 text-sm text-slate-400">{track.album}</p>
            )}
            {track.duration && (
              <p className="mt-3 text-sm font-mono text-slate-500">{track.duration}</p>
            )}

            <button
              type="button"
              onClick={handlePlay}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3 font-bold text-slate-950 shadow-lg shadow-emerald-950/30 transition-colors hover:bg-emerald-400"
              aria-label={isPlaying ? `Pausar ${track.title}` : `Reproduir ${track.title}`}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {isPlaying ? 'Pausa' : 'Reproduir'}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-[#111827]/70 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Valoració de la comunitat
            </h2>
            <div className="mt-2 flex items-center gap-4">
              <RatingStars value={averageRating} size="md" showNumber />
              <span className="text-xs text-slate-500">
                {ratedComments.length} {ratedComments.length === 1 ? 'valoració' : 'valoracions'}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3">
            {userComment?.rating ? (
              <RatingStars value={Number(userComment.rating)} size="md" showNumber />
            ) : (
              <span className="text-xs font-semibold text-slate-400">Encara no has valorat aquesta cançó</span>
            )}
            <button
              type="button"
              onClick={() => handleOpenComment(userComment)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              <MessageSquarePlus className="h-4 w-4" />
              {userComment ? 'Editar valoració i comentari' : 'Valorar i comentar'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-white">Comentaris de la cançó</h2>
            <p className="mt-1 text-xs text-slate-400">
              {comments.length} {comments.length === 1 ? 'comentari' : 'comentaris'}
            </p>
          </div>
        </div>

        {comments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
            <p className="text-sm text-slate-400">
              Encara no hi ha comentaris. Sigues el primer a compartir què et sembla aquesta cançó.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {comments.map((comment) => (
              <ReviewCard
                key={comment.id}
                review={comment}
                onEdit={handleOpenComment}
              />
            ))}
          </div>
        )}
      </section>

      {isEmbedOpen && (
        <SpotifyEmbedPlayer track={track} onClose={() => setIsEmbedOpen(false)} />
      )}
      <ReviewModal
        isOpen={isCommentModalOpen}
        onClose={() => {
          setIsCommentModalOpen(false);
          setEditingComment(null);
          setDraftRating(null);
        }}
        targetType="track"
        track={track}
        initialReview={editingComment}
        initialRating={draftRating}
        onRequireLogin={() => {
          addToast('Inicia sessió per valorar o comentar una cançó.', 'info');
          onNavigate('login');
        }}
      />
    </div>
  );
}
