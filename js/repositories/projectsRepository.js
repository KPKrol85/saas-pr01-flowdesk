import { createCollectionRepository } from './collectionRepository.js';

export const createProjectsRepository = (adapter) =>
  createCollectionRepository({
    adapter,
    collectionName: 'projects'
  });
