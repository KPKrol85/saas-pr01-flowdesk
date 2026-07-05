# FlowDesk architecture

## Status

FlowDesk jest frontend-only SPA demo. Aplikacja nie ma realnego backendu, bazy danych ani produkcyjnego auth. Architektura jest przygotowana tak, aby obecne demo mogło rosnąć bez wiązania widoków bezpośrednio z `localStorage`.

## Entry point

`index.html` ładuje:

- `css/style.css`
- `js/main.js`
- `manifest.webmanifest`

`js/main.js` odpowiada za:

- inicjalizację observability readiness,
- ustawienie motywu,
- start routera,
- renderowanie shell layoutu,
- bindowanie topbara, search, drawera i quick add,
- rejestrację service workera,
- komunikat o braku trwałego storage.

## Routing

Routing znajduje się w `js/core/router.js` i używa hash fragmentu URL:

```text
#/dashboard
#/clients
#/clients/:id
#/projects
#/projects/:id
#/calendar
#/settings
```

Router sprawdza demo session przez `auth.isAuthenticated()`. Niezalogowany użytkownik trafia na `#/login`, a zalogowany użytkownik próbujący wejść na `#/login` trafia na `#/dashboard`.

Hash routing jest świadomie prosty i dobrze pasuje do statycznego hostingu.

## Auth demo

`js/core/auth.js` eksportuje kompatybilną fasadę, a właściwa implementacja demo znajduje się w `js/core/auth.demo.js`.

Sesja demo:

- jest zapisywana pod `flowdesk_session_v1`,
- jest walidowana przez `validateUserSession`,
- zawiera frontendowy kontekst `user`, `organization`, `membership` i `role`,
- nie jest mechanizmem bezpieczeństwa.

Produkcja wymaga backendowego auth, sesji lub tokenów, RBAC po stronie serwera i izolacji danych organizacji.

## Domain layer

Warstwa domenowa znajduje się w `js/domain/`:

- `constants.js` - słowniki statusów, priorytetów, typów i theme,
- `models.js` - fabryki modeli,
- `validators.js` - normalizacja i walidacja danych wejściowych,
- `migrations.js` - migracje i recovery `localStorage`,
- `identity.js` - `User`, `Organization`, `Membership`,
- `rbac.js` - role, permissions i helpery,
- `syncMetadata.js` - hooki przyszłej synchronizacji offline.

Każdy zapis do stanu powinien przejść przez akcje domenowe i walidację, a dane z `localStorage` są traktowane jako niezaufane.

## State flow

Aktualny przepływ:

```text
views
  -> store facade
  -> actions/selectors
  -> persistence
  -> repositories
  -> localStorage adapter
  -> migrations/domain validation
```

Docelowy przepływ z backendem:

```text
views
  -> store facade
  -> actions/selectors
  -> repositories
  -> API adapter
  -> backend validation/auth/RBAC/storage
```

Widoki nie powinny importować `localStorage`, adapterów storage ani bezpośrednio mutować kolekcji.

## Store, actions and selectors

`js/core/store.js` przechowuje aktualny stan aplikacji i udostępnia kompatybilną fasadę dla widoków.

`js/core/actions.js` zawiera operacje mutujące:

- klienci,
- zlecenia,
- wydarzenia,
- preferencje UI,
- import/export/reset.

Akcje zwracają przewidywalny kształt `{ ok, data, error, issues }`.

`js/core/selectors.js` zawiera czyste selektory dla widoków, dashboardu, relacji, filtrów i global search.

## Repositories

`js/repositories/` zamyka dostęp do kolekcji:

- `clientsRepository`,
- `projectsRepository`,
- `eventsRepository`,
- `localStorageRepositoryAdapter`,
- `collectionRepository`,
- `repositoryResults`.

Aktywną implementacją jest `localStorage`, ale granica repozytoriów przygotowuje migrację do API bez przepisywania widoków.

## UI component system

`js/components/` zawiera mały system UI:

- button,
- form controls,
- modal,
- drawer,
- confirm dialog,
- table,
- empty state,
- page header,
- toast,
- icon.

Komponenty powinny być rozwijane przed kopiowaniem nowych bloków HTML w widokach. Design tokens są opisane w `docs/design-system.md`.

## Safe rendering and CSP

Dynamiczny tekst użytkownika powinien przechodzić przez:

- `escapeHTML`,
- `escapeAttribute`,
- `safeText`,
- albo bezpieczne DOM API z `textContent`.

`index.html` zawiera statyczną meta CSP dla demo. Produkcyjny hosting powinien przenieść CSP do nagłówków HTTP.

## PWA and cache

PWA składa się z:

- `manifest.webmanifest`,
- `service-worker.js`,
- generowanego `service-worker-assets.js`,
- `offline.html`.

Manifest app-shell generuje `npm run pwa:manifest`. Service worker używa:

- navigation network-first,
- app-shell/static cache-first,
- guarded `/api/*` network-only fallback,
- kontrolowanego update promptu.

Szczegóły są w `docs/pwa-strategy.md`.

## Observability readiness

`js/core/observability.js` zapewnia lokalny kontrakt pod przyszły monitoring:

- `initObservability`,
- `captureError`,
- `captureMessage`,
- sanitizacja kontekstu,
- in-memory buffer,
- brak requestów sieciowych.

Moduł nie zbiera danych osobowych i nie zastępuje produkcyjnego monitoringu backendowego.

## Tests and quality gates

Główna bramka:

```bash
npm run check
```

Obejmuje:

- `pwa:check`,
- ESLint,
- Stylelint,
- Prettier check,
- unit tests,
- integration tests,
- Playwright e2e,
- Playwright axe a11y,
- build,
- performance budget.

CI jest skonfigurowane w `.github/workflows/flowdesk-quality.yml`.

## Deployment boundaries

FlowDesk jest statyczną aplikacją i może działać na Netlify, Cloudflare Pages, GitHub Pages albo dowolnym hostingu statycznym.

Przed produkcją wymagane są:

- realne auth,
- backend storage,
- server-side validation,
- server-side RBAC,
- monitoring,
- produkcyjne nagłówki security,
- docelowe wartości SEO/Open Graph,
- release i rollback process.
