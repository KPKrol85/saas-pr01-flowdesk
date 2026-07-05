import { createCollectionRepository } from './collectionRepository.js';

export const createEventsRepository = (adapter) =>
  createCollectionRepository({
    adapter,
    collectionName: 'events'
  });
