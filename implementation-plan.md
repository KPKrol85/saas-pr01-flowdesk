# FlowDesk - analiza projektu i plan implementacji

## Cel dokumentu

Ten dokument opisuje aktualny stan projektu FlowDesk oraz 10 najważniejszych obszarów, które warto i trzeba zaimplementować, aby projekt można było rozwijać profesjonalnie, bez narastającego długu technicznego i bez blokowania przyszłej migracji do wersji produkcyjnej.

## Aktualny stan projektu

FlowDesk jest statyczną aplikacją SPA napisaną w HTML, CSS i JavaScript ES Modules. Projekt nie używa frameworka frontendowego ani bundlera. Aplikacja ma hash-router, prosty shell z sidebarem i topbarem, kilka widoków biznesowych, komponenty UI oraz lokalny store zapisujący stan w `localStorage`.

Obecny zakres funkcjonalny obejmuje:

- logowanie demonstracyjne,
- dashboard KPI,
- CRUD klientów,
- CRUD zleceń,
- wydarzenia kalendarzowe,
- ustawienia UI,
- eksport i reset danych,
- PWA z manifestem, service workerem i fallbackiem offline.

## Mocne strony obecnego startu

- Czytelny podział folderów: `core`, `components`, `views`, `utils`, `data`.
- Prosty i zrozumiały przepływ aplikacji bez nadmiarowej abstrakcji.
- Realistyczny, choć lokalny, model danych demo.
- Podstawowe CRUD-y, filtry, sortowanie i widoki operacyjne.
- Design tokens, motyw jasny/ciemny i lokalne fonty.
- Początek dostępności: skip link, focus-visible, reduced motion, modal z obsługą klawiatury.
- PWA jako dobry fundament pod późniejszy offline-first lub instalowalną aplikację.

## Najważniejsze ryzyka i braki

- Brak testów, lintingu, formatowania, kontroli typów i CI.
- Brak lockfile, co osłabia powtarzalność instalacji.
- `build:js` minifikuje tylko `js/main.js`, ale nie bundluje całej aplikacji modułowej.
- Dane użytkownika są wstawiane do `innerHTML` przez template stringi, co przed produkcją trzeba zabezpieczyć przed XSS.
- Auth jest wyłącznie demonstracyjny i nie daje żadnego realnego bezpieczeństwa.
- Store łączy logikę domenową, persystencję i mutacje bez walidacji schematu oraz migracji danych.
- Service worker ma ręcznie utrzymywaną listę assetów.
- Widoki zawierają dużo logiki formularzy, renderowania i event handlerów w jednym miejscu.
- Brak formalnej definicji modelu domenowego, statusów, walidacji i reguł biznesowych.
- Brak procesu release, observability i dokumentów architektonicznych.

## 10 priorytetów implementacyjnych

### 1. Powtarzalny toolchain jakości - ukończone

**Cel:** Każda zmiana powinna przechodzić przez te same automatyczne bramki jakości.

**Zakres:**

- Dodać lockfile przez `npm install` i commitować go w repozytorium.
- Dodać ESLint dla JavaScriptu.
- Dodać Prettier dla JS, CSS, HTML i Markdown.
- Dodać Stylelint dla CSS.
- Uporządkować skrypty npm: `lint`, `format`, `test`, `build`, `check`.
- Dodać prosty pipeline CI, np. GitHub Actions: install, lint, test, build.

**Definition of Done:** Pull request nie może zostać uznany za gotowy, jeśli lint, format, testy lub build nie przechodzą lokalnie i w CI.

**Status:** Ukończono pierwszy etap quality toolchainu. Projekt ma teraz `package-lock.json`, konfigurację ESLint, Prettier i Stylelint, skrypty `lint`, `format`, `test`, `build` i `check` oraz workflow GitHub Actions uruchamiający `npm ci`, lint, test i build dla katalogu `C:\Users\KPKro\MY FILES\repos\saas-pr01-flowdesk`.

### 2. Testy jednostkowe, integracyjne i e2e - ukończone

**Cel:** Rozbudowa projektu ma być bezpieczna, a regresje mają być wykrywane automatycznie.

**Zakres:**

- Dodać Vitest lub podobne lekkie narzędzie do testów jednostkowych.
- Przetestować `validators`, `format`, `storage`, `store` i podstawowe reguły routingu.
- Dodać testy DOM dla formularzy klientów, zleceń i wydarzeń.
- Dodać Playwright dla ścieżek e2e: login, dodanie klienta, dodanie zlecenia, eksport danych, przełączenie motywu.
- Dodać testy dostępności np. przez axe w najważniejszych widokach.

**Definition of Done:** Istnieje minimalna piramida testów, a krytyczne przepływy biznesowe są chronione przed regresją.

**Status:** Ukończono pierwszy realny setup testowy. Projekt ma teraz Vitest dla testów jednostkowych i integracyjnych, Playwright dla ścieżek e2e, axe checks dla kluczowych widoków, oddzielne skrypty `test:unit`, `test:integration`, `test:e2e` i `test:a11y` oraz rozszerzony workflow CI uruchamiający pełną piramidę testów.

### 3. Formalny model domenowy i walidacja danych - ukończone

**Cel:** Dane powinny mieć jawny kontrakt, który można walidować i migrować.

**Zakres:**

- Zdefiniować modele: `Client`, `Project`, `Event`, `UserSession`, `UiPreferences`.
- Wydzielić słowniki statusów, priorytetów i typów zdarzeń do jednego miejsca.
- Dodać walidację danych wejściowych dla formularzy i importu JSON.
- Dodać wersjonowanie schematu `localStorage`, np. `flowdesk_state_v2` albo `schemaVersion` w stanie.
- Przygotować migracje danych między wersjami.
- Ustalić reguły spójności: usunięcie klienta a powiązane zlecenia i wydarzenia, puste daty, brak klienta, status końcowy.

**Definition of Done:** Każdy zapis do store'a przechodzi przez walidację, a aplikacja umie bezpiecznie obsłużyć starszy lub uszkodzony stan z `localStorage`.

**Status:** Ukończono formalizację modelu domenowego. Projekt ma teraz kontrakty modeli, centralne słowniki statusów/priorytetów/typów wydarzeń, walidację i normalizację danych, `schemaVersion: 2`, migracje starszego lub uszkodzonego `localStorage`, reguły spójności relacji klient-zlecenie-wydarzenie oraz testy pokrywające walidatory, migracje i zapisy store'a.

### 4. Warstwa stanu, selektorów i akcji domenowych - ukończone

**Cel:** Widoki nie powinny znać szczegółów mutowania danych ani ręcznie liczyć wszystkich wartości pochodnych.

**Zakres:**

- Rozdzielić store na akcje, selektory i adapter persystencji.
- Dodać selektory: aktywne zlecenia, zaległe zlecenia, wydarzenia tygodnia, zlecenia klienta.
- Uporządkować operacje mutujące jako jawne akcje domenowe.
- Dodać obsługę błędów i wyników operacji, zamiast zakładać, że każdy zapis się uda.
- Ograniczyć powtarzane renderowanie i ręczne ponowne podpinanie event listenerów.

**Definition of Done:** Widoki pobierają dane przez selektory i uruchamiają akcje, a store pozostaje jedynym miejscem odpowiedzialnym za spójność stanu.

**Status:** Ukończono rozdzielenie warstwy stanu na adapter persystencji, jawne akcje domenowe i czyste selektory. Store zapisuje stan przez `js/core/persistence.js`, mutacje klientów, zleceń, wydarzeń i preferencji UI przechodzą przez `js/core/actions.js` z wynikiem `{ ok, data, error, issues }`, a widoki korzystają z `js/core/selectors.js` dla metryk dashboardu, filtrowania, lookupów relacji i danych pochodnych. Dodano testy jednostkowe dla actions, selectors, persistence oraz zachowano kompatybilną fasadę store dla istniejących przepływów.

### 5. Bezpieczne renderowanie i hardening frontendu - ukończone

**Cel:** Projekt musi być przygotowany na dane użytkownika, a nie tylko zaufane dane demo.

**Zakres:**

- Wprowadzić helper do escapowania tekstu renderowanego w HTML.
- Ograniczyć bezpośrednie wstawianie danych użytkownika przez `innerHTML`.
- Dla dynamicznych list rozważyć tworzenie elementów DOM przez API zamiast template stringów.
- Dodać Content Security Policy dla hostingu produkcyjnego.
- Uporządkować obsługę URL-i, eksportu JSON i potencjalnie niepoprawnych danych importowanych.
- Jasno oddzielić `auth.demo.js` od przyszłej implementacji realnego auth.

**Definition of Done:** Dane wpisane przez użytkownika nie mogą wykonywać kodu ani psuć struktury DOM, a README jasno opisuje granice bezpieczeństwa demo.

**Status:** Ukończono pierwszy etap hardeningu frontendu. Projekt ma helpery `escapeHTML`, `escapeAttribute` i `safeText`, zabezpieczone renderowanie danych klientów, zleceń, wydarzeń i sesji demo, DOM API dla toastów, CSP w `index.html`, obsługę błędnego JSON restore przez wynik akcji, osobny moduł `auth.demo.js` oraz testy potwierdzające, że payloady HTML są wyświetlane jako tekst i nie tworzą wykonywalnych elementów DOM. README opisuje granice bezpieczeństwa wersji demonstracyjnej.

### 6. Profesjonalny system komponentów UI

**Cel:** UI ma rosnąć przez komponowanie spójnych elementów, a nie przez kopiowanie HTML między widokami.

**Zakres:**

- Ustalić API komponentów: Button, Input, Select, Textarea, Modal, Drawer, Toast, Table, EmptyState, ConfirmDialog, PageHeader.
- Wydzielić wspólny builder formularzy lub helper do pól z label, helperem i błędem.
- Dodać komponent potwierdzania operacji destrukcyjnych zamiast powielania modali.
- Zastąpić emoji w nawigacji i akcjach spójnym systemem ikon lub własnym małym zestawem SVG.
- Udokumentować design tokens: kolory, spacing, radius, shadow, typografia, breakpointy.
- Dodać testy wizualne lub przynajmniej screenshot smoke testy dla kluczowych widoków.

**Definition of Done:** Nowy widok można zbudować z istniejących komponentów bez kopiowania dużych bloków HTML i CSS.

**Status:** Ukończono profesjonalizację lekkiego systemu komponentów UI. Projekt ma teraz jawne API dla przycisków, pól formularzy, nagłówków stron, pustych stanów, tabel, modali, drawerów, toastów i dialogów potwierdzeń, a kluczowe widoki korzystają ze wspólnych komponentów zamiast powielać duże bloki markup. Dodano dostępne helpery formularzy z `label`, `helper`, `error`, `aria-describedby` i `aria-invalid`, destrukcyjne akcje klientów, zleceń oraz resetu danych przechodzą przez `ConfirmDialog`, emoji w nawigacji i akcjach zastąpiono kontrolowanym lokalnym systemem SVG, a `docs/design-system.md` dokumentuje tokeny, konwencje komponentów i zasady rozwoju UI. Dodano testy jednostkowe komponentów oraz Playwright visual smoke tests dla logowania i głównych widoków aplikacji.

### 7. Rozbudowa funkcji domenowych Service Management

**Cel:** FlowDesk powinien stać się aplikacją operacyjną, a nie tylko listą klientów i zleceń.

**Zakres:**

- Rozszerzyć klientów o kontakty, tagi, segment, właściciela i historię aktywności.
- Rozszerzyć zlecenia o zadania, checklisty, SLA, estymacje, terminy, komentarze i historię zmian.
- Dodać globalne wyszukiwanie działające realnie, bo obecny topbar ma tylko pole input.
- Dodać dashboard oparty o faktyczne metryki: overdue, completed, throughput, high priority, upcoming.
- Dodać widok szczegółów klienta i zlecenia jako osobne trasy.
- Dodać import JSON z walidacją, nie tylko eksport.
- Dodać archiwizację zamiast trwałego usuwania dla ważnych rekordów.

**Definition of Done:** Aplikacja obsługuje pełniejszy przepływ pracy zespołu usługowego: od klienta, przez zlecenie i zadania, po status, terminy i historię.

**Status:** Ukończono MVP rozbudowy domeny Service Management. Schemat danych podniesiono do `schemaVersion: 3`, klienci mają kontakty, tagi, segmenty, ownerów, aktywność i archiwizację, a zlecenia mają checklisty, SLA, estymacje, komentarze, historię, `completedAt` i archiwizację. Dodano selektory operacyjne dla zaległych, ukończonych, throughput, high priority, upcoming events, archiwum, detali i global search, osobne trasy `#/clients/:id` oraz `#/projects/:id`, realne wyszukiwanie w topbarze, dashboard oparty o metryki operacyjne, import JSON z walidacją przez istniejący restore path oraz testy jednostkowe, integracyjne, e2e, a11y i visual smoke dla nowych przepływów.

### 8. Przygotowanie pod backend, auth i multi-user

**Cel:** Lokalna aplikacja demo powinna mieć ścieżkę migracji do produktu z prawdziwymi użytkownikami.

**Zakres:**

- Wydzielić warstwę repozytoriów: `clientsRepository`, `projectsRepository`, `eventsRepository`.
- Zaimplementować adapter `localStorage` jako jedną z możliwych implementacji, a nie jako stały fundament domeny.
- Zaprojektować API kontrakty dla przyszłego backendu.
- Dodać model użytkownika, organizacji, ról i uprawnień.
- Zaplanować RBAC: Owner, Manager, Member, Viewer.
- Przygotować strategię synchronizacji danych i konfliktów dla trybu offline.

**Definition of Done:** Przejście z `localStorage` na API nie wymaga przepisywania widoków, tylko podmiany adapterów i rozszerzenia auth.

**Status:** Ukończono etap backend readiness. Projekt ma teraz warstwę repozytoriów `clientsRepository`, `projectsRepository` i `eventsRepository`, aktywny adapter `localStorage` zamknięty za granicą repozytoriów, spójne wyniki operacji repozytoriów, fabrykę `createFlowDeskRepositories` oraz store oparty o repozytoryjny adapter persistence. Dodano frontendowe modele `User`, `Organization` i `Membership`, role `Owner`, `Manager`, `Member`, `Viewer`, macierz uprawnień RBAC, helpery `can` i `hasPermission`, demo user context w sesji oraz lekkie hooki `syncMetadata` dla przyszłej synchronizacji. Dokumenty `docs/backend-readiness.md` i `docs/api-contracts.md` opisują docelowe kontrakty API, strategię RBAC, ograniczenia demo oraz model offline sync i konfliktów. README i service worker zostały zaktualizowane, a testy pokrywają repozytoria, adapter `localStorage`, kształty wyników, identity, RBAC, sync metadata i pracę store'a przez granicę repozytoriów.

### 9. PWA, performance i strategia cache

**Cel:** Aplikacja ma być szybka, przewidywalna offline i łatwa do aktualizacji po deployu.

**Zakres:**

- Zautomatyzować listę plików cache'owanych przez service workera.
- Dodać strategię aktualizacji service workera i komunikat „dostępna nowa wersja”.
- Ustalić cache strategy dla app-shell, fontów, ikon i przyszłych requestów API.
- Dodać Lighthouse jako okresowy quality gate.
- Ustalić budżety wydajnościowe: rozmiar JS/CSS, czas startu, CLS, LCP.
- Sprawdzić zachowanie aplikacji na mobile, przy wolnej sieci i przy braku `localStorage`.

**Definition of Done:** Po deployu użytkownik dostaje aktualną wersję aplikacji bez ręcznego czyszczenia cache, a podstawowe metryki Lighthouse są monitorowane.

**Status:** Ukończono etap PWA, performance i strategii cache. Projekt ma teraz generowany manifest app-shell `service-worker-assets.js` tworzony przez `scripts/generate-service-worker-manifest.js`, skrypty `pwa:manifest` i `pwa:check`, service worker z rozdzielonymi strategiami navigation network-first, app-shell/static cache-first oraz guarded `/api/*` network-only fallback. Dodano kontrolowany update flow z toastem „Nowa wersja FlowDesk jest dostępna” i ręcznym `SKIP_WAITING`, odporność na niedostępny `localStorage`, szybki performance budget w `scripts/check-performance-budget.js`, konfigurację `lighthouserc.cjs`, dokumenty `docs/pwa-strategy.md` i `docs/performance-budget.md`, kroki CI dla PWA manifestu i budżetu oraz testy Playwright dla update promptu, mobile viewport, wolnych assetów, braku `localStorage` i offline cached app-shell.

### 10. Dokumentacja, ADR-y, release process i observability

**Cel:** Projekt ma być łatwy do przejęcia, rozwijania i utrzymania przez kolejne osoby.

**Zakres:**

- Utrzymywać README jako dokument wejściowy dla developera.
- Dodać `docs/architecture.md` z opisem modułów, przepływu danych i decyzji technicznych.
- Dodać ADR-y dla większych decyzji: framework vs vanilla, localStorage vs backend, routing, test runner, bundler.
- Dodać changelog i konwencję wersjonowania.
- Dodać monitoring błędów frontendowych w wersji produkcyjnej.
- Ustalić Definition of Done dla PR-ów.
- Dodać checklistę release i rollbacku.

**Definition of Done:** Nowy developer potrafi uruchomić projekt, zrozumieć architekturę i bezpiecznie dowieźć zmianę bez rozmowy z autorem projektu.

**Status:** Ukończono finalny etap dokumentacji i utrzymania projektu. README pełni teraz rolę głównego wejścia developerskiego i linkuje mapę dokumentów. Dodano `docs/architecture.md`, komplet ADR-ów w `docs/adr/`, `CHANGELOG.md`, `docs/versioning.md`, `docs/definition-of-done.md`, `docs/release-checklist.md` oraz `docs/observability.md`. Projekt ma lekki moduł `js/core/observability.js` z lokalnym buforem, sanitizacją kontekstu i handlerami `window.error` oraz `unhandledrejection`, bez zewnętrznych providerów, tokenów i requestów sieciowych. Dodano testy jednostkowe observability, a app-shell manifest jest aktualizowany przez istniejący proces PWA.

## Rekomendowana kolejność prac

1. Toolchain jakości, lockfile i CI.
2. Testy dla obecnego zachowania.
3. Bezpieczne renderowanie danych.
4. Model domenowy, walidacja i migracje store'a.
5. Refactor store'a na akcje, selektory i adapter persystencji.
6. System komponentów UI.
7. Rozszerzenie domeny: szczegóły klientów, szczegóły zleceń, zadania, global search.
8. Backend readiness, auth i RBAC.
9. PWA/performance i automatyzacja service workera.
10. Release process, observability i dokumentacja architektury.

## Senior-level rekomendacja

Nie warto zaczynać od dużego przepisywania aplikacji na framework tylko dlatego, że projekt ma rosnąć. Najpierw trzeba ustabilizować jakość, testy, modele danych i granice odpowiedzialności. Dopiero gdy funkcje domenowe zaczną wymagać bardziej złożonego stanu, routingu i komponentów, należy świadomie podjąć decyzję, czy pozostać przy vanilla ES Modules z bundlerem, czy przejść na React/Vue/Svelte/TypeScript.

Największym ryzykiem teraz nie jest brak frameworka. Największym ryzykiem jest dokładanie funkcji bez testów, bez bezpiecznego renderowania, bez kontraktów danych i bez jasnego procesu zmian.
