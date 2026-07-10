# FlowDesk backend readiness

## Status i odpowiedzialność dokumentu

Ten dokument jest planem architektury przyszłego backendu. FlowDesk pozostaje
frontend-only demo bez backendu, bazy danych, requestów API, produkcyjnego auth,
izolacji tenantów, monitoringu i synchronizacji chmurowej.

Decyzje opisane jako **Proposed** wymagają zatwierdzenia przed implementacją.
Pozycje **Deferred** są jawnie zablokowane przez decyzję właściciela, wybór
technologii albo ograniczenia infrastruktury. ADR
[`008-provider-neutral-backend-boundary.md`](adr/008-provider-neutral-backend-boundary.md)
zbiera nadrzędną decyzję architektoniczną i pozostaje w statusie Proposed.

Źródła prawdy dla przyszłych prac:

- ten dokument definiuje granice odpowiedzialności, bezpieczeństwa, danych,
  migracji oraz kolejność wdrożenia,
- [`api-contracts.md`](api-contracts.md) definiuje przyszły kontrakt HTTP,
  błędy, idempotency, concurrency i mapowanie na frontend,
- [`future-saas-readiness.md`](future-saas-readiness.md) jest rejestrem
  nierozstrzygniętych decyzji właściciela,
- [`observability.md`](observability.md) definiuje granice telemetryczne i
  korelację requestów.

## Mapa aktualnego stanu

| Obszar        | Co istnieje dziś                                        | Ograniczenie demo                                          | Granica do ponownego użycia                              | Przyszłe źródło prawdy                             |
| ------------- | ------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------- |
| Auth          | fasada `js/core/auth.js` i lokalna sesja `auth.demo.js` | dowolny poprawny email tworzy sesję Owner w `localStorage` | stabilna fasada auth i oczekiwany kontekst sesji         | serwerowa sesja i zweryfikowana tożsamość          |
| Identity      | modele `User`, `Organization`, `Membership`             | jeden lokalny workspace bez lifecycle                      | nazwy modeli i relacja membership                        | backend oraz zweryfikowany identity provider       |
| RBAC          | role, permissions, `can()` i `hasPermission()`          | helpery nie chronią danych ani operacji                    | nazwy ról i większość permission strings                 | deny-by-default enforcement na serwerze            |
| Stan          | store, akcje, selektory i przewidywalne wyniki          | synchroniczna mutacja całego lokalnego stanu               | fasada store, akcje domenowe i selektory                 | kanoniczne odpowiedzi API                          |
| Persistence   | repozytoria i adapter `localStorage`                    | dane są lokalne dla przeglądarki                           | dependency injection i wynik repozytorium                | trwały storage serwera                             |
| Walidacja     | normalizatory, walidatory i migracje schema v3          | kontrola klienta może zostać pominięta                     | UX, formularze, import preview i normalizacja odpowiedzi | walidacja i integralność po stronie serwera        |
| Sync          | `syncMetadata.js` z `revision` i statusami              | hook nie jest używany przez kolejkę ani UI                 | słownik statusów i koncepcja rewizji                     | serwerowe wersje, idempotency i decyzje konfliktów |
| Observability | zsanityzowany bufor in-memory i reporter hook           | brak backendowych logów, request IDs i alertów             | bezpieczny adapter frontendowy                           | monitoring, logi i korelacja po stronie usługi     |

Żadna z obecnych warstw frontendowych nie jest produkcyjnym mechanizmem
bezpieczeństwa.

## Proponowane invariants architektury

Przed rozpoczęciem implementacji należy zatwierdzić następujące zasady:

1. Serwer jest autorytatywny dla identity context, członkostw, ról, uprawnień,
   danych domenowych, relacji, wersji rekordów i audytu.
2. Organizacja jest granicą tenanta. Każdy odczyt i zapis jest scope'owany przez
   membership wyprowadzone ze zweryfikowanej sesji.
3. `organizationId` z URL, nagłówka lub payloadu jest wyłącznie kontekstem
   routingu i nigdy nie jest dowodem dostępu.
4. Autoryzacja działa deny-by-default. Brak jawnego uprawnienia oznacza odmowę.
5. Frontendowe auth, RBAC i validation pozostają warstwami UX.
6. `localStorage` nie jest źródłem prawdy dla sesji ani danych chmurowych.
7. Preferencje lokalnego UI, takie jak theme i reduced motion, mogą pozostać
   lokalne, dopóki osobna decyzja nie przeniesie ich na profil użytkownika.
8. Pierwszy backend działa online-first. Offline writes są opcjonalnym,
   późniejszym etapem.

## Authentication i sesje

### Podział odpowiedzialności

- Identity provider, jeżeli zostanie wybrany, potwierdza tożsamość i obsługuje
  credential lifecycle właściwy dla danego mechanizmu.
- FlowDesk mapuje zweryfikowaną tożsamość na `User`, aktywne `Membership`,
  `Organization`, role i permissions.
- Serwer FlowDesk waliduje sesję przy każdym chronionym requeście. Frontend nie
  może sam potwierdzić tożsamości ani roli.

### Proponowany model przeglądarkowy

- Serwer tworzy revocable session z bezwzględnym czasem wygaśnięcia i opcjonalnym
  idle timeoutem.
- Przeglądarka otrzymuje opaque session identifier w cookie `Secure`, `HttpOnly`
  i z restrykcyjnym `SameSite` dobranym do zatwierdzonej topologii wdrożenia.
- Tokeny sesji, refresh tokeny i credentiale nie trafiają do `localStorage` ani
  do JavaScript-readable storage.
- Dla cookie-auth każda mutacja wymaga ochrony CSRF właściwej dla wybranego
  backendu, co najmniej kontroli `Origin`/`Referer` oraz tokenu CSRF. Requesty
  `GET` nie mogą mutować danych.
- Dokładny identity provider, recovery flow, MFA, session timeout i topologia
  same-origin/cross-origin pozostają Deferred.

### Lifecycle i zachowanie frontendu

1. Login kończy się dopiero po potwierdzeniu identity i utworzeniu serwerowej
   sesji.
2. Przy starcie aplikacja odczytuje `/api/v1/auth/session`; brak ważnej sesji
   prowadzi do `#/login` bez używania lokalnej sesji jako fallbacku.
3. Logout unieważnia sesję po stronie serwera, czyści stan użytkownika i dopiero
   potem przechodzi do loginu.
4. `401 unauthenticated` oznacza sesję nieobecną, wygasłą lub unieważnioną.
   Frontend usuwa z pamięci prywatne dane i żąda ponownego logowania.
5. `403 permission_denied` nie wylogowuje użytkownika; UI zachowuje kontekst i
   pokazuje bezpieczny komunikat odmowy.
6. Revocation członkostwa lub organizacji obowiązuje najpóźniej przy kolejnym
   requestcie albo odświeżeniu sesji.

## Organization i workspace lifecycle

Proposed baseline traktuje `Organization` jako pojedynczy workspace i granicę
tenanta. Osobny model workspace powstanie tylko po zatwierdzeniu rzeczywistego
przypadku produktu.

- Utworzenie organizacji atomowo tworzy pierwsze aktywne `Membership` z rolą
  Owner.
- Użytkownik może mieć członkostwa w wielu organizacjach, ale każdy request ma
  jeden jawny organization context zweryfikowany względem sesji.
- Zaproszenie ma docelową organizację, proponowaną rolę, jednorazowy token, czas
  wygaśnięcia i status. Akceptacja wiąże zweryfikowanego użytkownika z
  organizacją.
- Zmiana roli, zawieszenie i usunięcie członkostwa wymagają
  `organization:admin`, kontroli tenant scope oraz eventu audytowego.
- Organizacja zawsze musi mieć co najmniej jednego aktywnego Ownera. Ostatni
  Owner nie może obniżyć własnej roli ani usunąć członkostwa.
- Transfer ownership wymaga wskazania aktywnego członka, ponownego potwierdzenia
  operacji i atomowej zmiany ról. Szczegóły ponownej autoryzacji są Deferred.
- Zawieszone lub usunięte membership natychmiast traci dostęp do nowych
  requestów; aktywne sesje muszą zostać unieważnione albo ponownie ocenione.
- Dezaktywacja organizacji blokuje mutacje i nowe sesje w tym workspace. Okres
  read-only, eksport, retencja, ponowna aktywacja i trwałe usunięcie wymagają
  decyzji właściciela oraz wymagań prawnych.

Billing, płatności i produkcyjne zarządzanie kontem nie są częścią tego zadania.

## Server-side RBAC i tenant isolation

Aktualne role `Owner`, `Manager`, `Member` i `Viewer` mogą pozostać nazwami
kontraktowymi. Serwer musi jednak utrzymywać własną, wersjonowaną macierz
permissions i nie może ufać liście permissions zwróconej wcześniej do klienta.

| Operacja                             | Istniejący frontendowy kontrakt | Wymaganie serwera                                                |
| ------------------------------------ | ------------------------------- | ---------------------------------------------------------------- |
| list/read client, project, event     | `*:read`                        | aktywne membership, tenant scope i permission read               |
| create/update                        | `*:write`                       | tenant scope, permission write, validation i relationship checks |
| archive/restore client lub project   | `*:archive`                     | tenant scope, permission archive i audit                         |
| import                               | `data:import`                   | permission, idempotency, pełna walidacja i audit                 |
| export                               | `data:export`                   | permission, tenant-scoped dataset i audit                        |
| settings                             | `settings:write`                | rozdzielenie ustawień user/org i właściwy permission             |
| memberships i organization lifecycle | `organization:admin`            | Owner/approved admin policy, invariants własności i audit        |
| hard delete                          | brak dedykowanych permissions   | deny do czasu zatwierdzenia `*:delete` i roli uprawnionej        |

Reguły enforcementu:

- Query do zasobu biznesowego zawsze zawiera serwerowo ustalony tenant scope.
- Relacje, np. `project.clientId` i `event.projectId`, muszą wskazywać rekordy z
  tej samej organizacji.
- Zasób z innej organizacji jest traktowany jak nieistniejący i zwraca
  tenant-safe `not_found`; brak roli w bieżącej organizacji zwraca
  `permission_denied`.
- Read, write, archive, restore, delete, import i export mają osobne jawne
  kontrole. Uprawnienie write nie implikuje hard delete.
- Frontend może ukrywać niedostępne akcje, ale odmowa serwera jest ostateczna.

## Własność danych

| Dane                                                 | Autorytatywny właściciel                       | Uwagi                                                    |
| ---------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------- |
| zewnętrzna tożsamość i credentiale                   | identity provider lub zatwierdzona usługa auth | FlowDesk nie przechowuje credentiali bez osobnej decyzji |
| profil `User` używany przez FlowDesk                 | backend FlowDesk                               | powiązany ze zweryfikowaną identity                      |
| `Organization`, `Membership`, role i permissions     | backend FlowDesk                               | każda zmiana jest walidowana i audytowana                |
| clients, projects, events, comments, tasks i relacje | backend FlowDesk                               | tenant-scoped, server IDs i server timestamps            |
| audit events                                         | backendowy audit store                         | append-only dla zwykłych użytkowników                    |
| operational logs i metrics                           | system observability                           | inna retencja i dostęp niż audit                         |
| theme i reduced motion                               | lokalny frontend                               | mogą pozostać w local storage jako preferencje UI        |
| dane aktualnego demo                                 | lokalna przeglądarka                           | nie są automatycznie danymi konta ani chmury             |

## Persistence i migracja granicy repozytoriów

Obecny store, persistence i collection repositories są synchroniczne. Nie można
bezpośrednio podmienić `localStorageRepositoryAdapter` na adapter sieciowy bez
osobnej migracji asynchronicznej.

Proposed future contract:

```js
Promise<{ ok: true, data, state }>
Promise<{ ok: false, error, issues }>
```

Kształt wyniku pozostaje zgodny z `repositoryOk`/`repositoryFail`, ale:

- `state` może być `null` albo kontrolowanym cache snapshotem i nie reprezentuje
  pełnej prawdy serwera,
- store musi obsłużyć `idle`, `loading`, `success` i `error` per operacja,
- mutacje początkowo są pessimistic: UI commit następuje po odpowiedzi serwera,
- adapter przyjmuje `AbortSignal` dla anulowania oczekiwania klienta,
- anulowanie requestu przez frontend nie oznacza, że serwer nie zaakceptował
  mutacji; retry wymaga idempotency key,
- automatyczny retry jest dozwolony tylko dla bezpiecznych odczytów albo
  idempotentnych mutacji,
- widoki zachowują store/actions/selectors jako punkt integracji, ale będą
  wymagały osobnego zadania na async loading i error states.

Bezpieczna kolejność migracji adaptera:

1. Zatwierdzić kontrakty API i rozszerzone kody błędów.
2. Wprowadzić asynchroniczny interfejs repozytoriów za testowalną fabryką.
3. Dostosować store facade do Promise results bez bezpośrednich requestów w
   widokach.
4. Uruchomić online-only API adapter za jawnym mechanizmem rollout/rollback.
5. Porównać zapis i odczyt na kontrolowanych danych testowych.
6. Dopiero po stabilizacji rozważyć import danych demo lub offline outbox.

## Identyfikatory, schemat i migracje

- Backend generuje opaque, stabilne identyfikatory i serwerowe timestamps.
- `organizationId`, `id`, `createdAt`, `updatedAt`, audit fields i `revision` są
  server-controlled i nie mogą być nadpisane przez zwykły payload klienta.
- Relacje są egzekwowane przez storage i warstwę aplikacyjną w ramach jednego
  tenanta.
- Lokalny `CURRENT_SCHEMA_VERSION = 3` dotyczy wyłącznie demo state. Nie jest
  wersją przyszłej bazy ani API.
- Migracje backendowe mają własną numerację, review, test na kopii danych,
  backup/restore gate oraz plan roll-forward. Rollback jest dozwolony tylko,
  gdy migracja i model danych są rzeczywiście odwracalne.
- Wdrożenie nie może uruchamiać nowej wersji aplikacji przed potwierdzeniem
  kompatybilnej wersji schematu.
- Import kwalifikujących się danych demo, jeśli zostanie zatwierdzony, jest
  jawną operacją użytkownika: preview, walidacja, tenant assignment, idempotency,
  atomowy commit i audit. Automatyczny upload z `localStorage` jest zabroniony.
- RPO, RTO, backup provider, database vendor i narzędzie migracji są Deferred.

## Server-side validation

Każdy payload klienta, query parameter, plik importu i identyfikator relacji jest
niezaufany, nawet gdy frontend wykonał walidację.

Serwer musi:

- rozdzielić create/update input od response modelu,
- przycinać i normalizować dozwolone stringi według jawnych reguł,
- walidować enumy, daty, długości, rozmiar kolekcji i typy,
- odrzucać nieznane lub server-controlled fields zgodnie z kontraktem,
- chronić unikalność identyfikatorów i innych zatwierdzonych kluczy,
- sprawdzać istnienie i tenant scope każdej relacji,
- egzekwować immutable fields i dozwolone przejścia statusów,
- walidować pełny import przed atomowym zapisem,
- zwracać bezpieczne issues bez stack trace, query, sekretów i danych innego
  tenanta.

Frontend może utrzymywać zgodne komunikaty i normalizatory, ale backend nie może
zakładać wspólnego runtime ani importować kodu walidacji z przeglądarki bez
osobnej decyzji technologicznej.

## Audit log

Security audit log jest oddzielny od operational logs i od widocznej w UI
historii aktywności. Jest serwerowy, append-only dla standardowych operacji i
nie może być modyfikowany przez endpointy domenowe.

Minimalny event zawiera:

- `id`, `timestamp`, `requestId` i wynik (`success`, `denied`, `failed`),
- actor type/id oraz organization id,
- action, target resource type/id i bezpieczny reason code,
- allowlistowane before/after metadata dla zmian wysokiego ryzyka,
- źródło systemowe lub session id tylko, gdy polityka prywatności na to pozwala.

Audit obejmuje co najmniej: login/logout/revocation, invitations, zmiany ról,
transfer ownership, deactivation, import/export, archive/restore/delete,
ustawienia organizacji i odrzucone operacje administracyjne.

Pełne formularze, komentarze, notatki, tokeny, credentiale i sekrety są
redagowane. Retencja, eksport, dostęp audytorów, lokalizacja danych i zasady
usunięcia wymagają decyzji właściciela oraz review prawnego.

## Request correlation i observability

- Serwer tworzy albo normalizuje canonical `requestId` na granicy requestu,
  zwraca go w `X-Request-ID` i `meta.requestId` oraz propaguje do logów, błędów i
  audit eventów.
- Client-generated correlation value może być zapisany osobno, ale nie zastępuje
  serwerowego identyfikatora.
- Logi są strukturalne i zawierają route template, method, status, latency,
  service/environment oraz bezpieczne identyfikatory korelacyjne.
- Payloady, cookies, auth headers, tokeny, notatki i bezpośrednie PII nie trafiają
  do zwykłych logów.
- Frontend może przekazać `requestId` do zsanityzowanego `captureError`, aby
  połączyć błąd UI z odpowiedzią API.
- Monitoring provider pozostaje adapterem. Wybór dostawcy, regionu, sampling,
  alert ownership, koszt i retencja są Deferred.

Pełny podział odpowiedzialności znajduje się w
[`observability.md`](observability.md).

## Offline sync i konflikty

Offline writes są **Deferred** i nie blokują pierwszej wersji backendu. Obecne
PWA cache oraz `syncMetadata.js` nie stanowią implementacji synchronizacji.

Jeśli funkcja zostanie zatwierdzona:

1. Serwer pozostaje canonical state.
2. Klient używa trwałego outboxa z `mutationId`, `idempotencyKey`, typem operacji,
   payloadem, `baseRevision`, czasem i statusem.
3. Operacje zależne zachowują kolejność; niezależne mogą być przetwarzane
   osobno.
4. Retry używa tego samego klucza idempotency i nie tworzy duplikatu.
5. Serwer porównuje `baseRevision` z aktualną rewizją i zwraca canonical record
   albo jawny konflikt.
6. Częściowo zaakceptowany batch zwraca wynik per mutation. Klient utrzymuje
   failed/conflicted entries i odświeża canonical snapshot przed kolejną próbą.
7. `localStorage` nie jest traktowany jako kopia chmurowa ani źródło prawdy.

Domyślne limity merge:

| Dane                                      | Automatyczne zachowanie            | Konflikt wymagający użytkownika       |
| ----------------------------------------- | ---------------------------------- | ------------------------------------- |
| lokalne preferencje UI                    | last-write-wins może być dozwolone | brak, dopóki pozostają lokalne        |
| create z ponowionym `mutationId`          | zwrócenie poprzedniego wyniku      | różny payload dla tego samego klucza  |
| clients, projects i events                | brak field-level auto-merge        | równoległa zmiana tego samego rekordu |
| comments jako append-only                 | idempotentne ponowienie dodania    | edycja/usunięcie lub brak parenta     |
| archive, restore, delete i zmiana relacji | brak automatycznego merge          | każda revision mismatch               |

UI musi pokazać odrzuconą lub skonfliktowaną zmianę, wersję serwera i bezpieczną
akcję ponów/odrzuć. Cicha utrata lokalnej lub serwerowej zmiany jest zabroniona.

## Fazy przyszłej implementacji

1. **Owner decisions i ADR approval** - backend runtime, deployment topology,
   auth, storage, retencja, RBAC delete policy i zakres offline.
2. **Backend foundation** - konfiguracja, secrets boundary, API versioning,
   response envelope, request correlation, migracje i podstawowa telemetryka.
3. **Identity i sessions** - login/logout/session validation, expiry, revocation i
   usunięcie `localStorage` jako auth authority.
4. **Organization isolation i RBAC** - lifecycle, memberships, invitations,
   tenant-scoped reads/writes, deny-by-default i audit administracyjny.
5. **Persistence i online API** - schemat, migracje, server validation,
   repozytoria, CRUD oraz Promise-based frontend adapter.
6. **Data operations** - bezpieczny import/export, recovery, backup gates i
   audyt operacji destrukcyjnych.
7. **Observability hardening** - provider adapter, alerty, retention i korelacja
   frontend-backend.
8. **Optional offline sync** - outbox, idempotent retries, tombstones, conflict
   UI i testy recovery dopiero po zatwierdzeniu produktu.

Każda faza wymaga osobnego scope'u, testów, security review, rollout planu i
rollback criteria. Ten dokument nie tworzy runtime scaffolding.

## Nierozstrzygnięte decyzje właściciela

| Decyzja                                            | Dlaczego blokuje implementację                      |
| -------------------------------------------------- | --------------------------------------------------- |
| backend runtime, framework i hosting               | określa deployment, migracje, sekrety i operacje    |
| API origin i topologia sieciowa                    | określa cookies, CSRF, CORS i session policy        |
| identity provider, recovery, MFA i timeouty        | określa login oraz lifecycle sesji                  |
| database/storage i wymagania RPO/RTO               | określa schemat, migracje, backup i recovery        |
| organization/workspace model i multi-workspace UX  | określa tenant routing i session context            |
| finalna macierz ról oraz hard-delete permissions   | blokuje bezpieczny enforcement destrukcyjnych akcji |
| invitation expiry i ownership re-auth              | określa lifecycle członkostwa                       |
| retencja, eksport i usunięcie danych               | wymaga decyzji produktu i prawnej                   |
| audit access, retention i privacy metadata         | określa compliance i storage                        |
| observability provider, region, sampling i budżet  | określa produkcyjny monitoring                      |
| idempotency retention, rate limits i page limits   | określa operacyjne kontrakty API                    |
| kwalifikacja danych demo do importu                | określa migrację użytkownika                        |
| wymóg offline writes i finalna polityka konfliktów | blokuje outbox, tombstones i conflict UI            |

Status oraz miejsce zatwierdzenia tych wyborów są utrzymywane w
[`future-saas-readiness.md`](future-saas-readiness.md).

## Poza zakresem

Ten plan nie autoryzuje implementacji backendu, bazy, requestów sieciowych,
produkcyjnego auth, account management, billing, płatności, nowych zależności,
zmiany frameworka ani ręcznej edycji plików wygenerowanych.
