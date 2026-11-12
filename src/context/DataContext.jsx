import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import {
  getAlbums,
  getPlaylistById,
  getReviews,
  getPlaylists,
  getReviewsByAlbum,
  getReviewsByTrack,
  getReviewsByUser,
  getAlbumRatingStats,
  addOrUpdateReview,
  deleteReview,
  getListenlist,
  isInListenlist,
  toggleListenlist,
  createPlaylist,
  addAlbumToPlaylist,
  removeAlbumFromPlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  deletePlaylist,
  replacePlaylistId,
  tracksMatch
} from '../services/storageService';
import { refreshLocalAlbumCovers } from '../services/spotifyApi';
import {
  createSharedPlaylist,
  deleteSharedPlaylist,
  getSharedPlaylists,
  importSharedPlaylist,
  rateSharedPlaylist,
  recordSharedPlaylistView,
  updateSharedPlaylist
} from '../services/sharedPlaylistService';

const DataContext = createContext();

export function DataProvider({ children }) {
  const { currentUser, cloudUser } = useAuth();
  const { addToast } = useNotification();
  const [dataVersion, setDataVersion] = useState(0);
  const [sharedPlaylists, setSharedPlaylists] = useState([]);
  const [sharedPlaylistsError, setSharedPlaylistsError] = useState('');
  const [sharedPlaylistsLoading, setSharedPlaylistsLoading] = useState(true);
  const importedUsers = useRef(new Set());

  const refresh = useCallback(() => {
    setDataVersion(v => v + 1);
  }, []);

  const reloadSharedPlaylists = useCallback(async () => {
    setSharedPlaylistsLoading(true);
    try {
      const { playlists } = await getSharedPlaylists();
      setSharedPlaylists(playlists);
      setSharedPlaylistsError('');
      return true;
    } catch (error) {
      setSharedPlaylistsError(error.message);
      return false;
    } finally {
      setSharedPlaylistsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadSharedPlaylists();
  }, [reloadSharedPlaylists]);

  useEffect(() => {
    if (
      !cloudUser?.sub
      || currentUser?.googleId !== cloudUser.sub
      || sharedPlaylistsLoading
      || importedUsers.current.has(cloudUser.sub)
    ) return;

    importedUsers.current.add(cloudUser.sub);
    const legacyPlaylists = getPlaylists().filter((playlist) => (
      playlist.is_public
      && playlist.user_id === currentUser.id
      && Number(playlist.id) > 3
    ));
    if (legacyPlaylists.length === 0) return;

    const importLegacyPlaylists = async () => {
      try {
        for (const localPlaylist of legacyPlaylists) {
          const localDetail = getPlaylistById(localPlaylist.id);
          const { playlist } = await importSharedPlaylist({
            sourceLocalId: localPlaylist.id,
            title: localPlaylist.title,
            description: localPlaylist.description,
            tracks: localDetail.tracks,
            albums: localDetail.albums.map((item) => item.album),
          });
          replacePlaylistId(localPlaylist.id, playlist.id);
          setSharedPlaylists((current) => [
            playlist,
            ...current.filter((item) => item.id !== playlist.id),
          ]);
        }
        refresh();
      } catch (error) {
        importedUsers.current.delete(cloudUser.sub);
        setSharedPlaylistsError(`No s’han pogut compartir les llistes existents: ${error.message}`);
      }
    };

    importLegacyPlaylists();
  }, [cloudUser, currentUser, sharedPlaylistsLoading, refresh]);

  useEffect(() => {
    let isMounted = true;
    refreshLocalAlbumCovers()
      .then((updated) => {
        if (isMounted && updated > 0) refresh();
      })
      .catch((error) => {
        console.error('[Spotify] No s\'han pogut actualitzar les portades del catàleg:', error);
      });

    return () => {
      isMounted = false;
    };
  }, [refresh]);

  const getAlbumStats = useCallback((albumId) => {
    // dataVersion dependency triggers recalculation
    return getAlbumRatingStats(albumId);
  }, [dataVersion]);

  const getAlbumReviews = useCallback((albumId) => {
    return getReviewsByAlbum(albumId);
  }, [dataVersion]);

  const getTrackReviewsList = useCallback((trackId) => (
    getReviewsByTrack(trackId)
  ), [dataVersion]);

  const submitReview = useCallback(({
    id,
    albumId,
    rating,
    reviewText,
    albumMeta,
    reviewType = 'album',
    trackId = null,
    trackMeta = null
  }) => {
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
        albumMeta,
        reviewType,
        trackId,
        trackMeta
      });
      refresh();
      const successMessage = reviewText.trim()
        ? reviewType === 'track' ? 'Valoració i comentari desats!' : 'Valoració i ressenya desades!'
        : 'Valoració desada!';
      addToast(successMessage, 'success');
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

  const createNewPlaylist = useCallback(async ({ title, description, isPublic, tracks = [] }) => {
    if (!currentUser) {
      addToast('Cal iniciar sessió per crear llistes.', 'error');
      return null;
    }
    try {
      if (isPublic) {
        if (!cloudUser?.sub || cloudUser.sub !== currentUser.googleId) {
          throw new Error('Inicia sessió amb Google per compartir una llista pública.');
        }
        const { playlist } = await createSharedPlaylist({ title, description, tracks, albums: [] });
        setSharedPlaylists((current) => [playlist, ...current.filter((item) => item.id !== playlist.id)]);
        refresh();
        addToast('Llista pública creada i compartida amb tothom!', 'success');
        return playlist;
      }

      const pl = createPlaylist({
        userId: currentUser.id,
        title,
        description,
        isPublic,
        tracks
      });
      refresh();
      addToast('Llista privada creada amb èxit!', 'success');
      return pl;
    } catch (err) {
      addToast(err.message, 'error');
      return null;
    }
  }, [currentUser, cloudUser, refresh, addToast]);

  const addAlbumToUserPlaylist = useCallback(async (playlistId, albumId, albumMeta) => {
    try {
      const sharedPlaylist = sharedPlaylists.find((item) => String(item.id) === String(playlistId));
      if (sharedPlaylist) {
        if (cloudUser?.sub !== sharedPlaylist.owner_google_id) {
          throw new Error('Només la persona propietària pot modificar aquesta llista.');
        }
        const albums = sharedPlaylist.albums.map((item) => item.album || item);
        if (!albums.some((item) => item.id === albumId)) {
          const { playlist } = await updateSharedPlaylist(playlistId, { albums: [...albums, albumMeta] });
          setSharedPlaylists((current) => current.map((item) => item.id === playlist.id ? playlist : item));
        }
        refresh();
        addToast('Àlbum afegit a la llista!', 'success');
        return true;
      }
      addAlbumToPlaylist(playlistId, albumId, albumMeta);
      refresh();
      addToast('Àlbum afegit a la llista!', 'success');
      return true;
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  }, [sharedPlaylists, cloudUser, refresh, addToast]);

  const removeAlbumFromUserPlaylist = useCallback(async (playlistId, albumId) => {
    try {
      const sharedPlaylist = sharedPlaylists.find((item) => String(item.id) === String(playlistId));
      if (sharedPlaylist) {
        if (cloudUser?.sub !== sharedPlaylist.owner_google_id) {
          throw new Error('Només la persona propietària pot modificar aquesta llista.');
        }
        const albums = sharedPlaylist.albums
          .map((item) => item.album || item)
          .filter((item) => item.id !== albumId);
        const { playlist } = await updateSharedPlaylist(playlistId, { albums });
        setSharedPlaylists((current) => current.map((item) => item.id === playlist.id ? playlist : item));
        refresh();
        addToast('Àlbum eliminat de la llista.', 'info');
        return true;
      }
      removeAlbumFromPlaylist(playlistId, albumId);
      refresh();
      addToast('Àlbum eliminat de la llista.', 'info');
      return true;
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  }, [sharedPlaylists, cloudUser, refresh, addToast]);

  const addTrackToUserPlaylist = useCallback(async (playlistId, track) => {
    if (!currentUser) {
      addToast('Inicia sessió per afegir cançons a una llista.', 'error');
      return false;
    }
    try {
      const sharedPlaylist = sharedPlaylists.find((item) => String(item.id) === String(playlistId));
      if (sharedPlaylist) {
        if (cloudUser?.sub !== sharedPlaylist.owner_google_id) {
          throw new Error('Només la persona propietària pot modificar aquesta llista.');
        }
        if (sharedPlaylist.tracks.some((existing) => tracksMatch(existing, track))) {
          addToast('Aquesta cançó ja és a la llista.', 'info');
          return false;
        }
        const { playlist } = await updateSharedPlaylist(playlistId, {
          tracks: [...sharedPlaylist.tracks, track],
        });
        setSharedPlaylists((current) => current.map((item) => item.id === playlist.id ? playlist : item));
        refresh();
        addToast('Cançó afegida a la llista!', 'success');
        return true;
      }
      const added = addTrackToPlaylist(playlistId, track, currentUser.id, currentUser.role);
      if (!added) {
        addToast('Aquesta cançó ja és a la llista.', 'info');
        return false;
      }
      refresh();
      addToast('Cançó afegida a la llista!', 'success');
      return true;
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  }, [currentUser, cloudUser, sharedPlaylists, refresh, addToast]);

  const removeTrackFromUserPlaylist = useCallback(async (playlistId, track) => {
    if (!currentUser) return false;
    try {
      const sharedPlaylist = sharedPlaylists.find((item) => String(item.id) === String(playlistId));
      if (sharedPlaylist) {
        if (cloudUser?.sub !== sharedPlaylist.owner_google_id) {
          throw new Error('Només la persona propietària pot modificar aquesta llista.');
        }
        const tracks = sharedPlaylist.tracks.filter((existing) => !tracksMatch(existing, track));
        const { playlist } = await updateSharedPlaylist(playlistId, { tracks });
        setSharedPlaylists((current) => current.map((item) => item.id === playlist.id ? playlist : item));
        refresh();
        addToast('Cançó eliminada de la llista.', 'info');
        return true;
      }
      const removed = removeTrackFromPlaylist(playlistId, track, currentUser.id, currentUser.role);
      if (removed) {
        refresh();
        addToast('Cançó eliminada de la llista.', 'info');
      }
      return removed;
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  }, [currentUser, cloudUser, sharedPlaylists, refresh, addToast]);

  const removePlaylist = useCallback(async (playlistId) => {
    if (!currentUser) return false;
    try {
      if (sharedPlaylists.some((item) => String(item.id) === String(playlistId))) {
        const sharedPlaylist = sharedPlaylists.find((item) => String(item.id) === String(playlistId));
        if (cloudUser?.sub !== sharedPlaylist.owner_google_id) {
          throw new Error('Només la persona propietària pot eliminar aquesta llista.');
        }
        await deleteSharedPlaylist(playlistId);
        setSharedPlaylists((current) => current.filter((item) => String(item.id) !== String(playlistId)));
        refresh();
        addToast('Llista eliminada correctament.', 'info');
        return true;
      }
      deletePlaylist(playlistId, currentUser.id, currentUser.role);
      refresh();
      addToast('Llista eliminada correctament.', 'info');
      return true;
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  }, [currentUser, cloudUser, sharedPlaylists, refresh, addToast]);

  const ratePlaylist = useCallback(async (playlistId, rating) => {
    try {
      const { playlist } = await rateSharedPlaylist(playlistId, rating);
      setSharedPlaylists((current) => current.map((item) => item.id === playlist.id ? playlist : item));
      addToast('Valoració desada!', 'success');
      return true;
    } catch (error) {
      addToast(error.message, 'error');
      return false;
    }
  }, [addToast]);

  const viewPlaylist = useCallback(async (playlistId) => {
    try {
      const { playlist } = await recordSharedPlaylistView(playlistId);
      setSharedPlaylists((current) => current.map((item) => item.id === playlist.id ? playlist : item));
    } catch (error) {
      setSharedPlaylistsError(error.message);
    }
  }, []);

  const localPlaylists = getPlaylists();
  const allPlaylists = [
    ...sharedPlaylists,
    ...localPlaylists.filter((local) => !sharedPlaylists.some((shared) => String(shared.id) === String(local.id))),
  ];

  return (
    <DataContext.Provider
      value={{
        dataVersion,
        refresh,
        sharedPlaylists,
        sharedPlaylistsError,
        sharedPlaylistsLoading,
        reloadSharedPlaylists,
        ratePlaylist,
        viewPlaylist,
        getAlbumStats,
        getAlbumReviews,
        getTrackReviews: getTrackReviewsList,
        submitReview,
        removeReview,
        checkInListenlist,
        toggleListenlistAlbum,
        createNewPlaylist,
        addAlbumToUserPlaylist,
        removeAlbumFromUserPlaylist,
        addTrackToUserPlaylist,
        removeTrackFromUserPlaylist,
        removePlaylist,
        allReviews: getReviews(),
        allAlbums: getAlbums(),
        allPlaylists
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
