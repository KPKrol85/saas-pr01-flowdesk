import { ROLES, normalizeRole } from './rbac.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const createValidationResult = (value, errors) => ({
  valid: errors.length === 0,
  errors,
  value
});

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'active'|'disabled'} status
 */

/**
 * @typedef {Object} Organization
 * @property {string} id
 * @property {string} name
 * @property {string} plan
 */

/**
 * @typedef {Object} Membership
 * @property {string} id
 * @property {string} userId
 * @property {string} organizationId
 * @property {'Owner'|'Manager'|'Member'|'Viewer'} role
 */

export const createUserModel = (overrides = {}) => ({
  id: 'u-demo-owner',
  name: 'Alicja Maj',
  email: 'alicja@flowdesk.pl',
  status: 'active',
  ...overrides
});

export const createOrganizationModel = (overrides = {}) => ({
  id: 'org-flowdesk-demo',
  name: 'FlowDesk Demo Workspace',
  plan: 'demo',
  ...overrides
});

export const createMembershipModel = (overrides = {}) => ({
  id: 'mem-demo-owner',
  userId: 'u-demo-owner',
  organizationId: 'org-flowdesk-demo',
  role: ROLES.OWNER,
  ...overrides
});

export const normalizeUser = (input = {}) => {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};

  return createUserModel({
    id: normalizeString(source.id) || 'u-demo-owner',
    name: normalizeString(source.name) || 'Alicja Maj',
    email: normalizeString(source.email).toLowerCase(),
    status: source.status === 'disabled' ? 'disabled' : 'active'
  });
};

export const validateUser = (input) => {
  const value = normalizeUser(input);
  const errors = [];

  if (!value.id) errors.push({ field: 'id', message: 'Missing user id.' });
  if (!value.name) errors.push({ field: 'name', message: 'Missing user name.' });
  if (!value.email || !EMAIL_PATTERN.test(value.email)) errors.push({ field: 'email', message: 'Invalid user email.' });

  return createValidationResult(value, errors);
};

export const normalizeOrganization = (input = {}) => {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};

  return createOrganizationModel({
    id: normalizeString(source.id) || 'org-flowdesk-demo',
    name: normalizeString(source.name) || 'FlowDesk Demo Workspace',
    plan: normalizeString(source.plan) || 'demo'
  });
};

export const validateOrganization = (input) => {
  const value = normalizeOrganization(input);
  const errors = [];

  if (!value.id) errors.push({ field: 'id', message: 'Missing organization id.' });
  if (!value.name) errors.push({ field: 'name', message: 'Missing organization name.' });

  return createValidationResult(value, errors);
};

export const normalizeMembership = (input = {}) => {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};

  return createMembershipModel({
    id: normalizeString(source.id) || 'mem-demo-owner',
    userId: normalizeString(source.userId) || 'u-demo-owner',
    organizationId: normalizeString(source.organizationId) || 'org-flowdesk-demo',
    role: normalizeRole(normalizeString(source.role) || ROLES.OWNER)
  });
};

export const validateMembership = (input) => {
  const value = normalizeMembership(input);
  const errors = [];

  if (!value.id) errors.push({ field: 'id', message: 'Missing membership id.' });
  if (!value.userId) errors.push({ field: 'userId', message: 'Missing membership user id.' });
  if (!value.organizationId) errors.push({ field: 'organizationId', message: 'Missing membership organization id.' });

  return createValidationResult(value, errors);
};

export const createDemoUserContext = ({ email = 'alicja@flowdesk.pl', name = 'Alicja Maj', role = ROLES.OWNER } = {}) => {
  const user = normalizeUser({ email, name });
  const organization = createOrganizationModel();
  const membership = createMembershipModel({
    userId: user.id,
    organizationId: organization.id,
    role: normalizeRole(role)
  });

  return { user, organization, membership };
};
