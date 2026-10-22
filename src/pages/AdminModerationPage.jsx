import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getReviews, getUsers, getAlbums } from '../services/storageService';
import ReviewCard from '../components/ReviewCard';
import { ShieldAlert, ShieldCheck, Search, Filter, AlertTriangle } from 'lucide-react';

export default function AdminModerationPage({ onNavigate }) {
  const { currentUser, isAdmin } = useAuth();
  const { dataVersion } = useData();

  const [filterQuery, setFilterQuery] = useState('');
  const [filterRating, setFilterRating] = useState('all');

  const allReviews = getReviews();
  const users = getUsers();
  const albums = getAlbums();

  const enrichedReviews = allReviews.map(r => ({
    ...r,
    user: users.find(u => u.id === r.user_id) || { username: 'Anònim', name: 'Usuari' },
    album: albums.find(a => a.id === r.album_id) || { title: 'Àlbum', artist: 'Artista' }
  }));

  const filteredReviews = enrichedReviews.filter(rev => {
    const matchesText =
      rev.review_text.toLowerCase().includes(filterQuery.toLowerCase()) ||
      rev.user.username.toLowerCase().includes(filterQuery.toLowerCase()) ||
      rev.album.title.toLowerCase().includes(filterQuery.toLowerCase());

    const matchesRating =
      filterRating === 'all' || Math.round(rev.rating) === Number(filterRating);

    return matchesText && matchesRating;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-950/40 via-[#161d2d] to-[#0b0f17] border border-rose-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            Panell de Moderació per a Administradors (RF-09)
          </div>
          <h1 className="text-3xl font-black text-white">
            Moderació Global de Ressenyes
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Com a administrador, tens autoritat per revisar el contingut publicat per la comunitat
            i suprimir comentaris ofensius o spam mitjançant l'acció <strong>Eliminar (Admin)</strong>.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 text-center min-w-[140px]">
          <div className="text-3xl font-black text-rose-400">{allReviews.length}</div>
          <div className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Ressenyes Totals</div>
        </div>
      </div>

      {/* Role Notice */}
      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span>
            Actualment estàs connectat com a usuari estàndard. Per provar la moderació com a administrador, fes servir el selector d'usuaris a la barra superior i tria <strong>Adrià Gallardo (Admin)</strong>.
          </span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#111827] p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filtrar per paraula clau, usuari o àlbum..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 outline-none w-full sm:w-auto"
          >
            <option value="all">Totes les puntuacions</option>
            <option value="5">5 estrelles</option>
            <option value="4">4 estrelles</option>
            <option value="3">3 estrelles</option>
            <option value="2">2 estrelles</option>
            <option value="1">1 estrella</option>
          </select>
        </div>
      </div>

      {/* Reviews Stream */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="py-16 text-center bg-[#111827]/40 rounded-2xl border border-slate-800">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No hi ha cap ressenya que coincideixi amb els filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredReviews.map((rev) => (
              <ReviewCard
                key={rev.id}
                review={rev}
                showAlbum={true}
                onSelectAlbum={(albId) => onNavigate('album', { albumId: albId })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
