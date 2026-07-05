const getStorageArea = () => {
  try {
    return globalThis.localStorage || null;
  } catch (error) {
    console.warn('Storage access failed', error);
    return null;
  }
};

export const storage = {
  isAvailable() {
    const storageArea = getStorageArea();
    if (!storageArea) return false;

    try {
      const probeKey = '__flowdesk_storage_probe__';
      storageArea.setItem(probeKey, '1');
      storageArea.removeItem(probeKey);
      return true;
    } catch (error) {
      console.warn('Storage availability check failed', error);
      return false;
    }
  },
  get(key, fallback = null) {
    try {
      const storageArea = getStorageArea();
      if (!storageArea) return fallback;
      const raw = storageArea.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn('Storage read failed', error);
      return fallback;
    }
  },
  set(key, value) {
    try {
      const storageArea = getStorageArea();
      if (!storageArea) return false;
      storageArea.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Storage write failed', error);
      return false;
    }
  },
  remove(key) {
    try {
      const storageArea = getStorageArea();
      if (!storageArea) return false;
      storageArea.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Storage remove failed', error);
      return false;
    }
  }
};
