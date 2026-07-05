export const REPOSITORY_ERRORS = Object.freeze({
  NOT_FOUND: 'not_found',
  VALIDATION: 'validation_failed',
  STORAGE: 'storage_failed'
});

export const repositoryOk = (data, state = null) => ({
  ok: true,
  data,
  state
});

export const repositoryFail = (error, issues = []) => ({
  ok: false,
  error,
  issues
});
