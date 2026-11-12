import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useGoogleOAuth } from '@react-oauth/google';
import {
  initDatabase,
  getCurrentUser,
  setCurrentUser as persistCurrentUser,
  loginUser,
  loginWithGoogle,
  registerUser,
  logoutUser,
  getUsers
} from '../services/storageService';
import {
  clearCloudSession,
  establishGoogleSession,
  getCloudSession
} from '../services/sharedPlaylistService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [cloudUser, setCloudUser] = useState(null);
  const [cloudAuthReady, setCloudAuthReady] = useState(false);
  const [cloudAuthError, setCloudAuthError] = useState('');
  const [silentGoogleUser, setSilentGoogleUser] = useState(null);
  const cloudAuthRequest = useRef(0);
  const authBootstrapStarted = useRef(false);
  const expectedGoogleId = useRef(null);
  const silentGoogleAttempt = useRef(null);
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();

  useEffect(() => {
    if (authBootstrapStarted.current) return;
    authBootstrapStarted.current = true;
    initDatabase();
    const user = getCurrentUser(); // Comprova si la sessió és vàlida (no caducada)
    setCurrentUserState(user);
    setAvailableUsers(getUsers());

    const requestId = ++cloudAuthRequest.current;
    getCloudSession()
      .then(async ({ user: sessionUser }) => {
        if (requestId !== cloudAuthRequest.current) return;
        if (sessionUser) {
          const matchesLocalUser = user && (user.googleId
            ? user.googleId === sessionUser.sub
            : user.email?.toLowerCase() === sessionUser.email?.toLowerCase());
          if (user && !matchesLocalUser) {
            await clearCloudSession();
            if (user.googleId && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
              expectedGoogleId.current = user.googleId;
              setSilentGoogleUser(user);
            } else {
              setCloudAuthError('La sessió Google activa no correspon a l’usuari actual.');
              setCloudAuthReady(true);
            }
            return;
          }
          setCloudUser(sessionUser);
          setCloudAuthError('');
          if (!user || !user.googleId) {
            const restored = loginWithGoogle({
              googleId: sessionUser.sub,
              email: sessionUser.email,
              name: sessionUser.name,
              avatar: sessionUser.picture
            });
            setCurrentUserState(restored.user);
            setAvailableUsers(getUsers());
          }
          setCloudAuthReady(true);
          return;
        }

        if (user?.googleId && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
          expectedGoogleId.current = user.googleId;
          setSilentGoogleUser(user);
          return;
        }

        setCloudUser(null);
        setCloudAuthReady(true);
      })
      .catch(() => {
        if (requestId !== cloudAuthRequest.current) return;
        setCloudUser(null);
        setCloudAuthError('No s’ha pogut comprovar la sessió de Google.');
        setCloudAuthReady(true);
      })
      .finally(() => {
        if (requestId === cloudAuthRequest.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!silentGoogleUser || !scriptLoadedSuccessfully) return undefined;
    const requestId = cloudAuthRequest.current;
    const attemptKey = `${requestId}:${silentGoogleUser.googleId}`;
    if (silentGoogleAttempt.current === attemptKey) return undefined;
    silentGoogleAttempt.current = attemptKey;

    const finish = (error = '') => {
      if (requestId !== cloudAuthRequest.current) return;
      if (error) setCloudAuthError(error);
      setSilentGoogleUser(null);
      setCloudAuthReady(true);
    };

    const googleOAuth = window.google?.accounts?.oauth2;
    if (!googleOAuth || !clientId) {
      finish('No s’ha pogut restaurar la sessió de Google en segon pla.');
      return undefined;
    }

    try {
      const tokenClient = googleOAuth.initTokenClient({
        client_id: clientId,
        scope: 'openid profile email',
        callback: async (tokenResponse) => {
          if (requestId !== cloudAuthRequest.current) return;
          if (!tokenResponse.access_token) {
            finish('No s’ha pogut restaurar la sessió de Google en segon pla.');
            return;
          }

          try {
            const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            if (!profileResponse.ok) {
              throw new Error('No s’ha pogut verificar la sessió de Google.');
            }
            const profile = await profileResponse.json();
            if (profile.sub !== expectedGoogleId.current) {
              throw new Error('El compte de Google actiu no coincideix amb l’usuari de SoundBox.');
            }

            const { user: sessionUser } = await establishGoogleSession(tokenResponse.access_token);
            if (requestId === cloudAuthRequest.current) {
              setCloudUser(sessionUser);
              setCloudAuthError('');
              setSilentGoogleUser(null);
              setCloudAuthReady(true);
            }
          } catch (error) {
            finish(error.message);
          }
        },
        error_callback: () => finish('Cal tornar a confirmar la sessió de Google per valorar llistes.'),
      });
      tokenClient.requestAccessToken({ prompt: 'none', hint: silentGoogleUser.email });
    } catch (error) {
      finish(error.message || 'No s’ha pogut restaurar la sessió de Google en segon pla.');
    }
    return undefined;
  }, [clientId, scriptLoadedSuccessfully, silentGoogleUser]);

  const refreshUsers = () => {
    setAvailableUsers(getUsers());
  };

  const login = (credentials) => {
    cloudAuthRequest.current += 1;
    setSilentGoogleUser(null);
    setCloudUser(null);
    setCloudAuthError('');
    setCloudAuthReady(true);
    clearCloudSession().catch((error) => {
      console.error('[Cloudflare] No s’ha pogut tancar la sessió compartida:', error);
    });
    const user = loginUser(credentials);
    setCurrentUserState(user);
    return user;
  };

  const loginGoogle = async (googleUserData, accessToken) => {
    const requestId = ++cloudAuthRequest.current;
    setSilentGoogleUser(null);
    setCloudUser(null);
    setCloudAuthError('');
    let cloudError = null;
    try {
      await clearCloudSession();
      const { user: sessionUser } = await establishGoogleSession(accessToken);
      if (requestId === cloudAuthRequest.current) {
        setCloudUser(sessionUser);
        setCloudAuthError('');
      }
    } catch (error) {
      cloudError = error;
      if (requestId === cloudAuthRequest.current) {
        setCloudUser(null);
        setCloudAuthError(error.message);
      }
    } finally {
      if (requestId === cloudAuthRequest.current) setCloudAuthReady(true);
    }

    const { user, isNew } = loginWithGoogle(googleUserData);
    setCurrentUserState(user);
    refreshUsers();
    return { user, isNew, cloudError };
  };

  const register = (data) => {
    cloudAuthRequest.current += 1;
    setSilentGoogleUser(null);
    setCloudUser(null);
    setCloudAuthError('');
    setCloudAuthReady(true);
    clearCloudSession().catch((error) => {
      console.error('[Cloudflare] No s’ha pogut tancar la sessió compartida:', error);
    });
    const user = registerUser(data);
    setCurrentUserState(user);
    refreshUsers();
    return user;
  };

  const logout = () => {
    cloudAuthRequest.current += 1;
    setSilentGoogleUser(null);
    setCloudUser(null);
    setCloudAuthError('');
    setCloudAuthReady(true);
    clearCloudSession().catch((error) => {
      console.error('[Cloudflare] No s’ha pogut tancar la sessió compartida:', error);
    });
    logoutUser();
    setCurrentUserState(null);
  };

  // Funció auxiliar per canviar ràpidament d'usuari a la demo (Usuari normal vs Admin)
  const switchUser = (userId) => {
    cloudAuthRequest.current += 1;
    setSilentGoogleUser(null);
    setCloudUser(null);
    setCloudAuthError('');
    setCloudAuthReady(true);
    clearCloudSession().catch((error) => {
      console.error('[Cloudflare] No s’ha pogut tancar la sessió compartida:', error);
    });
    const users = getUsers();
    const target = users.find(u => u.id === Number(userId));
    if (target) {
      persistCurrentUser(target);
      setCurrentUserState(target);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        cloudUser,
        cloudAuthReady,
        cloudAuthError,
        isAdmin,
        loading,
        availableUsers,
        login,
        loginGoogle,
        register,
        logout,
        switchUser,
        refreshUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
