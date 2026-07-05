import { describe, expect, it } from 'vitest';
import { SYNC_STATUSES, markPendingSync, normalizeSyncMetadata, normalizeSyncStatus } from '../../js/domain/syncMetadata.js';

describe('sync metadata readiness hooks', () => {
  it('normalizes sync status and metadata for future adapters', () => {
    const metadata = normalizeSyncMetadata({
      createdAt: '2026-07-05T10:00:00.000Z',
      updatedAt: 'broken-date',
      revision: '4',
      syncStatus: 'conflict'
    });

    expect(metadata).toEqual({
      createdAt: '2026-07-05T10:00:00.000Z',
      updatedAt: '',
      revision: 4,
      syncStatus: SYNC_STATUSES.CONFLICT
    });
    expect(normalizeSyncStatus('unknown')).toBe(SYNC_STATUSES.SYNCED);
  });

  it('marks local records as pending without changing the domain model globally', () => {
    const record = markPendingSync({ id: 'c1', name: 'Client', sync: { revision: 1 } }, '2026-07-05T11:00:00.000Z');

    expect(record).toMatchObject({
      id: 'c1',
      name: 'Client',
      sync: {
        updatedAt: '2026-07-05T11:00:00.000Z',
        revision: 2,
        syncStatus: SYNC_STATUSES.PENDING
      }
    });
  });
});
