import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getListenlist, getUserPlaylists, getReviewsByUser } from '../services/storageService';
import ReviewCard from '../components/ReviewCard';
import AlbumGrid from '../components/AlbumGrid';
import ReviewModal from '../components/ReviewModal';
import PlaylistModal from '../components/PlaylistModal';
import {
  User,
  Calendar,
  Star,
  Bookmark,
  ListMusic,
  Plus,
  Shield,
  Trash2,
  Lock,
  Globe,
  Disc3,
  ExternalLink
} from 'lucide-react';

export default function ProfilePage({ userId = null, onNavigate }) {
  const { currentUser, isAdmin } = useAuth();
  const { dataVersion, removePlaylist } = useData();

  // If userId is provided, view that user, otherwise current user
  const effectiveUserId = userId || (currentUser ? currentUser.id : 1);
  const isOwnProfile = currentUser && currentUser.id === effectiveUserId;

  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'listenlist' | 'playlists'
  const [editingReview, setEditingReview] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);

  // Load user data
  const userReviews = getReviewsByUser(effectiveUserId);
  const listenlistItems = getListenlist(effectiveUserId);
  const userPlaylists = getUserPlaylists(effectiveUserId);

  const displayUser = isOwnProfile && currentUser
    ? currentUser
    : {
        id: effectiveUserId,
        name: 'Adrià Melòman',
        username: 'meloman_cat',
        bio: 'Col·leccionista de vinils i apassionat per la música.',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        created_at: '2026-01-15T10:00:00Z'
      };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setIsReviewModalOpen(true);
  };

  const handleDeletePlaylist = (playlistId) => {
    if (window.confirm('Vols eliminar aquesta llista i totes les seves referències?')) {
      removePlaylist(playlistId);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Profile Header */}
      <section className="relative rounded-3xl bg-gradient-to-r from-[#131c2e] via-[#101726] to-[#0b0f17] border border-slate-800 p-6 sm:p-10 shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={displayUser.avatar}
            alt={displayUser.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-slate-800 object-cover shadow-2xl"
          />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {displayUser.name}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                @{displayUser.username}
              </span>
              {displayUser.role === 'admin' && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Moderador Admin
                </span>
              )}
            </div>

            <p className="text-sm text-slate-300 max-w-xl">
              {displayUser.bio || 'Melòman a SoundBoxd.'}
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Membre des de {new Date(displayUser.created_at || Date.now()).getFullYear()}
              </span>
            </div>
          </div>

          {/* Quick Profile Stats */}
          <div className="flex sm:flex-col gap-4 sm:gap-2 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-8 text-center sm:text-right">
            <div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                {userReviews.length}
              </div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Ressenyes</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {listenlistItems.length}
              </div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Pendents</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-teal-300">
                {userPlaylists.length}
              </div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Llistes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-4 h-4" />
            Diari de Ressenyes ({userReviews.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('listenlist')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'listenlist'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Escoltar més tard ({listenlistItems.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('playlists')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'playlists'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListMusic className="w-4 h-4" />
            Llistes Temàtiques ({userPlaylists.length})
          </button>
        </div>

        {activeTab === 'playlists' && isOwnProfile && (
          <button
            type="button"
            onClick={() => setIsCreatePlaylistOpen(true)}
            className="mb-3 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nova Llista
          </button>
        )}
      </div>

      {/* Tab 1: User's Reviews (RF-05, RF-08) */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {userReviews.length === 0 ? (
            <div className="py-16 text-center bg-[#111827]/40 rounded-2xl border border-slate-800">
              <Star className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Encara no has publicat cap ressenya musical.</p>
              <button
                onClick={() => onNavigate('search')}
                className="mt-4 px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Cercar àlbums per valorar
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {userReviews.map((rev) => (
                <ReviewCard
                  key={rev.id}
                  review={rev}
                  showAlbum={true}
                  onSelectAlbum={(albId) => onNavigate('album', { albumId: albId })}
                  onEdit={handleEditReview}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Listenlist (Escoltar més tard - RF-06) */}
      {activeTab === 'listenlist' && (
        <div>
          <AlbumGrid
            albums={listenlistItems.map(item => item.album)}
            onSelectAlbum={(albId) => onNavigate('album', { albumId: albId })}
            emptyMessage="No tens cap àlbum a la teva llista d'Escoltar més tard. Afegeix-ne des de la cerca o fitxes d'àlbum!"
          />
        </div>
      )}

      {/* Tab 3: Themed Playlists (RF-07) */}
      {activeTab === 'playlists' && (
        <div className="space-y-6">
          {userPlaylists.length === 0 ? (
            <div className="py-16 text-center bg-[#111827]/40 rounded-2xl border border-slate-800">
              <ListMusic className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No s'ha creat cap llista temàtica encara.</p>
              {isOwnProfile && (
                <button
                  onClick={() => setIsCreatePlaylistOpen(true)}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Crear primera llista
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="p-5 rounded-2xl bg-[#131c2e] border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        {playlist.is_public ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Globe className="w-3.5 h-3.5" /> Pública
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-400">
                            <Lock className="w-3.5 h-3.5" /> Privada
                          </span>
                        )}
                      </div>
                      {isOwnProfile && (
                        <button
                          type="button"
                          onClick={() => handleDeletePlaylist(playlist.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Eliminar llista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <h3 className="font-bold text-lg text-white mb-1.5">
                      {playlist.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {playlist.description || 'Sense descripció'}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => onNavigate('playlist-detail', { playlistId: playlist.id })}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      Veure contingut
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] text-slate-500">
                      {new Date(playlist.created_at).toLocaleDateString('ca-ES')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Edit Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setEditingReview(null);
        }}
        album={editingReview?.album}
        initialReview={editingReview}
      />

      {/* Create Playlist Modal (RF-07) */}
      <PlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />
    </div>
  );
}
