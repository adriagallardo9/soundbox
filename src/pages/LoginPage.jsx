import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { LogIn, Mail, Lock, AlertCircle, ArrowLeft, Shield, User } from 'lucide-react';

// Icona de Google SVG inline
function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage({ onNavigate }) {
  const { login, loginGoogle } = useAuth();
  const { addToast } = useNotification();
  const googleClientConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  // Google OAuth Login — flux popup
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError('');
      try {
        // Obtenir informació del perfil de Google
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        if (!res.ok) throw new Error('No s\'ha pogut obtenir el perfil de Google.');
        const profile = await res.json();

        const { user, isNew, cloudError } = await loginGoogle({
          googleId: profile.sub,
          email: profile.email,
          name: profile.name,
          avatar: profile.picture
        }, tokenResponse.access_token);

        addToast(
          isNew
            ? `Benvingut/da a SoundBoxd, ${user.name}! Compte creat via Google.`
            : `Benvingut/da de nou, ${user.name}!`,
          'success'
        );
        if (cloudError) {
          addToast(`Sessió iniciada, però no s’ha pogut activar la funció pública: ${cloudError.message}`, 'error');
        }
        onNavigate('home');
      } catch (err) {
        setError(err.message || 'Error en iniciar sessió amb Google.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError('El login amb Google ha estat cancel·lat o ha fallat.');
      setGoogleLoading(false);
    }
  });

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

        {/* Botó Google OAuth */}
        <button
          type="button"
          onClick={() => {
            if (!googleClientConfigured) {
              setError('Configura VITE_GOOGLE_CLIENT_ID per habilitar l’inici de sessió amb Google.');
              return;
            }
            handleGoogleLogin();
          }}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 mb-5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-all border border-gray-200 shadow-sm disabled:opacity-60"
        >
          <GoogleIcon />
          {googleLoading ? 'Connectant amb Google...' : 'Continua amb Google'}
        </button>

        {/* Divisor */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">o amb correu</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

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
