import { createCollectionRepository } from './collectionRepository.js';

export const createClientsRepository = (adapter) =>
  createCollectionRepository({
    adapter,
    collectionName: 'clients'
  });
