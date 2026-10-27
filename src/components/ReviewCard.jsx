import React from 'react';
import RatingStars from './RatingStars';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Edit2, Trash2, ShieldAlert, Disc3 } from 'lucide-react';

export default function ReviewCard({
  review,
  onEdit = null,
  showAlbum = false,
  onSelectAlbum = null
}) {
  const { currentUser, isAdmin } = useAuth();
  const { removeReview } = useData();

  const isAuthor = currentUser && review.user_id === currentUser.id;
  const canDelete = isAuthor || isAdmin;

  const handleDelete = () => {
    const confirmMsg = isAdmin && !isAuthor
      ? "Segur que vols eliminar aquesta ressenya com a Administrador per moderació?"
      : "Segur que vols eliminar la teva ressenya?";
    if (window.confirm(confirmMsg)) {
      removeReview(review.id);
    }
  };

  const formattedDate = review.created_at
    ? new Date(review.created_at).toLocaleDateString('ca-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : '';

  return (
    <article className="p-5 rounded-2xl bg-[#131c2e]/90 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between gap-3 shadow-md">
      {/* Optional Album Header for Profile / Feed */}
      {showAlbum && review.album && (
        <div
          onClick={() => onSelectAlbum && onSelectAlbum(review.album.id)}
          className="flex items-center gap-3 pb-3 border-b border-slate-800/80 cursor-pointer group"
        >
          <img
            src={review.album.cover_url || '/album-placeholder.svg'}
            alt={review.album.title}
            className="w-12 h-12 rounded-lg object-cover group-hover:scale-105 transition-transform"
          />
          <div>
            <h4 className="font-bold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors">
              {review.album.title}
            </h4>
            <p className="text-xs text-slate-400">{review.album.artist}</p>
          </div>
        </div>
      )}

      {/* Header: User Info & Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={
              review.user?.avatar ||
              `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                review.user?.username || 'user'
              )}`
            }
            alt={review.user?.username || 'Usuari'}
            className="w-10 h-10 rounded-full border border-emerald-500/30 object-cover bg-slate-800"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-200">
                {review.user?.name || review.user?.username || 'Usuari'}
              </span>
              {review.user?.role === 'admin' && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Admin
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400">@{review.user?.username || 'anònim'}</span>
          </div>
        </div>

        {/* Rating and Date */}
        <div className="flex flex-col items-end gap-1">
          <RatingStars value={review.rating} size="sm" showNumber />
          <span className="text-[11px] text-slate-500">{formattedDate}</span>
        </div>
      </div>

      {/* Review Content */}
      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line my-1">
        {review.review_text}
      </p>

      {/* Footer / Action Buttons (RF-08 & RF-09) */}
      {canDelete && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60 mt-1">
          {isAuthor && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(review)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Editar
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              !isAuthor && isAdmin
                ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/50'
                : 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30'
            }`}
            title={!isAuthor && isAdmin ? 'Moderar com a administrador' : 'Eliminar la teva ressenya'}
          >
            {!isAuthor && isAdmin ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Eliminar (Admin)
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </>
            )}
          </button>
        </div>
      )}
    </article>
  );
}
