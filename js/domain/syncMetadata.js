export const SYNC_STATUSES = Object.freeze({
  SYNCED: 'synced',
  PENDING: 'pending',
  CONFLICT: 'conflict'
});

export const SYNC_STATUS_VALUES = Object.freeze(Object.values(SYNC_STATUSES));

const normalizeString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const isValidDateValue = (value) => {
  const normalized = normalizeString(value);
  return Boolean(normalized) && !Number.isNaN(new Date(normalized).getTime());
};

const normalizeRevision = (value) => {
  const revision = Number(value);
  return Number.isInteger(revision) && revision >= 0 ? revision : 0;
};

export const normalizeSyncStatus = (status) => {
  const normalized = normalizeString(status);
  return SYNC_STATUS_VALUES.includes(normalized) ? normalized : SYNC_STATUSES.SYNCED;
};

export const createSyncMetadata = (overrides = {}) => ({
  createdAt: '',
  updatedAt: '',
  revision: 0,
  syncStatus: SYNC_STATUSES.SYNCED,
  ...overrides
});

export const normalizeSyncMetadata = (input = {}) => {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};

  return createSyncMetadata({
    createdAt: isValidDateValue(source.createdAt) ? normalizeString(source.createdAt) : '',
    updatedAt: isValidDateValue(source.updatedAt) ? normalizeString(source.updatedAt) : '',
    revision: normalizeRevision(source.revision),
    syncStatus: normalizeSyncStatus(source.syncStatus)
  });
};

export const markPendingSync = (record, timestamp = new Date().toISOString()) => {
  const source = record && typeof record === 'object' && !Array.isArray(record) ? record : {};
  const currentSync = normalizeSyncMetadata(source.sync);

  return {
    ...source,
    sync: createSyncMetadata({
      ...currentSync,
      updatedAt: isValidDateValue(timestamp) ? timestamp : new Date().toISOString(),
      revision: currentSync.revision + 1,
      syncStatus: SYNC_STATUSES.PENDING
    })
  };
};
