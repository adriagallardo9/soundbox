let audioElement = null;
let activeTrackId = null;
const listeners = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener(activeTrackId));
}

function clearCurrentAudio() {
  if (audioElement) {
    audioElement.pause();
    audioElement = null;
  }
  activeTrackId = null;
  notifyListeners();
}

export function subscribeToPlayback(listener) {
  listeners.add(listener);
  listener(activeTrackId);
  return () => listeners.delete(listener);
}

export function stopPreview(trackId = null) {
  if (trackId && trackId !== activeTrackId) return;
  clearCurrentAudio();
}

export async function playPreview(trackId, url, onError) {
  clearCurrentAudio();

  const audio = new Audio(url);
  audioElement = audio;
  activeTrackId = trackId;
  notifyListeners();

  const clearIfCurrent = () => {
    if (audioElement === audio) clearCurrentAudio();
  };
  audio.addEventListener('ended', clearIfCurrent, { once: true });
  audio.addEventListener('error', () => {
    if (audioElement !== audio) return;
    console.warn('[Audio] No s\'ha pogut carregar la previsualització.');
    clearIfCurrent();
    onError?.();
  }, { once: true });

  try {
    await audio.play();
    return audioElement === audio;
  } catch (error) {
    if (audioElement === audio) {
      console.warn('[Audio] No s\'ha pogut reproduir la previsualització:', error);
      clearIfCurrent();
      onError?.();
    }
    return false;
  }
}
