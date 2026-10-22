import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initDatabase,
  getCurrentUser,
  setCurrentUser as persistCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
  getUsers
} from '../services/storageService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    initDatabase();
    const user = getCurrentUser();
    setCurrentUserState(user);
    setAvailableUsers(getUsers());
    setLoading(false);
  }, []);

  const refreshUsers = () => {
    setAvailableUsers(getUsers());
  };

  const login = (credentials) => {
    const user = loginUser(credentials);
    setCurrentUserState(user);
    return user;
  };

  const register = (data) => {
    const user = registerUser(data);
    setCurrentUserState(user);
    refreshUsers();
    return user;
  };

  const logout = () => {
    logoutUser();
    setCurrentUserState(null);
  };

  // Funció auxiliar per canviar ràpidament d'usuari a la demo (Usuari normal vs Admin)
  const switchUser = (userId) => {
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
        isAdmin,
        loading,
        availableUsers,
        login,
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
