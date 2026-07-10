# FlowDesk future API contracts

## Status i odpowiedzialność dokumentu

Ten dokument definiuje planowany kontrakt HTTP przyszłego backendu FlowDesk.
Obecna aplikacja nie wykonuje requestów API i nie implementuje produkcyjnego
auth, storage, tenant isolation ani cloud sync.

- **Accepted current state:** frontend pozostaje lokalnym demo, a bieżący
  synchroniczny kontrakt repozytoriów nie jest zmieniany w tym zadaniu.
- **Proposed contract:** zasady tenant scope, envelope, request correlation,
  idempotency, concurrency, błędy oraz endpointy opisane poniżej.
- **Deferred:** identity provider, credential payload, backend/runtime, database,
  deployment topology, rate limits, wartości retencji i finalny model offline.

Architektura i kolejność migracji są opisane w
[`backend-readiness.md`](backend-readiness.md). Rejestr decyzji właściciela jest w
[`future-saas-readiness.md`](future-saas-readiness.md). Nadrzędny kontrakt
pozostaje Proposed w ADR
[`008-provider-neutral-backend-boundary.md`](adr/008-provider-neutral-backend-boundary.md).

## Zasady ogólne

- API używa HTTPS, JSON oraz jawnej wersji bazowej `/api/v1`.
- Każdy endpoint poza publicznym wejściem do loginu wymaga ważnej serwerowej
  sesji, chyba że kontrakt jawnie stanowi inaczej.
- Zasoby biznesowe są adresowane pod
  `/api/v1/organizations/{organizationId}/...`.
- `organizationId` w ścieżce wybiera kontekst, ale serwer zawsze potwierdza
  aktywne membership ze zweryfikowanej sesji. ID podane przez klienta nigdy nie
  autoryzuje dostępu.
- `organizationId` w body zasobu jest odrzucane jako server-controlled field.
- Serwer egzekwuje RBAC, tenant scope, relationship integrity i validation przed
  odczytem lub mutacją.
- Response model jest kanoniczny; frontend nadal normalizuje odpowiedź przed
  użyciem w UI.
- Endpointy billing, płatności i pricing nie są częścią Priority 4. Istniejące
  pomysły monetization pozostają osobnym, Deferred product scope.

## Nagłówki i transport

| Nagłówek                         | Kierunek         | Proposed behavior                                                        |
| -------------------------------- | ---------------- | ------------------------------------------------------------------------ |
| `Content-Type: application/json` | request/response | wymagany dla JSON body                                                   |
| `X-Request-ID`                   | response         | canonical identyfikator wygenerowany lub znormalizowany przez serwer     |
| `Idempotency-Key`                | request          | wymagany dla retryable create, import i sync push                        |
| `If-Match`                       | request          | wymagany dla update i operacji destrukcyjnych na wersjonowanym rekordzie |
| `ETag`                           | response         | reprezentuje serwerową rewizję pojedynczego zasobu                       |
| CSRF token/header                | request          | wymagany dla mutacji, jeśli sesja używa cookies                          |

Klient może przesłać własny correlation value, ale serwer przechowuje go osobno
i nie musi przyjmować go jako canonical `requestId`.

## Standard odpowiedzi

Sukces pojedynczego zasobu:

```json
{
  "data": {
    "id": "client_123",
    "organizationId": "org_123",
    "revision": 12
  },
  "meta": {
    "requestId": "req_123",
    "revision": 12
  }
}
```

Lista:

```json
{
  "data": [],
  "meta": {
    "requestId": "req_123",
    "page": {
      "nextCursor": "cursor_abc",
      "hasMore": false,
      "limit": 50
    }
  }
}
```

Błąd:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Payload validation failed",
    "issues": [
      {
        "path": "email",
        "code": "invalid_email",
        "message": "Enter a valid email address"
      }
    ]
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

`message` jest bezpieczny dla użytkownika i nie zawiera stack trace, query,
sekretów ani danych innej organizacji. `issues` występuje tylko, gdy można
bezpiecznie wskazać błąd pola.

## Statusy i stabilne kody błędów

| HTTP  | Kod                    | Znaczenie                                                      |
| ----- | ---------------------- | -------------------------------------------------------------- |
| `400` | `malformed_request`    | niepoprawny JSON, nagłówek lub query                           |
| `401` | `unauthenticated`      | brak, wygaśnięcie albo revocation sesji                        |
| `403` | `permission_denied`    | ważna sesja bez wymaganego permission w bieżącej organizacji   |
| `404` | `not_found`            | zasób nie istnieje w dozwolonym tenant scope                   |
| `409` | `idempotency_conflict` | ten sam idempotency key z innym payloadem                      |
| `409` | `conflict_detected`    | konflikt offline/sync z canonical state                        |
| `412` | `revision_mismatch`    | `If-Match` nie odpowiada aktualnej rewizji online              |
| `422` | `validation_failed`    | syntaktycznie poprawny request narusza schema lub domain rules |
| `429` | `rate_limited`         | limit requestów; response może zawierać `Retry-After`          |
| `500` | `internal_error`       | bezpieczna, niejawna awaria serwera                            |
| `503` | `service_unavailable`  | zależność lub usługa tymczasowo niedostępna                    |

Cross-organization lookup zwraca `not_found`, a szczegół odmowy może trafić
wyłącznie do bezpiecznych logów i audytu.

## Pagination, filtering i sorting

Proposed list contract używa cursor pagination:

- `limit` ma domyślnie `50` i proponowany limit maksymalny `100`,
- `cursor` jest opaque i nie powinien być interpretowany przez klienta,
- każdy sort ma stabilny tie-breaker po `id`,
- unsupported filter/sort zwraca `validation_failed`,
- wartości limitów oraz cursor retention wymagają potwierdzenia po wyborze
  storage.

Allowlisty odpowiadają aktualnym workflow:

| Zasób       | Filtry                                                              | Sort                                |
| ----------- | ------------------------------------------------------------------- | ----------------------------------- |
| clients     | `query`, `status`, `segment`, `archived`                            | `name`, `createdAt`, `updatedAt`    |
| projects    | `query`, `status`, `priority`, `clientId`, `archived`               | `dueDate`, `createdAt`, `updatedAt` |
| events      | `dateFrom`, `dateTo`, `clientId`, `projectId`, `type`               | `date`, `createdAt`                 |
| memberships | `status`, `role`                                                    | `createdAt`, `userName`             |
| audit log   | `actorId`, `action`, `resourceType`, `dateFrom`, `dateTo`, `result` | `timestamp`                         |

## Auth i sesja

| Metoda | Endpoint               | Dostęp        | Zachowanie                                                           |
| ------ | ---------------------- | ------------- | -------------------------------------------------------------------- |
| `POST` | `/api/v1/auth/login`   | public        | po zweryfikowaniu identity tworzy server session                     |
| `POST` | `/api/v1/auth/logout`  | authenticated | unieważnia bieżącą sesję; sukces jest idempotentny                   |
| `GET`  | `/api/v1/auth/session` | authenticated | zwraca aktualny user, memberships, active organization i permissions |

Dokładny login request zależy od Deferred identity-provider decision. Nie wolno
utrwalać credentiali lub tokenów sesji w `localStorage`.

Przykładowy session response:

```json
{
  "data": {
    "user": {
      "id": "user_123",
      "name": "Alicja Maj",
      "email": "alicja@flowdesk.pl",
      "status": "active"
    },
    "activeOrganization": {
      "id": "org_123",
      "name": "FlowDesk Workspace",
      "status": "active"
    },
    "membership": {
      "id": "membership_123",
      "userId": "user_123",
      "organizationId": "org_123",
      "role": "Owner",
      "status": "active"
    },
    "permissions": ["client:read", "client:write"]
  },
  "meta": {
    "requestId": "req_123",
    "sessionExpiresAt": "2026-07-10T18:00:00.000Z"
  }
}
```

Lista permissions wspiera UX, ale serwer ponownie autoryzuje każdy request.

## Organizations, users, invitations i memberships

| Metoda   | Endpoint                                                            | Permission                          | Cel                                            |
| -------- | ------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------- |
| `GET`    | `/api/v1/users/me`                                                  | authenticated                       | profil bieżącego użytkownika                   |
| `GET`    | `/api/v1/organizations`                                             | authenticated                       | organizacje dostępne przez aktywne memberships |
| `POST`   | `/api/v1/organizations`                                             | authenticated                       | atomowo tworzy organizację i pierwszego Ownera |
| `GET`    | `/api/v1/organizations/{organizationId}`                            | active member                       | dane workspace                                 |
| `PATCH`  | `/api/v1/organizations/{organizationId}`                            | `organization:admin`                | zmienia dozwolone ustawienia organizacji       |
| `POST`   | `/api/v1/organizations/{organizationId}/deactivate`                 | `organization:admin` + Owner policy | rozpoczyna kontrolowaną deaktywację            |
| `POST`   | `/api/v1/organizations/{organizationId}/ownership-transfers`        | Owner policy                        | atomowy transfer ownership                     |
| `GET`    | `/api/v1/organizations/{organizationId}/memberships`                | `organization:admin`                | lista członków                                 |
| `PATCH`  | `/api/v1/organizations/{organizationId}/memberships/{membershipId}` | `organization:admin`                | rola albo status członkostwa                   |
| `DELETE` | `/api/v1/organizations/{organizationId}/memberships/{membershipId}` | `organization:admin`                | usuwa członkostwo z kontrolą last Owner        |
| `POST`   | `/api/v1/organizations/{organizationId}/invitations`                | `organization:admin`                | tworzy zaproszenie                             |
| `DELETE` | `/api/v1/organizations/{organizationId}/invitations/{invitationId}` | `organization:admin`                | unieważnia zaproszenie                         |
| `POST`   | `/api/v1/membership-invitations/{token}/accept`                     | authenticated                       | jednorazowo akceptuje ważne zaproszenie        |

Organization create request zawiera wyłącznie pola edytowalne, np. `name`,
`timezone` i `locale`. Serwer ustala `id`, status, ownership, timestamps i
membership. Token zaproszenia jest sekretem, nie trafia do logów ani response po
utworzeniu poza kontrolowanym delivery flow.

Trwałe usunięcie organizacji nie ma zaakceptowanego endpointu. Wymaga
zatwierdzonej retencji, export/deletion policy i procedury odzyskania.

## Wspólny resource contract

Create i update payloady nie mogą zawierać `id`, `organizationId`, `createdAt`,
`updatedAt`, `revision`, audit fields ani permissions. Canonical response zasobu
zawiera co najmniej:

```json
{
  "id": "resource_123",
  "organizationId": "org_123",
  "createdAt": "2026-07-10T10:00:00.000Z",
  "updatedAt": "2026-07-10T11:00:00.000Z",
  "revision": 12
}
```

`PATCH` oznacza partial update tylko dla allowlisted fields. Serwer scala input z
kanonicznym rekordem, waliduje pełny wynik i zwiększa `revision`.

## Clients

| Metoda   | Endpoint                                                            | Permission               | Cel                                         |
| -------- | ------------------------------------------------------------------- | ------------------------ | ------------------------------------------- |
| `GET`    | `/api/v1/organizations/{organizationId}/clients`                    | `client:read`            | lista klientów                              |
| `GET`    | `/api/v1/organizations/{organizationId}/clients/{clientId}`         | `client:read`            | szczegóły klienta                           |
| `POST`   | `/api/v1/organizations/{organizationId}/clients`                    | `client:write`           | tworzy klienta; wymaga `Idempotency-Key`    |
| `PATCH`  | `/api/v1/organizations/{organizationId}/clients/{clientId}`         | `client:write`           | aktualizuje klienta; wymaga `If-Match`      |
| `POST`   | `/api/v1/organizations/{organizationId}/clients/{clientId}/archive` | `client:archive`         | archiwizuje; wymaga `If-Match`              |
| `POST`   | `/api/v1/organizations/{organizationId}/clients/{clientId}/restore` | `client:archive`         | przywraca; wymaga `If-Match`                |
| `DELETE` | `/api/v1/organizations/{organizationId}/clients/{clientId}`         | Proposed `client:delete` | hard delete; deny do zatwierdzenia macierzy |

Create request zachowuje aktualne pola workflow:

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

Status pola `owner` jako tekstu albo relacji do `User` wymaga decyzji modelu
danych. Do tego czasu API nie może automatycznie interpretować nazwy jako
autoryzacji lub membership.

## Projects

| Metoda   | Endpoint                                                                     | Permission                | Cel                                         |
| -------- | ---------------------------------------------------------------------------- | ------------------------- | ------------------------------------------- |
| `GET`    | `/api/v1/organizations/{organizationId}/projects`                            | `project:read`            | lista zleceń                                |
| `GET`    | `/api/v1/organizations/{organizationId}/projects/{projectId}`                | `project:read`            | szczegóły zlecenia                          |
| `POST`   | `/api/v1/organizations/{organizationId}/projects`                            | `project:write`           | tworzy zlecenie; wymaga `Idempotency-Key`   |
| `PATCH`  | `/api/v1/organizations/{organizationId}/projects/{projectId}`                | `project:write`           | aktualizuje; wymaga `If-Match`              |
| `POST`   | `/api/v1/organizations/{organizationId}/projects/{projectId}/archive`        | `project:archive`         | archiwizuje; wymaga `If-Match`              |
| `POST`   | `/api/v1/organizations/{organizationId}/projects/{projectId}/restore`        | `project:archive`         | przywraca; wymaga `If-Match`                |
| `POST`   | `/api/v1/organizations/{organizationId}/projects/{projectId}/comments`       | `project:write`           | dodaje komentarz; wymaga `Idempotency-Key`  |
| `PATCH`  | `/api/v1/organizations/{organizationId}/projects/{projectId}/tasks/{taskId}` | `project:write`           | aktualizuje task; wymaga `If-Match`         |
| `DELETE` | `/api/v1/organizations/{organizationId}/projects/{projectId}`                | Proposed `project:delete` | hard delete; deny do zatwierdzenia macierzy |

Create request:

```json
{
  "name": "Wdrożenie panelu klienta",
  "clientId": "client_123",
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

Serwer potwierdza, że `clientId` należy do tej samej organizacji. Comments,
tasks, history i timestamps otrzymują serwerowe identyfikatory i metadata.

## Events

| Metoda   | Endpoint                                                  | Permission              | Cel                                         |
| -------- | --------------------------------------------------------- | ----------------------- | ------------------------------------------- |
| `GET`    | `/api/v1/organizations/{organizationId}/events`           | `event:read`            | lista wydarzeń                              |
| `GET`    | `/api/v1/organizations/{organizationId}/events/{eventId}` | `event:read`            | szczegóły wydarzenia                        |
| `POST`   | `/api/v1/organizations/{organizationId}/events`           | `event:write`           | tworzy wydarzenie; wymaga `Idempotency-Key` |
| `PATCH`  | `/api/v1/organizations/{organizationId}/events/{eventId}` | `event:write`           | aktualizuje; wymaga `If-Match`              |
| `DELETE` | `/api/v1/organizations/{organizationId}/events/{eventId}` | Proposed `event:delete` | usuwa; deny do zatwierdzenia macierzy       |

Create request:

```json
{
  "title": "Weekly status call",
  "date": "2026-07-10T10:00:00.000Z",
  "clientId": "client_123",
  "projectId": "project_123",
  "type": "Meeting"
}
```

`clientId` i `projectId` są opcjonalne zgodnie z bieżącym modelem, ale każdy
niepusty identyfikator musi istnieć w tej samej organizacji. Jeżeli podano oba,
project-client relationship musi być spójne.

## Idempotency i online concurrency

### Idempotency

- Klucz jest scope'owany przez actor, organization, method i route template.
- Powtórzenie tego samego requestu z tym samym payloadem zwraca poprzedni wynik.
- Ten sam klucz z innym payloadem zwraca `idempotency_conflict`.
- Klucz nie zastępuje validation, authorization ani revision check.
- Format, retencja i storage kluczy są Deferred do wyboru backendu.

### Revision

Proposed online mechanism używa `ETag`/`If-Match`:

1. Odczyt zwraca canonical record, `revision` oraz `ETag`.
2. Update/archive/restore/delete wysyła ostatni `ETag` w `If-Match`.
3. Zgodna rewizja powoduje atomową mutację i zwrot nowego `ETag`.
4. Niezgodna rewizja zwraca `412 revision_mismatch` bez nadpisania danych.
5. Frontend odświeża canonical record i pokazuje konflikt zamiast wykonywać
   silent overwrite.

## Import i export

| Metoda | Endpoint                                                  | Permission    | Cel                                  |
| ------ | --------------------------------------------------------- | ------------- | ------------------------------------ |
| `GET`  | `/api/v1/organizations/{organizationId}/export`           | `data:export` | eksport tenant-scoped danych         |
| `POST` | `/api/v1/organizations/{organizationId}/imports/validate` | `data:import` | waliduje import bez zapisu           |
| `POST` | `/api/v1/organizations/{organizationId}/imports`          | `data:import` | atomowo zapisuje zatwierdzony import |

Import commit wymaga `Idempotency-Key`, ponownej server validation, jawnego
tenant assignment i audytu. Request nie może przenieść źródłowego
`organizationId`. Niepoprawny rekord odrzuca cały mały import; model dużych,
asynchronicznych jobów pozostaje Deferred.

Export zawiera wersję formatu, generated timestamp i dane dozwolone polityką.
Nie zawiera session data, sekretów, operational logs ani audit logu, chyba że
użytkownik wykona osobny, uprawniony eksport audytu.

## Offline sync - Deferred contract

Poniższa powierzchnia nie jest częścią pierwszego backendu i może zostać
wdrożona dopiero po zatwierdzeniu potrzeby offline oraz conflict UX.

| Metoda | Endpoint                                                         | Dostęp                   | Cel                               |
| ------ | ---------------------------------------------------------------- | ------------------------ | --------------------------------- |
| `GET`  | `/api/v1/organizations/{organizationId}/sync/snapshot`           | authenticated member     | canonical snapshot i cursor       |
| `GET`  | `/api/v1/organizations/{organizationId}/sync/changes?cursor=...` | authenticated member     | uporządkowane zmiany i tombstones |
| `POST` | `/api/v1/organizations/{organizationId}/sync/push`               | permissions per mutation | batch lokalnych mutacji           |

Mutation contract:

```json
{
  "mutationId": "mutation_123",
  "idempotencyKey": "idem_123",
  "resourceType": "project",
  "operation": "update",
  "resourceId": "project_123",
  "baseRevision": 12,
  "payload": {
    "priority": "High"
  }
}
```

Response zwraca wynik per mutation: `accepted`, `rejected` albo `conflict`,
canonical revision oraz kolejny cursor. Conflict response może zawierać
allowlisted `server`, `client` i `base` values wymagane przez UI, bez danych
spoza tenanta. Tombstone retention, batch size i finalne merge rules są
Deferred.

## Audit log API

Audit log nie jest ordinary application log ani UI activity history.

| Metoda | Endpoint                                                     | Permission                           | Cel                                  |
| ------ | ------------------------------------------------------------ | ------------------------------------ | ------------------------------------ |
| `GET`  | `/api/v1/organizations/{organizationId}/audit-log`           | `organization:admin`                 | paginowana, filtrowana lista eventów |
| `GET`  | `/api/v1/organizations/{organizationId}/audit-log/{auditId}` | `organization:admin`                 | bezpieczne szczegóły eventu          |
| `GET`  | `/api/v1/organizations/{organizationId}/audit-log/export`    | `organization:admin` + `data:export` | eksport zgodny z retencją            |

Minimalny event:

```json
{
  "id": "audit_123",
  "organizationId": "org_123",
  "actor": {
    "type": "user",
    "id": "user_123"
  },
  "action": "project.archive",
  "target": {
    "resourceType": "project",
    "resourceId": "project_123"
  },
  "result": "success",
  "requestId": "req_123",
  "timestamp": "2026-07-10T10:00:00.000Z",
  "changes": {
    "archivedAt": {
      "before": null,
      "after": "2026-07-10T10:00:00.000Z"
    }
  }
}
```

`changes` jest allowlistowane i redagowane. Retencja, actor metadata, IP/session
policy oraz dostęp audytorów są Deferred.

## Mapowanie na frontend

Przyszły adapter zwraca `Promise<RepositoryResult>` i zachowuje bieżący top-level
shape:

- sukces: `{ ok: true, data, state }`, gdzie `state` jest kontrolowanym cache
  snapshotem albo `null`,
- błąd: `{ ok: false, error, issues }`,
- API issue `{ path, code, message }` mapuje top-level `path` na bieżące frontendowe
  `{ field, message }`; pełny kod może pozostać metadata adaptera,
- canonical response zastępuje optimistic input w store,
- `401` czyści session-derived state i uruchamia re-auth flow,
- `403` mapuje na `permission_denied` bez wylogowania,
- `404` mapuje na `not_found`,
- `412` mapuje na `revision_mismatch`,
- `409` mapuje na `conflict_detected` albo `idempotency_conflict`,
- `422` mapuje na `validation_failed`,
- `429` mapuje na `rate_limited`,
- transport failure mapuje na `network_failed`, a `5xx` na
  `service_unavailable`/`internal_error`.

Nowe error codes muszą zostać dodane do frontendowego kontraktu w osobnym
zadaniu implementacyjnym. `storage_failed` pozostaje błędem lokalnego adaptera i
nie powinien ukrywać różnicy między siecią a awarią API.

Anulowanie oczekiwania przez `AbortSignal` nie jest dowodem anulowania
zaakceptowanej mutacji. Frontend może bezpiecznie ponowić mutację tylko z tym
samym `Idempotency-Key`.

## Wersjonowanie i kompatybilność

- Breaking wire-contract change wymaga nowej major path lub jawnej polityki
  kompatybilności.
- Additive fields mogą być wprowadzane w `/api/v1`, jeśli klienci ignorują
  nieznane response fields.
- Usunięcie pola, zmiana znaczenia, permission albo error code wymaga migration
  note i okresu kompatybilności.
- API version, backend schema version, local demo schema v3 i PWA cache version
  są niezależnymi numerami.
- API adapter nie może zostać włączony, dopóki jego contract tests nie
  potwierdzą envelope, tenant isolation, auth, RBAC, validation, idempotency i
  concurrency behavior.
