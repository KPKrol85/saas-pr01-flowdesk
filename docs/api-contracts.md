# FlowDesk future API contracts

## Status dokumentu

To jest kontrakt projektowy dla przyszłego backendu. Obecna aplikacja nie wykonuje requestów do API i nie implementuje realnego uwierzytelniania. Kontrakty mają utrzymać spójny kierunek rozwoju modeli, repozytoriów i testów.

## Zasady ogólne

- API powinno być wersjonowane, np. `/api/v1`.
- Wszystkie odpowiedzi powinny używać JSON.
- Wszystkie mutacje powinny być walidowane po stronie serwera.
- Każdy zasób biznesowy powinien być izolowany przez `organizationId`.
- Backend powinien egzekwować RBAC niezależnie od frontendu.
- Błędy powinny mieć stabilny kształt, który da się mapować na `repositoryFail`.

## Standard odpowiedzi

Sukces:

```json
{
  "data": {},
  "meta": {
    "requestId": "req_123",
    "revision": 12
  }
}
```

Błąd:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Payload validation failed",
    "issues": [{ "field": "email", "message": "Invalid email" }]
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

## Auth i sesja

| Metoda | Endpoint               | Uprawnienie   | Opis                                 |
| ------ | ---------------------- | ------------- | ------------------------------------ |
| `POST` | `/api/v1/auth/login`   | public        | tworzy sesję użytkownika             |
| `POST` | `/api/v1/auth/logout`  | authenticated | kończy sesję                         |
| `GET`  | `/api/v1/auth/session` | authenticated | zwraca aktualny kontekst użytkownika |

Przykładowy kontekst sesji:

```json
{
  "data": {
    "user": {
      "id": "u_123",
      "name": "Alicja Maj",
      "email": "alicja@flowdesk.pl",
      "status": "active"
    },
    "organization": {
      "id": "org_123",
      "name": "FlowDesk Demo Workspace",
      "plan": "team"
    },
    "membership": {
      "id": "mem_123",
      "userId": "u_123",
      "organizationId": "org_123",
      "role": "Owner"
    },
    "permissions": ["client:read", "client:write"]
  }
}
```

## Organizations, users i memberships

| Metoda   | Endpoint                        | Uprawnienie                                  | Opis                            |
| -------- | ------------------------------- | -------------------------------------------- | ------------------------------- |
| `GET`    | `/api/v1/organizations/current` | `organization:admin` lub członek organizacji | dane aktywnej organizacji       |
| `GET`    | `/api/v1/users/me`              | authenticated                                | profil zalogowanego użytkownika |
| `GET`    | `/api/v1/memberships`           | `organization:admin`                         | lista członków organizacji      |
| `POST`   | `/api/v1/memberships`           | `organization:admin`                         | zaproszenie lub dodanie członka |
| `PATCH`  | `/api/v1/memberships/{id}`      | `organization:admin`                         | zmiana roli członka             |
| `DELETE` | `/api/v1/memberships/{id}`      | `organization:admin`                         | usunięcie członkostwa           |

Role wspierane przez frontend:

- `Owner`
- `Manager`
- `Member`
- `Viewer`

## Clients

| Metoda  | Endpoint                       | Uprawnienie      | Opis                 |
| ------- | ------------------------------ | ---------------- | -------------------- |
| `GET`   | `/api/v1/clients`              | `client:read`    | lista klientów       |
| `GET`   | `/api/v1/clients/{id}`         | `client:read`    | szczegóły klienta    |
| `POST`  | `/api/v1/clients`              | `client:write`   | utworzenie klienta   |
| `PATCH` | `/api/v1/clients/{id}`         | `client:write`   | aktualizacja klienta |
| `POST`  | `/api/v1/clients/{id}/archive` | `client:archive` | archiwizacja klienta |
| `POST`  | `/api/v1/clients/{id}/restore` | `client:archive` | przywrócenie klienta |

Minimalny payload:

```json
{
  "name": "Nova Studio",
  "email": "hello@novastudio.pl",
  "phone": "+48 605 010 120",
  "status": "Aktywny",
  "segment": "Agency",
  "owner": "Alicja Maj",
  "tags": ["retainer", "web"],
  "contacts": []
}
```

## Projects

| Metoda  | Endpoint                               | Uprawnienie       | Opis                  |
| ------- | -------------------------------------- | ----------------- | --------------------- |
| `GET`   | `/api/v1/projects`                     | `project:read`    | lista zleceń          |
| `GET`   | `/api/v1/projects/{id}`                | `project:read`    | szczegóły zlecenia    |
| `POST`  | `/api/v1/projects`                     | `project:write`   | utworzenie zlecenia   |
| `PATCH` | `/api/v1/projects/{id}`                | `project:write`   | aktualizacja zlecenia |
| `POST`  | `/api/v1/projects/{id}/archive`        | `project:archive` | archiwizacja zlecenia |
| `POST`  | `/api/v1/projects/{id}/restore`        | `project:archive` | przywrócenie zlecenia |
| `POST`  | `/api/v1/projects/{id}/comments`       | `project:write`   | dodanie komentarza    |
| `PATCH` | `/api/v1/projects/{id}/tasks/{taskId}` | `project:write`   | aktualizacja zadania  |

Minimalny payload:

```json
{
  "name": "Wdrożenie panelu klienta",
  "clientId": "c_123",
  "status": "In progress",
  "priority": "High",
  "dueDate": "2026-07-30T10:00:00.000Z",
  "tasks": [],
  "sla": {
    "serviceLevel": "Priority",
    "responseDueDate": "2026-07-12T10:00:00.000Z"
  }
}
```

## Events

| Metoda   | Endpoint              | Uprawnienie   | Opis                    |
| -------- | --------------------- | ------------- | ----------------------- |
| `GET`    | `/api/v1/events`      | `event:read`  | lista wydarzeń          |
| `GET`    | `/api/v1/events/{id}` | `event:read`  | szczegóły wydarzenia    |
| `POST`   | `/api/v1/events`      | `event:write` | utworzenie wydarzenia   |
| `PATCH`  | `/api/v1/events/{id}` | `event:write` | aktualizacja wydarzenia |
| `DELETE` | `/api/v1/events/{id}` | `event:write` | usunięcie wydarzenia    |

Minimalny payload:

```json
{
  "title": "Weekly status call",
  "date": "2026-07-10T10:00:00.000Z",
  "clientId": "c_123",
  "projectId": "p_123",
  "type": "Meeting"
}
```

## Import, export i sync

| Metoda | Endpoint                                | Uprawnienie   | Opis                        |
| ------ | --------------------------------------- | ------------- | --------------------------- |
| `GET`  | `/api/v1/export`                        | `data:export` | eksport danych organizacji  |
| `POST` | `/api/v1/import`                        | `data:import` | walidowany import danych    |
| `GET`  | `/api/v1/sync/snapshot`                 | authenticated | snapshot danych dla klienta |
| `POST` | `/api/v1/sync/push`                     | authenticated | wysłanie lokalnych zmian    |
| `GET`  | `/api/v1/sync/changes?sinceRevision=12` | authenticated | pobranie zmian od rewizji   |

Metadane sync na zasobie:

```json
{
  "sync": {
    "createdAt": "2026-07-05T10:00:00.000Z",
    "updatedAt": "2026-07-05T11:00:00.000Z",
    "revision": 12,
    "syncStatus": "synced"
  }
}
```

Kody błędów konfliktów:

- `conflict_detected`
- `revision_mismatch`
- `record_archived`
- `permission_denied`

## Mapowanie na frontend

Przyszły adapter API powinien mapować:

- `2xx` na `repositoryOk(data, stateOrSnapshot)`
- `400` na `repositoryFail('validation_failed', issues)`
- `401` na wylogowanie lub odświeżenie sesji
- `403` na `repositoryFail('permission_denied')`
- `404` na `repositoryFail('not_found')`
- `409` na `repositoryFail('conflict_detected')`
- `5xx` na `repositoryFail('storage_failed')` lub osobny kod awarii API

Frontend nie powinien ufać temu, że API zawsze zwróci idealne dane. Odpowiedzi nadal powinny przechodzić przez normalizację domenową.
