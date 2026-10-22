import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { LogIn, Mail, Lock, AlertCircle, ArrowLeft, Shield, User } from 'lucide-react';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const { addToast } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      login({ email: email.trim(), password });
      addToast('Sessió iniciada correctament!', 'success');
      onNavigate('home');
    } catch (err) {
      setError(err.message || 'Error en iniciar sessió.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    try {
      login({ email: demoEmail, password: demoPassword });
      addToast('Sessió demo iniciada!', 'success');
      onNavigate('home');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Tornar a l'Inici
      </button>

      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Inicia la teva sessió</h2>
          <p className="text-xs text-slate-400 mt-1">
            Introdueix les teves credencials per accedir al teu perfil
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/80 border border-rose-600/70 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Correu electrònic
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="meloman@soundbox.cat"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Contrasenya
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? 'Entrant...' : 'Iniciar sessió'}
          </button>
        </form>

        {/* Quick Demo Logins for fast testing */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Accés Ràpid per a Avaluació / Demo
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('meloman@soundbox.cat', 'password123')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Usuari Estàndard
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@soundbox.cat', 'adminpassword')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-rose-300 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              Admin Moderador
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Encara no tens compte?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 ml-1"
          >
            Registra't aquí de franc
          </button>
        </div>
      </div>
    </div>
  );
}
