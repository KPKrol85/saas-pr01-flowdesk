import { REPOSITORY_ERRORS, repositoryFail, repositoryOk } from './repositoryResults.js';

export const createCollectionRepository = ({ adapter, collectionName }) => {
  const listRecords = () => adapter.loadState()[collectionName] || [];
  const getRecord = (id) => listRecords().find((record) => record.id === id) || null;

  const replaceCollection = (records) =>
    adapter.updateState((state) => ({
      ...state,
      [collectionName]: records
    }));

  const resolveSavedData = (state, data) => {
    if (Array.isArray(data)) return state[collectionName] || [];
    return state[collectionName]?.find((record) => record.id === data?.id) || data;
  };

  const commitCollection = (records, data) => {
    const result = replaceCollection(records);
    return result.ok ? repositoryOk(resolveSavedData(result.state, data), result.state) : result;
  };

  return {
    list() {
      return repositoryOk(listRecords(), adapter.loadState());
    },
    getById(id) {
      const record = getRecord(id);
      return record ? repositoryOk(record, adapter.loadState()) : repositoryFail(REPOSITORY_ERRORS.NOT_FOUND);
    },
    create(input) {
      return commitCollection([...listRecords(), input], input);
    },
    update(id, input) {
      const records = listRecords();
      if (!records.some((record) => record.id === id)) return repositoryFail(REPOSITORY_ERRORS.NOT_FOUND);
      const nextRecord = { ...records.find((record) => record.id === id), ...input, id };

      return commitCollection(
        records.map((record) => (record.id === id ? nextRecord : record)),
        nextRecord
      );
    },
    archive(id, archivedAt = new Date().toISOString()) {
      const record = getRecord(id);
      if (!record) return repositoryFail(REPOSITORY_ERRORS.NOT_FOUND);

      return this.update(id, { archivedAt });
    },
    restore(id) {
      const record = getRecord(id);
      if (!record) return repositoryFail(REPOSITORY_ERRORS.NOT_FOUND);

      return this.update(id, { archivedAt: '' });
    },
    remove(id) {
      const records = listRecords();
      if (!records.some((record) => record.id === id)) return repositoryFail(REPOSITORY_ERRORS.NOT_FOUND);
      const removedRecord = records.find((record) => record.id === id);

      return commitCollection(
        records.filter((record) => record.id !== id),
        removedRecord
      );
    },
    replaceAll(records) {
      const nextRecords = Array.isArray(records) ? records : [];
      return commitCollection(nextRecords, nextRecords);
    }
  };
};
