export const ROLES = Object.freeze({
  OWNER: 'Owner',
  MANAGER: 'Manager',
  MEMBER: 'Member',
  VIEWER: 'Viewer'
});

export const ROLE_VALUES = Object.freeze(Object.values(ROLES));

export const PERMISSIONS = Object.freeze({
  CLIENT_READ: 'client:read',
  CLIENT_WRITE: 'client:write',
  CLIENT_ARCHIVE: 'client:archive',
  PROJECT_READ: 'project:read',
  PROJECT_WRITE: 'project:write',
  PROJECT_ARCHIVE: 'project:archive',
  EVENT_READ: 'event:read',
  EVENT_WRITE: 'event:write',
  DATA_IMPORT: 'data:import',
  DATA_EXPORT: 'data:export',
  SETTINGS_WRITE: 'settings:write',
  ORGANIZATION_ADMIN: 'organization:admin'
});

const ownerPermissions = Object.values(PERMISSIONS);
const managerPermissions = ownerPermissions.filter((permission) => permission !== PERMISSIONS.ORGANIZATION_ADMIN);
const memberPermissions = [
  PERMISSIONS.CLIENT_READ,
  PERMISSIONS.CLIENT_WRITE,
  PERMISSIONS.PROJECT_READ,
  PERMISSIONS.PROJECT_WRITE,
  PERMISSIONS.EVENT_READ,
  PERMISSIONS.EVENT_WRITE,
  PERMISSIONS.DATA_EXPORT
];
const viewerPermissions = [PERMISSIONS.CLIENT_READ, PERMISSIONS.PROJECT_READ, PERMISSIONS.EVENT_READ, PERMISSIONS.DATA_EXPORT];

export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.OWNER]: Object.freeze(ownerPermissions),
  [ROLES.MANAGER]: Object.freeze(managerPermissions),
  [ROLES.MEMBER]: Object.freeze(memberPermissions),
  [ROLES.VIEWER]: Object.freeze(viewerPermissions)
});

export const normalizeRole = (role) => (ROLE_VALUES.includes(role) ? role : ROLES.VIEWER);

export const can = (role, permission) => ROLE_PERMISSIONS[normalizeRole(role)].includes(permission);

export const hasPermission = (userContext, permission) => can(userContext?.membership?.role || userContext?.role, permission);
