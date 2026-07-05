import { createClientsRepository } from './clientsRepository.js';
import { createEventsRepository } from './eventsRepository.js';
import { createLocalStorageRepositoryAdapter } from './localStorageRepositoryAdapter.js';
import { createProjectsRepository } from './projectsRepository.js';

export const createFlowDeskRepositories = ({ adapter = createLocalStorageRepositoryAdapter() } = {}) => ({
  adapter,
  clientsRepository: createClientsRepository(adapter),
  projectsRepository: createProjectsRepository(adapter),
  eventsRepository: createEventsRepository(adapter)
});

export const flowDeskRepositories = createFlowDeskRepositories();
