import React, { useState, useEffect } from 'react';
import RatingStars from './RatingStars';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { X, Star, AlertCircle, Check } from 'lucide-react';

export default function ReviewModal({
  isOpen,
  onClose,
  album,
  track = null,
  targetType = 'album',
  initialReview = null,
  initialRating = null,
  onRequireLogin = null
}) {
  const { currentUser } = useAuth();
  const { submitReview } = useData();

  const [rating, setRating] = useState(5.0);
  const [reviewText, setReviewText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialReview) {
      setRating(initialRating ?? (Number(initialReview.rating) || (targetType === 'track' ? 0 : 5.0)));
      setReviewText(initialReview.review_text || '');
    } else {
      setRating(initialRating ?? (targetType === 'track' ? 0 : 5.0));
      setReviewText('');
    }
    setErrorMessage('');
  }, [initialReview?.id, initialReview?.rating, initialReview?.review_text, initialRating, isOpen, targetType]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Comprovació de sessió (Excepció 1)
    if (!currentUser) {
      if (onRequireLogin) onRequireLogin();
      onClose();
      return;
    }

    // Validació (Excepció 2 de la memòria: camp buit o > 2000 caràcters)
    const trimmed = reviewText.trim();
    if (!Number.isFinite(Number(rating)) || Number(rating) < 0.1 || Number(rating) > 5 || Math.abs(Number(rating) * 10 - Math.round(Number(rating) * 10)) > 1e-8) {
      setErrorMessage('Tria una valoració de 0,1 a 5 logos de SoundBoxd, en increments de 0,1.');
      return;
    }

    if (trimmed.length > 2000) {
      setErrorMessage(`El text supera el límit permès de 2000 caràcters (actualment en té ${trimmed.length}).`);
      return;
    }

    const success = submitReview({
      id: initialReview?.id,
      albumId: targetType === 'track' ? track?.albumId || null : album.id,
      rating,
      reviewText: trimmed,
      albumMeta: targetType === 'album' ? album : null,
      reviewType: targetType,
      trackId: targetType === 'track' ? track?.id : null,
      trackMeta: targetType === 'track' ? track : null
    });

    if (success) {
      onClose();
    }
  };

  const charCount = reviewText.length;
  const isOverLimit = charCount > 2000;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
          aria-label="Tancar formulari"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-800">
          <img
            src={(targetType === 'track' ? track?.cover_url : album?.cover_url) || '/album-placeholder.svg'}
            alt={targetType === 'track' ? track?.title : album?.title}
            className="w-14 h-14 rounded-xl object-cover shadow-md"
          />
          <div>
            <h3 id="modal-title" className="font-extrabold text-lg text-white">
              {targetType === 'track'
                ? initialReview ? 'Editar valoració i comentari' : 'Valorar la cançó'
                : initialReview ? 'Editar la teva ressenya' : 'Puntuar i ressenyar'}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1">
              {targetType === 'track' ? track?.title : album?.title}
              {' · '}
              <span className="text-emerald-400">
                {targetType === 'track' ? track?.artist : album?.artist}
              </span>
            </p>
          </div>
        </div>

        {/* Error alert en vermell (Excepció 2) */}
        {errorMessage && (
          <div
            className="mb-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-600/70 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating Stars Selection */}
          {(
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                La teva valoració (0,1 a 5 logos de SoundBoxd)
              </label>
              <div className="flex items-center gap-4 p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
                <RatingStars
                  value={rating}
                  onChange={(newVal) => {
                    setRating(newVal);
                    setErrorMessage('');
                  }}
                  interactive
                  size="lg"
                />
              </div>
            </div>
          )}

          {/* Review Text */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="review-text" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {targetType === 'track' ? 'Comentari (opcional)' : 'Ressenya (opcional)'}
              </label>
              <span className={`text-[11px] font-mono ${isOverLimit ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                {charCount} / 2000 caràcters
              </span>
            </div>
            <textarea
              id="review-text"
              rows={5}
              value={reviewText}
              onChange={(e) => {
                setReviewText(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder={targetType === 'track'
                ? 'Afegeix un comentari (opcional) sobre aquesta cançó...'
                : "Què t'ha transmès aquest disc? (opcional)"}
              className="w-full px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {!reviewText.trim()
                ? 'Desar valoració'
                : initialReview
                ? targetType === 'track' ? 'Actualitzar comentari' : 'Actualitzar ressenya'
                : targetType === 'track' ? 'Publicar comentari' : 'Publicar ressenya'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
