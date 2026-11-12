import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const cloudAuthRequest = useRef(0);

  useEffect(() => {
    initDatabase();
    const user = getCurrentUser(); // Comprova si la sessió és vàlida (no caducada)
    setCurrentUserState(user);
    setAvailableUsers(getUsers());
    setLoading(false);

    const requestId = ++cloudAuthRequest.current;
    getCloudSession()
      .then(({ user: sessionUser }) => {
        if (requestId === cloudAuthRequest.current) setCloudUser(sessionUser);
      })
      .catch(() => {
        if (requestId === cloudAuthRequest.current) setCloudUser(null);
      })
      .finally(() => {
        if (requestId === cloudAuthRequest.current) setCloudAuthReady(true);
      });
  }, []);

  const refreshUsers = () => {
    setAvailableUsers(getUsers());
  };

  const login = (credentials) => {
    cloudAuthRequest.current += 1;
    setCloudUser(null);
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
    setCloudUser(null);
    let cloudError = null;
    try {
      await clearCloudSession();
      const { user: sessionUser } = await establishGoogleSession(accessToken);
      if (requestId === cloudAuthRequest.current) setCloudUser(sessionUser);
    } catch (error) {
      cloudError = error;
      if (requestId === cloudAuthRequest.current) setCloudUser(null);
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
    setCloudUser(null);
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
    setCloudUser(null);
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
    setCloudUser(null);
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
