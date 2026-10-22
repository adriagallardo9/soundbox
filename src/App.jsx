import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { DataProvider } from './context/DataContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';

import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import AlbumDetailPage from './pages/AlbumDetailPage';
import ProfilePage from './pages/ProfilePage';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminModerationPage from './pages/AdminModerationPage';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const [viewParams, setViewParams] = useState({});

  // Parse URL hash for easy bookmarking and refresh support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (!hash) {
        setCurrentView('home');
        setViewParams({});
        return;
      }

      const [view, ...rest] = hash.split('/');
      if (view === 'album' && rest[0]) {
        setCurrentView('album');
        setViewParams({ albumId: rest[0] });
      } else if (view === 'playlist' && rest[0]) {
        setCurrentView('playlist-detail');
        setViewParams({ playlistId: rest[0] });
      } else if (view === 'profile') {
        setCurrentView('profile');
        setViewParams({ userId: rest[0] ? Number(rest[0]) : null });
      } else if (view === 'search') {
        const urlParams = new URLSearchParams(window.location.search);
        setCurrentView('search');
        setViewParams({ query: rest[0] || urlParams.get('q') || '' });
      } else if (['home', 'playlists', 'login', 'register', 'admin'].includes(view)) {
        setCurrentView(view);
        setViewParams({});
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view, params = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update hash
    if (view === 'home') window.location.hash = '#/';
    else if (view === 'album') window.location.hash = `#/album/${params.albumId}`;
    else if (view === 'playlist-detail') window.location.hash = `#/playlist/${params.playlistId}`;
    else if (view === 'profile') window.location.hash = params.userId ? `#/profile/${params.userId}` : '#/profile';
    else if (view === 'search') window.location.hash = params.query ? `#/search/${encodeURIComponent(params.query)}` : '#/search';
    else window.location.hash = `#/${view}`;
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentView === 'home' && (
          <HomePage onNavigate={navigateTo} />
        )}

        {currentView === 'search' && (
          <SearchPage
            initialQuery={viewParams.query || ''}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'album' && (
          <AlbumDetailPage
            albumId={viewParams.albumId}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'profile' && (
          <ProfilePage
            userId={viewParams.userId}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'playlists' && (
          <PlaylistsPage onNavigate={navigateTo} />
        )}

        {currentView === 'playlist-detail' && (
          <PlaylistDetailPage
            playlistId={viewParams.playlistId}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'login' && (
          <LoginPage onNavigate={navigateTo} />
        )}

        {currentView === 'register' && (
          <RegisterPage onNavigate={navigateTo} />
        )}

        {currentView === 'admin' && (
          <AdminModerationPage onNavigate={navigateTo} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Global Toast Alert Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
