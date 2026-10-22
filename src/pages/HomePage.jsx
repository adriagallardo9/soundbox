import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import AlbumGrid from '../components/AlbumGrid';
import ReviewCard from '../components/ReviewCard';
import RatingStars from '../components/RatingStars';
import {
  Sparkles,
  Search,
  Bookmark,
  TrendingUp,
  MessageSquare,
  Disc3,
  Award,
  ArrowRight,
  ListMusic
} from 'lucide-react';

export default function HomePage({ onNavigate }) {
  const { allAlbums, allReviews, allPlaylists, getAlbumStats } = useData();
  const { currentUser } = useAuth();

  // Top rated albums (sorted by average rating)
  const topRatedAlbums = [...allAlbums]
    .map(album => ({
      ...album,
      stats: getAlbumStats(album.id)
    }))
    .sort((a, b) => b.stats.average - a.stats.average)
    .slice(0, 6);

  // Recent reviews from community
  const recentReviews = [...allReviews]
    .map(review => ({
      ...review,
      album: allAlbums.find(a => a.id === review.album_id),
      user: {
        username: review.user_id === 1 ? 'meloman_cat' : review.user_id === 2 ? 'adria_admin' : 'clara_valls',
        name: review.user_id === 1 ? 'Adrià Melòman' : review.user_id === 2 ? 'Adrià Gallardo' : 'Clara Valls',
        role: review.user_id === 2 ? 'admin' : 'user',
        avatar: review.user_id === 1
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : review.user_id === 2
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      }
    }))
    .slice(0, 3);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-[#111a2e] to-[#0b0f17] border border-slate-800 p-8 sm:p-12 lg:p-16 text-center sm:text-left">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4" />
            La xarxa social per a melòmans i melòmanes
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Descobreix, puntua i comparteix el teu <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">diari musical</span>.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            L'experiència definitiva estil <em>Letterboxd</em> per a àlbums i cançons.
            Connecta amb el catàleg de Spotify, redacta ressenyes detallades, mantén la teva
            llista d'escolta i crea col·leccions úniques.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 justify-center sm:justify-start">
            <button
              onClick={() => onNavigate('search')}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2 group"
            >
              <Search className="w-4 h-4" />
              Explora el Catàleg
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {!currentUser && (
              <button
                onClick={() => onNavigate('register')}
                className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all"
              >
                Crea un compte de franc
              </button>
            )}

            {currentUser && (
              <button
                onClick={() => onNavigate('profile', { userId: currentUser.id })}
                className="px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
              >
                <Bookmark className="w-4 h-4 text-emerald-400" />
                El teu Perfil i Diari
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Highlights */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-black text-white">{allAlbums.length}+</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Discos Catalogats</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">{allReviews.length}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Ressenyes de la Comunitat</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-black text-teal-300">{allPlaylists.length}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Llistes Temàtiques</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-black text-white">100%</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Passió Musical</div>
          </div>
        </div>
      </section>

      {/* Featured / Popular Albums */}
      <section>
        <AlbumGrid
          title="Àlbums Més Populars i Millor Valorats"
          subtitle="Els discos amb més puntuacions i aclamació de la comunitat SoundBoxd"
          albums={topRatedAlbums}
          onSelectAlbum={(albumId) => onNavigate('album', { albumId })}
        />
      </section>

      {/* Community Feed: Recent Reviews (RF-04, RF-05) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
              Ressenyes Recents de la Comunitat
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Descobreix opinions detallades de melòmans sobre els seus darrers descobriments
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentReviews.map((rev) => (
            <ReviewCard
              key={rev.id}
              review={rev}
              showAlbum={true}
              onSelectAlbum={(id) => onNavigate('album', { albumId: id })}
            />
          ))}
        </div>
      </section>

      {/* Themed Playlists Preview (RF-07) */}
      <section className="p-8 rounded-3xl bg-[#111827]/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <ListMusic className="w-4 h-4" />
            Col·leccions Temàtiques
          </div>
          <h3 className="text-2xl font-black text-white">
            Crea la teva llista d'àlbums imprescindibles
          </h3>
          <p className="text-sm text-slate-400 max-w-xl">
            Agrupa àlbums per any, gènere o estat d'ànim i comparteix-los públicament amb els teus amics.
          </p>
        </div>
        <button
          onClick={() => onNavigate('playlists')}
          className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          Explorar Llistes
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
}
