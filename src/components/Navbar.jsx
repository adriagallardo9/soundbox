import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Disc3,
  Bookmark,
  User,
  LogOut,
  ShieldAlert,
  ListMusic,
  Menu,
  X,
  Sparkles,
  Users
} from 'lucide-react';

export default function Navbar({
  currentView,
  onNavigate,
  onOpenSearch
}) {
  const { currentUser, isAdmin, logout, switchUser, availableUsers } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      onNavigate('search', { query: quickSearch.trim() });
      setQuickSearch('');
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { id: 'home', label: 'Inici', icon: Disc3 },
    { id: 'search', label: 'Cercador', icon: Search },
    { id: 'playlists', label: 'Llistes', icon: ListMusic },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Moderació', icon: ShieldAlert, badge: 'Admin' });
  }

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f17]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform duration-300">
              <Disc3 className="w-6 h-6 text-slate-950 animate-spin-slow" />
            </div>
            <div>
              <span className="font-black text-xl sm:text-2xl tracking-tight text-white flex items-center">
                SOUND<span className="text-emerald-400">BOXD</span>
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
                Diari Musical
              </span>
            </div>
          </div>

          {/* Desktop Search Bar (RF-03) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center flex-1 max-w-md relative mx-4"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Cerca àlbums, artistes o cançons..."
              className="w-full bg-[#131c2e] hover:bg-[#172238] focus:bg-[#172238] border border-slate-800 focus:border-emerald-500 rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-400 transition-all outline-none"
            />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Controls & Demo Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Demo Switcher Quick Menu */}
            <div className="relative">
              <select
                value={currentUser ? currentUser.id : ''}
                onChange={(e) => {
                  if (e.target.value) switchUser(Number(e.target.value));
                  else logout();
                }}
                className="bg-slate-900 border border-slate-700/80 hover:border-emerald-500 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
                title="Canviar d'usuari per provar rols (User vs Admin)"
                aria-label="Selector ràpid d'usuari demo"
              >
                <option value="" disabled>Canvia usuari demo</option>
                {availableUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === 'admin' ? '🛡️ Admin' : '👤 Usuari'})
                  </option>
                ))}
              </select>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('profile', { userId: currentUser.id })}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all group"
                  aria-label="Veure perfil d'usuari"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 block leading-tight">
                      {currentUser.username}
                    </span>
                  </div>
                </button>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                  title="Tancar sessió"
                  aria-label="Tancar sessió"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-colors"
                >
                  Inicia sessió
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all shadow-md shadow-emerald-500/20"
                >
                  Registra't
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Obrir menú principal"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0f172a] px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Cerca àlbums o artistes..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 outline-none"
            />
          </form>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile User Section */}
          <div className="pt-3 border-t border-slate-800/80">
            {currentUser ? (
              <div className="space-y-3">
                <div
                  onClick={() => {
                    onNavigate('profile', { userId: currentUser.id });
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full border border-emerald-500/40"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-100">{currentUser.name}</div>
                    <div className="text-xs text-slate-400">@{currentUser.username} ({currentUser.role})</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <select
                    value={currentUser.id}
                    onChange={(e) => switchUser(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-xl px-2.5 py-2"
                  >
                    {availableUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 rounded-xl"
                  >
                    <LogOut className="w-4 h-4" />
                    Tancar sessió
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 text-center text-sm font-semibold text-slate-200 bg-slate-800 rounded-xl"
                >
                  Inicia sessió
                </button>
                <button
                  onClick={() => {
                    onNavigate('register');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 text-center text-sm font-bold bg-emerald-500 text-slate-950 rounded-xl"
                >
                  Registra't
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
