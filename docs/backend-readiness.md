# FlowDesk backend readiness

## Cel

Ten dokument opisuje przygotowanie FlowDesk pod przyszły backend, prawdziwe uwierzytelnianie, organizacje, wielu użytkowników, role, uprawnienia i synchronizację offline. Obecna aplikacja nadal pozostaje frontend-only demo i nie wykonuje żadnych requestów sieciowych do API.

## Aktualny przepływ danych

Obecny przepływ pozostaje zgodny z wcześniejszą architekturą:

1. Widoki korzystają ze store'a, akcji i selektorów.
2. Akcje domenowe walidują oraz mutują stan.
3. Store zapisuje wynik przez warstwę persistence.
4. Persistence korzysta z adaptera repozytoriów opartego o `localStorage`.
5. Dane z `localStorage` są traktowane jako niezaufane i przechodzą przez migracje oraz normalizację.

To oznacza, że obecne UI i przepływy demo działają tak jak wcześniej, ale `localStorage` nie jest już bezpośrednim fundamentem domeny.

## Granica repozytoriów

Warstwa repozytoriów znajduje się w `js/repositories/`:

- `localStorageRepositoryAdapter.js` - aktywna implementacja demo oparta o `localStorage`, migracje i normalizację stanu
- `collectionRepository.js` - wspólne operacje kolekcji: `list`, `getById`, `create`, `update`, `archive`, `restore`, `remove`, `replaceAll`
- `clientsRepository.js` - repozytorium klientów
- `projectsRepository.js` - repozytorium zleceń
- `eventsRepository.js` - repozytorium wydarzeń
- `repositoryResults.js` - spójne kształty wyników `{ ok, data, state }` i `{ ok, error, issues }`
- `index.js` - fabryka `createFlowDeskRepositories`

Repozytoria są nadal synchroniczne, ponieważ aktywnym adapterem jest `localStorage`, ale ich kontrakt jest gotowy do zastąpienia adapterem API. Widoki nie powinny importować adaptera ani bezpośrednio czytać `localStorage`.

## Docelowy adapter API

Przyszły adapter API powinien zachować te same odpowiedzialności:

- ładowanie aktualnego stanu lub kolekcji z backendu
- zapis po walidacji po stronie klienta i serwera
- normalizacja odpowiedzi do domenowych modeli FlowDesk
- mapowanie błędów API na `repositoryFail`
- obsługa konfliktów i metadanych synchronizacji

Wdrożenie API nie powinno wymagać przepisywania widoków. Największa zmiana powinna dotyczyć implementacji adaptera oraz rozszerzenia auth o prawdziwą sesję.

## Modele identity

Frontend ma teraz lekkie modele gotowościowe w `js/domain/identity.js`:

- `User`
- `Organization`
- `Membership`

Sesja demo jest rozszerzana o kontekst:

```js
{
  (user, organization, membership, role, lastLogin);
}
```

To nadal nie jest realne uwierzytelnianie. Dane sesji pochodzą z demo auth i służą jako kontrakt UI oraz przygotowanie pod przyszłe API.

## Account i workspace readiness

Obecny kontekst `user`, `organization` i `membership` opisuje jedną lokalną przestrzeń demo. Nie zapewnia multi-tenant isolation, zaproszeń, przełączania workspace, lifecycle konta ani ustawień organizacji.

Przyszły backend musi zdefiniować:

- rejestrację, logowanie, wylogowanie i lifecycle sesji,
- tworzenie organizacji oraz właściciela workspace,
- zaproszenia członków, akceptację zaproszeń i dezaktywację użytkowników,
- zmianę ról, transfer ownership i usuwanie członkostw,
- organizacyjne ustawienia, np. nazwa, timezone, locale i domyślne preferencje,
- izolację danych po `organizationId` na każdym endpointzie,
- prawa eksportu i usunięcia danych organizacji.

Szczegółowa lista luk SaaS jest w `docs/future-saas-readiness.md`.

## RBAC

RBAC znajduje się w `js/domain/rbac.js`. Role:

| Rola    | Przeznaczenie                                            |
| ------- | -------------------------------------------------------- |
| Owner   | pełna administracja organizacją i danymi                 |
| Manager | zarządzanie operacjami bez administracji organizacją     |
| Member  | praca operacyjna na klientach, zleceniach i wydarzeniach |
| Viewer  | odczyt i eksport bez modyfikacji danych                  |

Kluczowe helpery:

- `can(role, permission)`
- `hasPermission(userContext, permission)`
- `normalizeRole(role)`

Na tym etapie RBAC jest warstwą gotowościową i testowanym kontraktem. Nie jest jeszcze egzekwowany szeroko w widokach, żeby nie zmieniać zachowania demo bez pełnego projektu uprawnień i backendowego enforcementu.

Przyszły backend powinien rozstrzygnąć, czy uprawnienia wynikają wyłącznie z roli, czy mogą mieć wyjątki per członek. Operacje wysokiego ryzyka, takie jak import, eksport, reset, archiwizacja, przywracanie, usuwanie, zmiana ról i przyszłe działania billingowe, muszą być egzekwowane po stronie serwera i logowane audytowo.

## Metadane synchronizacji

Lekki kontrakt metadanych znajduje się w `js/domain/syncMetadata.js`:

- `syncStatus`: `synced`, `pending`, `conflict`
- `revision`: lokalny lub serwerowy numer rewizji
- `createdAt`
- `updatedAt`

Moduł udostępnia normalizację i helper `markPendingSync`, ale obecne modele klientów, zleceń i wydarzeń nie dostały globalnej migracji pól sync. To celowo ogranicza ryzyko w demo i zostawia metadane jako hook dla przyszłego adaptera API.

## Strategia offline i konflikty

Docelowa strategia powinna być następująca:

1. Zmiana lokalna oznacza rekord jako `pending` i zwiększa `revision`.
2. Adapter zapisuje zmianę lokalnie, a osobna kolejka sync przygotowuje payload do API.
3. Backend porównuje `revision`, `updatedAt` albo `etag`.
4. Jeżeli serwerowa rewizja jest zgodna, zmiana zostaje przyjęta i rekord wraca do `synced`.
5. Jeżeli serwerowa rewizja jest nowsza, rekord przechodzi do `conflict`.
6. Konflikty operacyjne powinny być rozwiązywane manualnie dla danych biznesowych, a automatycznie tylko dla pól niskiego ryzyka.

Rekomendowane domyślne podejście:

- `last-write-wins` tylko dla preferencji UI
- manual conflict resolution dla klientów, zleceń, komentarzy i wydarzeń
- serwerowa walidacja jako ostateczne źródło prawdy
- audyt zmian dla operacji destrukcyjnych i archiwizacji

## Granice bezpieczeństwa

Przyszły backend musi egzekwować:

- uwierzytelnianie i sesje po stronie serwera
- autoryzację RBAC dla każdego endpointu
- izolację danych po `organizationId`
- walidację payloadów po stronie serwera
- audyt operacji administracyjnych i destrukcyjnych
- nagłówki bezpieczeństwa hostingu
- strategię wygaszania sesji i rotacji tokenów, jeżeli tokeny zostaną użyte

Frontendowe RBAC i walidacja są poprawą UX oraz wczesnym filtrem błędów, ale nie zastępują kontroli backendowej.

## Monetization readiness

Pole `Organization.plan` jest obecnie lokalnym kontraktem demo. Nie istnieją subskrypcje, płatności, faktury, usage limits, feature gates ani integracja z payment providerem.

Przed implementacją monetizacji trzeba zaprojektować:

- katalog planów i źródło prawdy dla aktywnego planu,
- właściciela subskrypcji oraz kontakt billingowy,
- trial, downgrade, cancelation i grace period,
- widoczność faktur oraz historii płatności,
- limity użycia, np. członkowie, aktywni klienci, aktywne zlecenia, eksport lub storage,
- relację między plan limits a RBAC,
- zachowanie eksportu i retencji danych po anulowaniu.

Na tym etapie monetization readiness jest wyłącznie planowaniem produktu. FlowDesk nie ma payment providera, billing logic ani pricing enforcement.

## Audit log readiness

Przyszły audit log powinien objąć co najmniej:

- logowanie, wylogowanie i zmiany sesji,
- import, eksport i reset danych,
- archiwizację, przywracanie i usuwanie rekordów,
- zmianę ról, zaproszenia i usuwanie członków,
- zmiany ustawień organizacji,
- przyszłe zmiany planu, subskrypcji i billing-adjacent actions.

Minimalny kontrakt audytu powinien zawierać actor id, organization id, action, resource type/id, timestamp, request id, status wyniku i bezpieczne streszczenie zmian. Log audytowy nie powinien przechowywać pełnych payloadów formularzy, sekretów ani nadmiarowych danych osobowych.
