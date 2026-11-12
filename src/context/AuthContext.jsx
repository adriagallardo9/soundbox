import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useGoogleOAuth } from '@react-oauth/google';
import {
  initDatabase,
  getCurrentUser,
  setCurrentUser as persistCurrentUser,
  loginUser,
  logoutUser,
  getUsers,
  syncAccountUser
} from '../services/storageService';
import {
  clearCloudSession,
  establishGoogleSession,
  getCloudSession,
  loginCloudAccount,
  migrateLegacyAccount,
  registerCloudAccount
} from '../services/sharedPlaylistService';

const AuthContext = createContext();

async function authenticateStoredUser(user) {
  const credentials = { email: user.email, password: user.password };
  try {
    return await loginCloudAccount(credentials);
  } catch (error) {
    if (error.status !== 401 || !user.username) throw error;

    const verifiedLocalUser = loginUser(credentials);
    return migrateLegacyAccount({
      ...credentials,
      username: verifiedLocalUser.username,
      name: verifiedLocalUser.name,
    });
  }
}

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
          const matchesLocalUser = user
            && user.email?.toLowerCase() === sessionUser.email?.toLowerCase();
          if (user && !matchesLocalUser) {
            await clearCloudSession();
            if (user.password) {
              const { user: account } = await authenticateStoredUser(user);
              if (requestId !== cloudAuthRequest.current) return;
              const synced = syncAccountUser(account).user;
              setCurrentUserState(synced);
              setAvailableUsers(getUsers());
              setCloudUser(account);
              setCloudAuthError('');
              setCloudAuthReady(true);
            } else if (user.googleId && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
              expectedGoogleId.current = user.googleId;
              setSilentGoogleUser(user);
            } else {
              setCloudAuthError('La sessió activa no correspon a l’usuari actual.');
              setCloudAuthReady(true);
            }
            return;
          }
          const synced = syncAccountUser(sessionUser).user;
          setCurrentUserState(synced);
          setAvailableUsers(getUsers());
          setCloudUser(sessionUser);
          setCloudAuthError('');
          setCloudAuthReady(true);
          return;
        }

        if (user?.password) {
          const { user: account } = await authenticateStoredUser(user);
          if (requestId !== cloudAuthRequest.current) return;
          const synced = syncAccountUser(account).user;
          setCurrentUserState(synced);
          setAvailableUsers(getUsers());
          setCloudUser(account);
          setCloudAuthError('');
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
      .catch((error) => {
        if (requestId !== cloudAuthRequest.current) return;
        setCloudUser(null);
        setCloudAuthError(error.message || 'No s’ha pogut comprovar la sessió.');
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
            if (sessionUser.googleSub !== silentGoogleUser.googleId) {
              throw new Error('El compte de Google actiu no coincideix amb l’usuari de SoundBox.');
            }
            if (requestId === cloudAuthRequest.current) {
              const synced = syncAccountUser(sessionUser).user;
              setCurrentUserState(synced);
              setAvailableUsers(getUsers());
              setCloudUser(sessionUser);
              setCloudAuthError('');
              setSilentGoogleUser(null);
              setCloudAuthReady(true);
            }
          } catch (error) {
            finish(error.message);
          }
        },
        error_callback: () => finish('Cal tornar a iniciar sessió per valorar llistes.'),
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

  const login = async (credentials) => {
    const requestId = ++cloudAuthRequest.current;
    setSilentGoogleUser(null);
    setCloudUser(null);
    setCloudAuthError('');
    setCloudAuthReady(false);
    let response;
    try {
      try {
        response = await loginCloudAccount(credentials);
      } catch (error) {
        if (error.status !== 401) throw error;
        const legacyUser = loginUser(credentials);
        response = await migrateLegacyAccount({
          ...credentials,
          username: legacyUser.username,
          name: legacyUser.name,
        });
      }
    } catch (error) {
      if (requestId === cloudAuthRequest.current) {
        setCloudUser(null);
        setCloudAuthError(error.message);
        setCloudAuthReady(true);
      }
      throw error;
    }

    if (requestId !== cloudAuthRequest.current) return null;
    const user = syncAccountUser(response.user).user;
    setCurrentUserState(user);
    setAvailableUsers(getUsers());
    setCloudUser(response.user);
    setCloudAuthError('');
    setCloudAuthReady(true);
    return user;
  };

  const loginGoogle = async (googleUserData, accessToken) => {
    const requestId = ++cloudAuthRequest.current;
    setSilentGoogleUser(null);
    setCloudUser(null);
    setCloudAuthError('');
    setCloudAuthReady(false);
    try {
      await clearCloudSession();
      const { user: sessionUser } = await establishGoogleSession(accessToken);
      if (requestId !== cloudAuthRequest.current) return null;
      if (sessionUser.googleSub !== googleUserData.googleId) {
        throw new Error('El compte de Google no coincideix amb el perfil verificat.');
      }
      const { user, isNew } = syncAccountUser(sessionUser);
      setCurrentUserState(user);
      setAvailableUsers(getUsers());
      setCloudUser(sessionUser);
      setCloudAuthError('');
      setCloudAuthReady(true);
      return { user, isNew, cloudError: null };
    } catch (error) {
      if (requestId === cloudAuthRequest.current) {
        setCloudUser(null);
        setCloudAuthError(error.message);
        setCloudAuthReady(true);
      }
      throw error;
    }
  };

  const register = async (data) => {
    const requestId = ++cloudAuthRequest.current;
    setSilentGoogleUser(null);
    setCloudUser(null);
    setCloudAuthError('');
    setCloudAuthReady(false);
    try {
      const { user: account } = await registerCloudAccount(data);
      if (requestId !== cloudAuthRequest.current) return null;
      const { user } = syncAccountUser(account);
      setCurrentUserState(user);
      setAvailableUsers(getUsers());
      setCloudUser(account);
      setCloudAuthError('');
      setCloudAuthReady(true);
      return user;
    } catch (error) {
      if (requestId === cloudAuthRequest.current) {
        setCloudAuthError(error.message);
        setCloudAuthReady(true);
      }
      throw error;
    }
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
  const switchUser = async (userId) => {
    const target = getUsers().find((user) => user.id === Number(userId));
    if (!target || target.id === currentUser?.id) return;
    if (!target.password) {
      setCloudAuthError('Per canviar a aquest compte, inicia sessió amb les seves credencials.');
      return;
    }

    const requestId = ++cloudAuthRequest.current;
    setSilentGoogleUser(null);
    setCloudUser(null);
    setCloudAuthReady(false);
    setCloudAuthError('');
    try {
      const { user: account } = await loginCloudAccount({
        email: target.email,
        password: target.password,
      });
      if (requestId !== cloudAuthRequest.current) return;
      const synced = syncAccountUser(account).user;
      persistCurrentUser(synced);
      setCurrentUserState(synced);
      setAvailableUsers(getUsers());
      setCloudUser(account);
      setCloudAuthReady(true);
    } catch (error) {
      if (requestId === cloudAuthRequest.current) {
        setCloudAuthError(error.message);
        setCloudAuthReady(true);
      }
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
