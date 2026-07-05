import { describe, expect, it } from 'vitest';
import { CLIENT_SEGMENTS, CLIENT_STATUSES, CURRENT_SCHEMA_VERSION, EVENT_TYPES, PROJECT_PRIORITIES, PROJECT_SERVICE_LEVELS, PROJECT_STATUSES } from '../../js/domain/constants.js';
import { validateClient, validateEvent, validateProject, validateUserSession } from '../../js/domain/validators.js';

describe('domain validators', () => {
  it('exposes centralized dictionaries for domain values', () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(3);
    expect(CLIENT_STATUSES).toEqual(['Aktywny', 'Potencjalny', 'Zawieszony']);
    expect(CLIENT_SEGMENTS).toEqual(['SMB', 'Healthcare', 'Agency', 'Enterprise', 'Lead']);
    expect(PROJECT_STATUSES).toEqual(['Draft', 'In progress', 'Review', 'Done']);
    expect(PROJECT_PRIORITIES).toEqual(['Low', 'Medium', 'High']);
    expect(PROJECT_SERVICE_LEVELS).toEqual(['Standard', 'Priority', 'Critical']);
    expect(EVENT_TYPES).toEqual(['General', 'Meeting', 'Deadline']);
  });

  it('normalizes and validates client records', () => {
    const result = validateClient({
      id: 'c-test',
      name: '  Nova Studio  ',
      email: ' HELLO@NOVASTUDIO.PL ',
      status: 'Unknown'
    });

    expect(result.valid).toBe(true);
    expect(result.value).toMatchObject({
      id: 'c-test',
      name: 'Nova Studio',
      email: 'hello@novastudio.pl',
      status: 'Aktywny',
      segment: 'SMB',
      archivedAt: ''
    });
    expect(result.value.contacts[0]).toMatchObject({ email: 'hello@novastudio.pl' });
  });

  it('rejects invalid client email input', () => {
    const result = validateClient({ id: 'c-test', name: 'Client', email: 'broken' });

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({ field: 'email', message: 'Podaj poprawny adres email.' });
  });

  it('normalizes project dictionaries and rejects invalid dates in strict mode', () => {
    const result = validateProject({
      id: 'p-test',
      name: '  Service setup  ',
      clientId: 'c1',
      status: 'Unknown',
      priority: 'Unknown',
      dueDate: 'bad-date'
    });

    expect(result.valid).toBe(false);
    expect(result.value).toMatchObject({
      name: 'Service setup',
      status: 'Draft',
      priority: 'Medium',
      dueDate: '',
      sla: { serviceLevel: 'Standard', responseDueDate: '' },
      estimate: { hours: 0, value: 0, currency: 'PLN' }
    });
    expect(result.errors).toContainEqual({ field: 'dueDate', message: 'Nieprawidłowa data.' });
  });

  it('validates project references when allowed ids are provided', () => {
    const result = validateProject({ id: 'p-test', name: 'Job', clientId: 'missing' }, { clientIds: ['c1'] });

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({ field: 'clientId', message: 'Nieprawidłowy klient.' });
  });

  it('normalizes events with default type and validates required dates', () => {
    const result = validateEvent({
      id: 'e-test',
      title: '  Review call  ',
      date: '',
      type: 'Unknown'
    });

    expect(result.valid).toBe(false);
    expect(result.value).toMatchObject({ title: 'Review call', type: 'General' });
    expect(result.errors).toContainEqual({ field: 'date', message: 'Wymagane pole.' });
  });

  it('normalizes valid demo sessions and rejects invalid session email', () => {
    const valid = validateUserSession({ email: ' DEMO@FLOWDESK.PL ' });
    const invalid = validateUserSession({ email: 'broken' });

    expect(valid.valid).toBe(true);
    expect(valid.value.email).toBe('demo@flowdesk.pl');
    expect(invalid.valid).toBe(false);
  });
});
