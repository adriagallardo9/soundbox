import React, { useState, useEffect } from 'react';
import RatingStars from './RatingStars';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { X, Star, AlertCircle, Check } from 'lucide-react';

export default function ReviewModal({
  isOpen,
  onClose,
  album,
  initialReview = null,
  onRequireLogin = null
}) {
  const { currentUser } = useAuth();
  const { submitReview } = useData();

  const [rating, setRating] = useState(5.0);
  const [reviewText, setReviewText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialReview) {
      setRating(Number(initialReview.rating) || 5.0);
      setReviewText(initialReview.review_text || '');
    } else {
      setRating(5.0);
      setReviewText('');
    }
    setErrorMessage('');
  }, [initialReview, isOpen]);

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
    if (!trimmed) {
      setErrorMessage("La ressenya no pot estar buida. Escriu la teva opinió sobre l'àlbum.");
      return;
    }

    if (trimmed.length > 2000) {
      setErrorMessage(`El text supera el límit permès de 2000 caràcters (actualment en té ${trimmed.length}).`);
      return;
    }

    const success = submitReview({
      id: initialReview?.id,
      albumId: album.id,
      rating,
      reviewText: trimmed,
      albumMeta: album
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
            src={album?.cover_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'}
            alt={album?.title}
            className="w-14 h-14 rounded-xl object-cover shadow-md"
          />
          <div>
            <h3 id="modal-title" className="font-extrabold text-lg text-white">
              {initialReview ? 'Editar la teva ressenya' : 'Puntuar i ressenyar'}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1">
              {album?.title} · <span className="text-emerald-400">{album?.artist}</span>
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
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              La teva valoració (1 a 5 estrelles)
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
              <span className="text-xl font-black text-emerald-400">{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="review-text" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                El teu comentari / ressenya
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
              placeholder="Què t'ha transmès aquest disc? Quines cançons en destaques?"
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
              {initialReview ? 'Actualitzar ressenya' : 'Publicar ressenya'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
