# FlowDesk

FlowDesk to demonstracyjna aplikacja SPA typu Service Management Dashboard dla małych firm usługowych i zespołów obsługujących klientów, zlecenia, wizyty oraz działania operacyjne. Projekt pokazuje, jak może wyglądać lekki panel SaaS do prowadzenia pracy od klienta, przez zlecenie, po terminy, priorytety i podstawowe KPI.

Demo jest skierowane do portfolio review: w pierwszej minucie ma pokazać spójny produktowy scenariusz dla zespołu usługowego, a jednocześnie jasno oddzielić warstwę demonstracyjną od produkcyjnego systemu. Aplikacja obejmuje przykładowe dane klientów, zleceń, wydarzeń, dashboard operacyjny, globalne wyszukiwanie, bezpieczne akcje demo, eksport/import JSON, reset danych oraz preferencje użytkownika.

Aktualna wersja działa w całości po stronie przeglądarki. Nie ma backendu, prawdziwego uwierzytelniania, zewnętrznej bazy danych, live API, billing ani synchronizacji w chmurze. Stan aplikacji jest zapisywany lokalnie w `localStorage`, a dane startowe pochodzą z `js/data/seed.js`. Projekt jest dobrym początkiem pod rozwój produktu, ale przed użyciem produkcyjnym wymaga backendowego auth, trwałej persystencji, walidacji serwerowej, security headers, monitoringu i docelowej architektury API.

## Narracja demo

- **Docelowy użytkownik:** właściciel, manager operacyjny albo mały zespół serwisowy, który musi widzieć klientów, aktywne zlecenia, terminy, priorytety i kolejne działania w jednym miejscu.
- **Główny problem:** rozproszone informacje o klientach, zleceniach, wydarzeniach i statusach utrudniają codzienną obsługę usług.
- **Obietnica demo:** FlowDesk pokazuje, jak frontendowy panel SaaS może uporządkować prosty proces service management bez ciężkiego systemu enterprise.
- **Główne powierzchnie:** dashboard, klienci, szczegóły klienta, zlecenia, szczegóły zlecenia, kalendarz, ustawienia, topbar search, sidebar, modal, drawer i toast.
- **Granice demo:** dane są lokalne, auth jest demonstracyjne, RBAC i sync metadata są kontraktami gotowościowymi, a produkcja wymaga backendu, bazy danych i kontroli bezpieczeństwa po stronie serwera.

## Najważniejsze funkcje

- Logowanie demonstracyjne z walidacją emaila i hasła.
- Guard routingu blokujący widoki aplikacji bez aktywnej sesji demo.
- Dashboard z KPI, aktywnymi zleceniami, wydarzeniami i działaniami wymagającymi uwagi.
- Widok klientów z filtrowaniem, sortowaniem, segmentami, ownerami, tagami, kontaktami, archiwizacją i panelem szczegółów.
- Osobne trasy szczegółów klientów i zleceń z historią aktywności, relacjami i metadanymi operacyjnymi.
- Widok zleceń w formie prostego kanbana z filtrami statusu, priorytetu i archiwum.
- Checklisty zleceń, SLA, estymacje, komentarze i historia zmian.
- Globalne wyszukiwanie w topbarze po klientach, zleceniach i wydarzeniach.
- Widok kalendarza z wydarzeniami powiązanymi z klientami i zleceniami.
- Ustawienia użytkownika: motyw jasny/ciemny, ograniczenie animacji, eksport JSON, walidowany import JSON i reset danych demo.
- Warstwa repozytoriów dla klientów, zleceń i wydarzeń z aktywnym adapterem `localStorage`.
- Demo context użytkownika, organizacji, członkostwa, roli i uprawnień jako przygotowanie pod multi-user.
- PWA: manifest, generowany app-shell cache, widok offline i kontrolowany update prompt.
- Observability readiness: lokalne przechwytywanie błędów i kontrakt pod przyszły monitoring.
- Podstawy dostępności: skip link, focus-visible, modal z `aria-modal`, obsługa ESC, preferencja reduced motion.

## Stack technologiczny

- HTML5 jako entrypoint aplikacji.
- CSS z podziałem na tokeny, bazę, layout, komponenty i widoki.
- JavaScript ES Modules bez frameworka frontendowego.
- Hash routing oparty o `window.location.hash`.
- `localStorage` jako aktywny adapter repozytoriów dla danych demo.
- Service Worker i Web App Manifest dla trybu PWA.
- Generowany manifest assetów service workera i statyczny performance budget.
- Lekki moduł observability bez zewnętrznego providera.
- PostCSS + cssnano do budowy CSS.
- Terser do minifikacji JS.
- `serve` do lokalnego uruchamiania projektu.
- Vitest i Playwright dla testów jednostkowych, integracyjnych, e2e i dostępności.

## Struktura projektu

```text
flowdesk/
  assets/
    fonts/                 # lokalne fonty Inter
    icons/                 # ikony PWA
  css/
    base.css               # reset, fonty, focus, globalne reguły
    components.css         # przyciski, pola, karty, badge, modal, drawer, toast
    layout.css             # shell aplikacji, topbar, sidebar, kontenery
    style.css              # główny plik importujący CSS
    style.min.css          # zbudowany/minifikowany CSS
    tokens.css             # design tokens, kolory, spacing, font sizes, z-index
    views.css              # style widoków biznesowych
  docs/
    api-contracts.md       # projekt przyszłych kontraktów API
    architecture.md        # architektura aplikacji i przepływ danych
    adr/                   # Architecture Decision Records
    backend-readiness.md   # backend, RBAC, multi-user i strategia offline
    definition-of-done.md  # kryteria gotowości zmian
    design-system.md       # dokumentacja komponentów i tokenów UI
    observability.md       # kontrakt monitoringu frontendowego
    performance-budget.md  # budżety JS/CSS/app-shell i progi Lighthouse
    pwa-strategy.md        # cache strategies, offline i update lifecycle
    release-checklist.md   # release, deployment i rollback
    versioning.md          # konwencja wersjonowania
  js/
    components/            # sidebar, topbar, modal, drawer, table, toast, form controls
    core/                  # auth, router, store, helpery DOM
    data/                  # dane startowe demo
    domain/                # modele, słowniki, walidacja, migracje, identity, RBAC, sync metadata
    repositories/          # repozytoria i aktywny adapter localStorage
    utils/                 # formatowanie, storage, walidatory
    views/                 # widoki aplikacji
    main.js                # bootstrap aplikacji, shell, rejestracja service workera
  tests/
    a11y/                  # Playwright + axe checks
    e2e/                   # krytyczne ścieżki użytkownika
    integration/           # testy DOM i przepływów modułowych
    unit/                  # testy domeny, store'a, akcji, repozytoriów i komponentów
  scripts/
    check-performance-budget.js          # szybki lokalny gate rozmiarów app-shell
    generate-service-worker-manifest.js  # generator service-worker-assets.js
  404.html
  _redirects               # konfiguracja redirectów pod hosting statyczny, np. Netlify
  CHANGELOG.md
  index.html
  manifest.webmanifest
  offline.html
  package.json
  postcss.config.js
  robots.txt
  service-worker-assets.js # wygenerowany manifest app-shell dla service workera
  service-worker.js
  sitemap.xml
```

## Architektura aplikacji

Aplikacja jest zorganizowana jako statyczna SPA z modułami ES. `index.html` ładuje `css/style.css` i `js/main.js`. Bootstrap w `main.js` odpowiada za ustawienie motywu, wyrenderowanie shell layoutu, obsługę topbara, sidebaru, drawera, szybkiego dodawania, wylogowania oraz rejestrację service workera.

Routing znajduje się w `js/core/router.js`. Aktualna ścieżka jest odczytywana z hash fragmentu URL, np. `#/dashboard`. Router sprawdza sesję demo z `js/core/auth.js`; jeśli użytkownik nie jest zalogowany, przekierowuje na `#/login`.

Stan aplikacji znajduje się w `js/core/store.js`. Store przechowuje kolekcje `clients`, `projects`, `events` oraz `ui`, uruchamia jawne akcje domenowe i zapisuje wynik przez `js/core/persistence.js`. Persistence korzysta z aktywnego adaptera `localStorage` z `js/repositories/localStorageRepositoryAdapter.js`, dlatego obecny zapis nadal trafia pod klucz `flowdesk_state_v1`, ale szczegóły storage są zamknięte za granicą repozytoriów.

Repozytoria w `js/repositories/` udostępniają operacje kolekcji dla klientów, zleceń i wydarzeń. To jest granica migracji pod przyszłe API: widoki nie powinny znać szczegółów `localStorage`, a przyszły adapter backendowy powinien zachować ten sam kształt wyników operacji.

Sesja demo jest zapisywana oddzielnie pod kluczem `flowdesk_session_v1`. `js/domain/identity.js` definiuje frontendowe modele `User`, `Organization` i `Membership`, a `js/domain/rbac.js` definiuje role `Owner`, `Manager`, `Member`, `Viewer` oraz helpery uprawnień. To przygotowanie pod multi-user, nie realny mechanizm bezpieczeństwa.

Widoki w `js/views/` renderują HTML bezpośrednio do kontenera i samodzielnie podpinają event listenery. Ten model jest wystarczający dla obecnego rozmiaru projektu, ale przy rozbudowie warto wydzielić wspólne komponenty formularzy, bezpieczne renderowanie danych użytkownika, selektory store'a oraz warstwę domenową.

## Dostępne trasy

| Trasa | Widok | Opis |
| --- | --- | --- |
| `#/login` | `loginView.js` | Logowanie demo i walidacja formularza. |
| `#/dashboard` | `dashboardView.js` | KPI, najbliższe działania i ostatnie zlecenia. |
| `#/clients` | `clientsView.js` | Lista klientów, filtrowanie, sortowanie, CRUD i szczegóły. |
| `#/clients/:id` | `clientDetailView.js` | Szczegóły klienta, kontakty, tagi, powiązane zlecenia i aktywność. |
| `#/projects` | `projectsView.js` | Kanban zleceń, filtrowanie, CRUD. |
| `#/projects/:id` | `projectDetailView.js` | Szczegóły zlecenia, SLA, checklisty, komentarze i historia. |
| `#/calendar` | `calendarView.js` | Lista wydarzeń powiązanych z klientami i zleceniami. |
| `#/settings` | `settingsView.js` | Preferencje, eksport danych, reset danych demo. |

## Model danych demo

### Client

```js
{
  id: 'c1',
  name: 'Nova Studio',
  email: 'hello@novastudio.pl',
  phone: '+48 605 010 120',
  status: 'Aktywny',
  notes: 'Stały klient od 2022. Preferuje kontakt mailowy.',
  contacts: [{ id: 'ct1', name: 'Marta Nowak', role: 'Operations Lead', email: 'marta@novastudio.pl' }],
  tags: ['retainer', 'web'],
  segment: 'Agency',
  owner: 'Alicja Maj',
  activity: [{ id: 'a1', text: 'Uzgodniono zakres wdrożenia.', date: 'ISO date' }],
  archivedAt: ''
}
```

### Project

```js
{
  id: 'p1',
  name: 'Wdrożenie panelu klienta',
  clientId: 'c1',
  status: 'In progress',
  priority: 'High',
  dueDate: 'ISO date',
  notes: 'Oczekuje na feedback do makiet.',
  tasks: [{ id: 't1', title: 'Dostarczyć makiety dashboardu', done: true }],
  sla: { serviceLevel: 'Priority', responseDueDate: 'ISO date' },
  estimate: { hours: 42, value: 16800, currency: 'PLN' },
  comments: [{ id: 'cm1', author: 'Alicja Maj', body: 'Komentarz operacyjny', date: 'ISO date' }],
  history: [{ id: 'h1', text: 'Status zmieniony na In progress.', date: 'ISO date' }],
  completedAt: '',
  archivedAt: ''
}
```

### Event

```js
{
  id: 'e1',
  title: 'Weekly status call',
  date: 'ISO date',
  clientId: 'c1',
  projectId: 'p1',
  type: 'Meeting'
}
```

### UI preferences

```js
{
  theme: 'light',
  reducedMotion: false
}
```

### User, Organization, Membership

```js
{
  user: { id: 'u-demo-owner', name: 'Alicja Maj', email: 'alicja@flowdesk.pl', status: 'active' },
  organization: { id: 'org-flowdesk-demo', name: 'FlowDesk Demo Workspace', plan: 'demo' },
  membership: { id: 'mem-demo-owner', userId: 'u-demo-owner', organizationId: 'org-flowdesk-demo', role: 'Owner' }
}
```

### Sync metadata hook

```js
{
  sync: {
    createdAt: 'ISO date',
    updatedAt: 'ISO date',
    revision: 1,
    syncStatus: 'pending'
  }
}
```

Metadane synchronizacji są obecnie lekkim hookiem dla przyszłych adapterów API. Nie zostały globalnie dodane do wszystkich rekordów demo.

## Uruchomienie lokalne

Wymagania:

- Node.js LTS.
- npm.

Instalacja zależności:

```bash
npm install
```

Uruchomienie lokalnego serwera:

```bash
npm run dev
```

Projekt należy uruchamiać przez lokalny serwer HTTP. Otwieranie `index.html` bezpośrednio przez `file://` nie jest zalecane, ponieważ aplikacja korzysta ze ścieżek absolutnych, modułów ES i service workera.

## Komendy npm

| Komenda | Opis |
| --- | --- |
| `npm run dev` | Uruchamia statyczny serwer przez `serve`. |
| `npm run pwa:manifest` | Generuje `service-worker-assets.js` na podstawie runtime app-shell. |
| `npm run pwa:check` | Sprawdza, czy wygenerowany manifest service workera jest aktualny. |
| `npm run perf:budget` | Sprawdza gzipowane budżety JS, CSS, app-shell i pojedynczych assetów. |
| `npm run lighthouse` | Uruchamia lokalny szybki gate budżetu wydajności; pełna konfiguracja Lighthouse CI jest w `lighthouserc.cjs`. |
| `npm run lint` | Uruchamia ESLint, Stylelint i Prettier check. |
| `npm run format` | Formatuje pliki przez Prettier. |
| `npm run test:unit` | Uruchamia testy jednostkowe Vitest. |
| `npm run test:integration` | Uruchamia testy integracyjne Vitest. |
| `npm run test:e2e` | Uruchamia testy end-to-end Playwright. |
| `npm run test:a11y` | Uruchamia testy dostępności Playwright + axe. |
| `npm run build:css` | Buduje `css/style.min.css` przez PostCSS i cssnano. |
| `npm run build:js` | Minifikuje `js/main.js` przez Terser. Obecnie nie bundluje całego drzewa modułów. |
| `npm run build` | Generuje manifest PWA, buduje CSS i entrypoint JS. |
| `npm run check` | Uruchamia pełny lokalny zestaw jakości: PWA check, lint, testy, e2e, a11y, build i performance budget. |
| `npm run images` | Kompresuje obrazy z `assets/images/*` do WebP, jeśli taki katalog istnieje. |

## Mapa dokumentacji

| Dokument | Zakres |
| --- | --- |
| `docs/architecture.md` | moduły, routing, store, repozytoria, PWA, observability i granice deploymentu |
| `docs/adr/` | decyzje architektoniczne i ich konsekwencje |
| `docs/design-system.md` | komponenty UI, tokeny i konwencje interfejsu |
| `docs/backend-readiness.md` | przyszły backend, RBAC, multi-user i offline sync |
| `docs/api-contracts.md` | projekt przyszłych endpointów i mapowanie błędów API |
| `docs/pwa-strategy.md` | service worker, app-shell cache, offline i update lifecycle |
| `docs/performance-budget.md` | budżety rozmiaru, Lighthouse i startup responsiveness |
| `docs/observability.md` | lokalny kontrakt monitoringu i zasady danych |
| `docs/definition-of-done.md` | kryteria gotowości zmiany |
| `docs/release-checklist.md` | release, deployment, post-release validation i rollback |
| `docs/versioning.md` | konwencja wersjonowania demo milestone |
| `CHANGELOG.md` | historia zmian i milestone |

## Backend readiness i multi-user

FlowDesk ma teraz przygotowaną granicę migracji pod backend:

- `localStorage` jest aktywnym adapterem demo, ale nie stałym fundamentem domeny,
- `clientsRepository`, `projectsRepository` i `eventsRepository` zamykają operacje kolekcji za spójnym kontraktem,
- `createFlowDeskRepositories` pozwala w przyszłości podmienić adapter lokalny na adapter API,
- store nadal pozostaje kompatybilną fasadą dla widoków i zapisuje dane przez persistence,
- identity context zawiera demo użytkownika, organizację, membership i rolę,
- RBAC definiuje role `Owner`, `Manager`, `Member`, `Viewer` oraz stabilne nazwy uprawnień,
- `syncMetadata` definiuje statusy `synced`, `pending`, `conflict`, rewizję i znaczniki czasu dla przyszłej synchronizacji.

Szczegóły:

- `docs/backend-readiness.md` - architektura repozytoriów, RBAC, ograniczenia bezpieczeństwa i strategia offline,
- `docs/api-contracts.md` - projekt przyszłych endpointów, payloadów, błędów i mapowania na repozytoria.

## Uwierzytelnianie demo

Logowanie jest jawnie demonstracyjne i znajduje się w `js/core/auth.demo.js`. Plik `js/core/auth.js` jest tylko kompatybilną fasadą dla obecnego importu `auth`.

Aplikacja nie sprawdza użytkownika po stronie serwera. Wymaga jedynie poprawnego formatu emaila i hasła o długości minimum 6 znaków. Po zalogowaniu zapisuje przykładową sesję w `localStorage`, rozszerzoną o demo `user`, `organization`, `membership` i `role`.

To rozwiązanie nadaje się wyłącznie do prototypu. W wersji produkcyjnej konieczne będą prawdziwe uwierzytelnianie, sesje lub tokeny, autoryzacja RBAC po stronie backendu, ochrona danych oraz trwała baza danych.

## Bezpieczeństwo i granice demo

FlowDesk jest aplikacją frontend-only. `localStorage` nie jest bezpiecznym miejscem na dane poufne, tokeny ani sekrety. Obecny store traktuje dane z `localStorage` oraz importowany JSON jako niezaufane: stan przechodzi przez migrację, walidację domenową i reguły spójności przed zapisem oraz odczytem.

Dane renderowane z formularzy, seedów i odzyskanego `localStorage` są escapowane helperami `escapeHTML`, `escapeAttribute` i `safeText`. Toasty renderują tekst przez `textContent`, a payloady HTML są wyświetlane jako tekst, nie jako wykonywalny DOM.

`index.html` zawiera konserwatywną meta Content Security Policy dla hostingu statycznego: lokalne moduły JS, lokalny CSS, fonty, manifest, service worker i obrazy z tego samego originu. Produkcyjny hosting powinien przenieść CSP do nagłówków HTTP i rozszerzyć ją o docelowe domeny API, monitoring oraz politykę raportowania.

Eksport JSON jest generowany jako `Blob` z aplikacyjnego stanu. Import JSON jest dostępny w ustawieniach jako narzędzie demo i przechodzi przez `restoreStateFromJson`, migracje oraz normalizację domenową. Niepoprawny JSON jest odrzucany bez nadpisania obecnego stanu.

Wersja produkcyjna wymaga backendowego uwierzytelniania, autoryzacji, bezpiecznej persystencji, walidacji po stronie serwera, nagłówków bezpieczeństwa na hostingu, ochrony przed CSRF tam, gdzie pojawią się cookies, oraz kontroli uprawnień dla danych organizacji.

## PWA i offline

`service-worker.js` korzysta z wygenerowanego `service-worker-assets.js`, który zawiera runtime app-shell: HTML, manifest, źródłowe CSS, moduły JS, fonty i ikony PWA. Lista jest generowana przez `npm run pwa:manifest` i sprawdzana przez `npm run pwa:check`.

Dla żądań nawigacyjnych service worker używa strategii network-first z fallbackiem do cached `index.html`, a potem `offline.html`. App-shell, moduły JS, CSS, fonty i ikony używają cache-first. Przyszłe requesty `/api/*` mają guarded network-only fallback `503`, żeby nie cache'ować danych biznesowych przypadkowo.

Aktualizacja service workera jest kontrolowana przez użytkownika. Nowy worker czeka w stanie waiting, aplikacja pokazuje toast „Nowa wersja FlowDesk jest dostępna”, a dopiero kliknięcie „Odśwież” wysyła `SKIP_WAITING` i przeładowuje aplikację po `controllerchange`.

Jeżeli `localStorage` jest niedostępny, aplikacja nie crashuje i pokazuje komunikat, że dane demo nie będą trwale zapisane. To nie jest produkcyjny fallback persystencji.

Szczegóły strategii są w `docs/pwa-strategy.md`, a budżety w `docs/performance-budget.md`.

## Observability readiness

`js/core/observability.js` inicjalizuje lokalny kontrakt pod przyszły monitoring błędów. Obecnie przechwytuje `window.error` i `window.unhandledrejection`, sanitizuje kontekst, przechowuje krótki bufor w pamięci i nie wysyła żadnych requestów sieciowych.

Moduł nie zbiera danych osobowych i nie zastępuje produkcyjnego monitoringu backendu. Szczegóły są w `docs/observability.md`.

## Dostępność

Projekt ma dobre podstawy dostępności, ale wymaga pełnego audytu przed uznaniem go za gotowy produkt. Obecnie istnieją:

- skip link do głównej treści,
- style focus-visible,
- obsługa `prefers-reduced-motion`,
- modal z `role="dialog"` i `aria-modal="true"`,
- obsługa ESC w modalu,
- etykiety pól formularzy,
- podstawowe komunikaty błędów walidacji.

Do dopracowania pozostają m.in. pełny focus management po złożonych przepływach modal/drawer, szersza obsługa klawiatury w menu użytkownika i cykliczny audyt manualny na realnych urządzeniach.

## Obecne ograniczenia

- Brak statycznego typowania, więc kontrakty domenowe są utrzymywane przez modele, walidatory, JSDoc i testy.
- Brak bundlera; `build:js` minifikuje tylko entrypoint i nie buduje kompletnej paczki aplikacji.
- Dane użytkownika są escapowane po stronie frontendu, ale przed produkcją nadal potrzebna jest walidacja serwerowa i hosting-level security headers.
- Auth jest tylko demonstracyjny i nie stanowi mechanizmu bezpieczeństwa.
- `localStorage` działa przez adapter repozytoriów, ale nie jest bezpieczną persystencją dla danych produkcyjnych.
- Przy niedostępnym `localStorage` aplikacja startuje, ale dane demo nie są trwale zapisywane.
- RBAC jest obecnie testowanym kontraktem frontendowym i nie zastępuje backendowej autoryzacji.
- Sync metadata jest hookiem gotowościowym; aplikacja nie ma jeszcze realnej kolejki offline ani rozwiązywania konfliktów.
- Pełny Lighthouse CI jest skonfigurowany w `lighthouserc.cjs`, ale nie jest dodany jako stała zależność npm.
- Observability jest lokalnym kontraktem readiness; nie ma jeszcze produkcyjnego providera monitoringu.
- Część logiki formularzy i renderowania powtarza się w widokach.

## Kierunek rozwoju

Rekomendowany kierunek to najpierw ustabilizować fundamenty jakości i architektury, a dopiero potem rozbudowywać domenę produktową. Szczegółowa analiza i 10 priorytetów implementacyjnych znajdują się w `implementation-plan.md`. Roadmapa rozwoju projektu znajduje się w `plan.md`.

Najważniejsze pierwsze kroki:

1. Utrzymać istniejące quality gates: lint, format, unit, integration, e2e, a11y i build.
2. Utrzymać PWA manifest, update flow, offline smoke tests i performance budgets przy każdej zmianie runtime.
3. Utrzymywać dokumentację architektury, ADR-y, changelog, release checklistę i observability przy zmianach.
4. Dopiero po stabilizacji procesów zdecydować o bundlerze, TypeScript albo frameworku.
5. Przy przyszłym backendzie zaimplementować prawdziwe auth, serwerowy RBAC, walidację, storage, audyt i sync API zgodnie z `docs/api-contracts.md`.

## Deployment

Projekt jest przygotowany jako statyczna aplikacja, więc może być hostowany np. na Netlify, Cloudflare Pages, GitHub Pages lub dowolnym serwerze statycznym. Plik `_redirects` sugeruje kompatybilność z Netlify.

Przed publikacją trzeba zmienić wartości produkcyjne w `index.html`, `sitemap.xml`, `robots.txt` i metadanych Open Graph, szczególnie `canonical`, `og:url` oraz `og:image`.

Release i rollback należy prowadzić według `docs/release-checklist.md`. Przy nazwanych milestone trzeba zaktualizować `CHANGELOG.md` i wersję zgodnie z `docs/versioning.md`.

## Status projektu

FlowDesk jest aktualnie jakościowym prototypem startowym. Ma czytelną strukturę, realne przepływy CRUD, PWA i sensowny fundament UI. Nie jest jeszcze produktem gotowym na dane użytkowników ani pracę zespołową. Największa wartość kolejnych etapów będzie wynikała z profesjonalizacji procesu, testów, bezpieczeństwa, architektury danych i stopniowej rozbudowy funkcji domenowych.
