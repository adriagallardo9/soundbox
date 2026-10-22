import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import {
  getAlbums,
  getReviews,
  getPlaylists,
  getReviewsByAlbum,
  getReviewsByUser,
  getAlbumRatingStats,
  addOrUpdateReview,
  deleteReview,
  getListenlist,
  isInListenlist,
  toggleListenlist,
  getUserPlaylists,
  createPlaylist,
  addAlbumToPlaylist,
  removeAlbumFromPlaylist,
  deletePlaylist
} from '../services/storageService';

const DataContext = createContext();

export function DataProvider({ children }) {
  const { currentUser, isAdmin } = useAuth();
  const { addToast } = useNotification();
  const [dataVersion, setDataVersion] = useState(0);

  const refresh = useCallback(() => {
    setDataVersion(v => v + 1);
  }, []);

  const getAlbumStats = useCallback((albumId) => {
    // dataVersion dependency triggers recalculation
    return getAlbumRatingStats(albumId);
  }, [dataVersion]);

  const getAlbumReviews = useCallback((albumId) => {
    return getReviewsByAlbum(albumId);
  }, [dataVersion]);

  const submitReview = useCallback(({ id, albumId, rating, reviewText, albumMeta }) => {
    if (!currentUser) {
      addToast('Cal iniciar sessió per publicar una ressenya.', 'error');
      return false;
    }
    try {
      addOrUpdateReview({
        id,
        userId: currentUser.id,
        albumId,
        rating,
        reviewText,
        albumMeta
      });
      refresh();
      addToast('Ressenya publicada correctament!', 'success');
      return true;
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  }, [currentUser, refresh, addToast]);

  const removeReview = useCallback((reviewId) => {
    if (!currentUser) {
      addToast('Has d\'iniciar sessió.', 'error');
      return false;
    }
    try {
      deleteReview(reviewId, currentUser.id, currentUser.role);
      refresh();
      addToast('Ressenya eliminada.', 'info');
      return true;
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  }, [currentUser, refresh, addToast]);

  const checkInListenlist = useCallback((albumId) => {
    if (!currentUser) return false;
    return isInListenlist(currentUser.id, albumId);
  }, [currentUser, dataVersion]);

  const toggleListenlistAlbum = useCallback((albumId, albumMeta) => {
    if (!currentUser) {
      addToast('Inicia sessió per desar àlbums a Escoltar més tard.', 'error');
      return false;
    }
    try {
      const added = toggleListenlist(currentUser.id, albumId, albumMeta);
      refresh();
      if (added) {
        addToast('Àlbum afegit a "Escoltar més tard"!', 'success');
      } else {
        addToast('Àlbum eliminat de "Escoltar més tard".', 'info');
      }
      return added;
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  }, [currentUser, refresh, addToast]);

  const createNewPlaylist = useCallback(({ title, description, isPublic }) => {
    if (!currentUser) {
      addToast('Cal iniciar sessió per crear llistes.', 'error');
      return null;
    }
    try {
      const pl = createPlaylist({
        userId: currentUser.id,
        title,
        description,
        isPublic
      });
      refresh();
      addToast('Llista creada amb èxit!', 'success');
      return pl;
    } catch (err) {
      addToast(err.message, 'error');
      return null;
    }
  }, [currentUser, refresh, addToast]);

  const addAlbumToUserPlaylist = useCallback((playlistId, albumId, albumMeta) => {
    try {
      addAlbumToPlaylist(playlistId, albumId, albumMeta);
      refresh();
      addToast('Àlbum afegit a la llista!', 'success');
      return true;
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  }, [refresh, addToast]);

  const removeAlbumFromUserPlaylist = useCallback((playlistId, albumId) => {
    try {
      removeAlbumFromPlaylist(playlistId, albumId);
      refresh();
      addToast('Àlbum eliminat de la llista.', 'info');
      return true;
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  }, [refresh, addToast]);

  const removePlaylist = useCallback((playlistId) => {
    if (!currentUser) return false;
    try {
      deletePlaylist(playlistId, currentUser.id, currentUser.role);
      refresh();
      addToast('Llista eliminada correctament.', 'info');
      return true;
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  }, [currentUser, refresh, addToast]);

  return (
    <DataContext.Provider
      value={{
        dataVersion,
        refresh,
        getAlbumStats,
        getAlbumReviews,
        submitReview,
        removeReview,
        checkInListenlist,
        toggleListenlistAlbum,
        createNewPlaylist,
        addAlbumToUserPlaylist,
        removeAlbumFromUserPlaylist,
        removePlaylist,
        allReviews: getReviews(),
        allAlbums: getAlbums(),
        allPlaylists: getPlaylists()
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
