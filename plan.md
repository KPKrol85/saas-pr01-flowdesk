# Plan rozwoju projektu FlowDesk

## Wizja produktu

FlowDesk ma rozwijać się w kierunku profesjonalnego panelu operacyjnego dla małych i średnich zespołów usługowych. Aplikacja powinna pomagać w zarządzaniu klientami, zleceniami, zadaniami, terminami, SLA i codzienną pracą zespołu. Docelowo powinna być szybka, dostępna, responsywna, bezpieczna i gotowa do pracy wielu użytkowników.

## Zasady rozwoju

- Najpierw stabilność i jakość, potem duże funkcje.
- Każda istotna decyzja architektoniczna powinna mieć uzasadnienie i miejsce w dokumentacji.
- Widoki nie powinny przejmować odpowiedzialności domeny, walidacji i persystencji.
- Dane użytkownika traktujemy jako niezaufane, nawet w aplikacji demo.
- UI rozwijamy przez spójne komponenty i tokeny, nie przez kopiowanie markupów.
- Funkcje produktowe muszą mieć kryteria akceptacji i testy regresji.
- Projekt powinien zachować prostotę tak długo, jak to możliwe, ale mieć jasną ścieżkę migracji do backendu i prawdziwego auth.

## Etap 0 - Stabilizacja fundamentów

**Cel:** Uporządkować projekt tak, aby każda kolejna zmiana była bezpieczniejsza i łatwiejsza do utrzymania.

**Zakres:**

- Dodać lockfile i uporządkować instalację zależności.
- Dodać ESLint, Prettier, Stylelint i skrypt `npm run check`.
- Dodać minimalny CI.
- Dodać testy jednostkowe dla `validators`, `format`, `store` i `router`.
- Dodać pierwsze testy e2e: login, klient, zlecenie, ustawienia.
- Zabezpieczyć dynamiczne renderowanie danych tekstowych.
- Udokumentować aktualną architekturę i ograniczenia demo.

**Rezultat:** Repozytorium jest gotowe do regularnej pracy developerskiej i code review.

## Etap 1 - Porządkowanie architektury frontendu

**Cel:** Przygotować kod pod większą liczbę widoków i funkcji bez kopiowania logiki.

**Zakres:**

- Wydzielić selektory i akcje domenowe ze store'a.
- Wydzielić adapter persystencji `localStorage`.
- Dodać schema version i migracje stanu.
- Zbudować wspólne komponenty formularzy, dialogów potwierdzających, tabel, empty state i page headerów.
- Uporządkować obsługę event listenerów po rerenderach.
- Dodać globalne zarządzanie toastami z `aria-live`.
- Rozpocząć dokumentowanie design systemu.

**Rezultat:** Dodanie nowego widoku lub formularza nie wymaga powielania dużych fragmentów kodu.

## Etap 2 - MVP produktowe Service Management

**Cel:** Rozszerzyć aplikację z demonstracyjnego dashboardu do użytecznego narzędzia operacyjnego.

**Zakres:**

- Osobny widok szczegółów klienta.
- Osobny widok szczegółów zlecenia.
- Zadania/checklisty w ramach zleceń.
- Historia aktywności klienta i zlecenia.
- Lepszy kalendarz: filtrowanie, najbliższe terminy, puste stany, powiązania.
- Global search w topbarze.
- Archiwizacja rekordów zamiast wyłącznie usuwania.
- Import JSON z walidacją i raportem błędów.
- Dashboard oparty o realne selektory i metryki operacyjne.

**Rezultat:** FlowDesk obsługuje realny, choć nadal lokalny, przepływ pracy małego zespołu usługowego.

## Etap 3 - Production readiness

**Cel:** Przygotować aplikację do wdrożenia jako produkt, nie tylko prototyp.

**Zakres:**

- Wybrać docelową architekturę builda, np. Vite + TypeScript albo świadomie utrzymany vanilla stack z bundlerem.
- Dodać prawdziwy backend lub BaaS.
- Zaimplementować auth, organizacje, użytkowników i role.
- Dodać RBAC dla widoków i akcji.
- Zastąpić lokalny store warstwą repozytoriów z adapterem API.
- Dodać monitoring błędów frontendowych.
- Dodać release process, changelog i wersjonowanie.
- Ustalić środowiska: local, preview, production.

**Rezultat:** Aplikacja ma fundament pod prawdziwe dane, wielu użytkowników i kontrolowany deployment.

## Etap 4 - Skalowanie produktu

**Cel:** Rozwijać FlowDesk w kierunku bardziej zaawansowanego narzędzia operacyjnego.

**Zakres:**

- Raporty i analityka operacyjna.
- SLA, automatyczne alerty i reguły eskalacji.
- Szablony zleceń i checklist.
- Integracje z kalendarzem, pocztą i narzędziami komunikacji.
- Załączniki i notatki zespołowe.
- Powiadomienia web push lub email.
- Offline sync z rozwiązywaniem konfliktów.
- Audyt zmian i log aktywności.

**Rezultat:** FlowDesk staje się platformą pracy operacyjnej, a nie tylko panelem CRUD.

## Priorytety backlogu

### P0 - Fundamenty konieczne

- Lockfile, lint, format, testy, CI.
- Bezpieczne renderowanie danych użytkownika.
- Testy krytycznych ścieżek.
- Walidacja modeli i migracje `localStorage`.
- Dokumentacja architektury i ograniczeń demo.

### P1 - Profesjonalizacja aplikacji

- Selektory, akcje domenowe i adapter persystencji.
- System komponentów UI.
- Szczegóły klienta i zlecenia.
- Zadania w zleceniach.
- Global search.
- Usprawnienia dostępności i testy axe.

### P2 - Produkt i skala

- Backend readiness i repozytoria API.
- Prawdziwe auth, organizacje i role.
- Monitoring, release process i środowiska.
- Raporty, SLA, automatyzacje i integracje.
- Offline sync.

## Proponowane standardy techniczne

- JavaScript powinien być formatowany automatycznie i lintowany w CI.
- CSS powinien przechodzić przez Stylelint i bazować na tokenach.
- Dynamiczny tekst użytkownika musi być escapowany albo renderowany przez bezpieczne DOM API.
- Każda operacja mutująca dane powinna przechodzić przez akcję domenową.
- Każda nowa funkcja powinna mieć test jednostkowy lub e2e, zależnie od ryzyka.
- Każda większa decyzja techniczna powinna mieć ADR.
- Każdy release powinien mieć changelog i możliwość rollbacku.

## Definition of Done dla zmian

Zmiana jest gotowa, jeśli:

- spełnia kryteria akceptacji,
- nie wprowadza regresji w istniejących przepływach,
- przechodzi lint, format, testy i build,
- ma testy adekwatne do ryzyka,
- nie pogarsza dostępności,
- nie renderuje niebezpiecznie danych użytkownika,
- jest zgodna z istniejącą strukturą projektu,
- aktualizuje dokumentację, jeśli zmienia zachowanie, komendy lub architekturę.

## Ryzyka projektowe

- Zbyt szybkie dokładanie funkcji bez testów zwiększy koszt każdej kolejnej zmiany.
- Pozostawienie `innerHTML` dla danych użytkownika bez hardeningu stworzy ryzyko XSS.
- Brak migracji `localStorage` utrudni rozwój modelu danych.
- Ręcznie utrzymywana lista cache service workera będzie łatwa do zepsucia.
- Brak decyzji o backendzie i auth może spowodować kosztowny refactor, jeśli widoki zostaną mocno związane z `localStorage`.
- Zbyt wczesna migracja do dużego frameworka może spowolnić projekt, jeśli nie będzie wynikała z realnych potrzeb.

## Rekomendowana strategia seniorska

Najrozsądniejsza droga to ewolucja, nie rewolucja. Obecny projekt ma wystarczająco prostą strukturę, aby najpierw wzmocnić go testami, walidacją, bezpiecznym renderowaniem i lepszym podziałem odpowiedzialności. Dopiero po tym warto decydować, czy aplikacja potrzebuje większej zmiany technologicznej, np. TypeScriptu, Vite albo frameworka komponentowego.

W pierwszej kolejności należy chronić istniejące zachowanie testami i ustalić granice architektury. Następnie można rozbudowywać domenę: klienci, zlecenia, zadania, kalendarz i dashboard. Dzięki temu projekt będzie rósł jako profesjonalny produkt, a nie jako zbiór kolejnych skryptów dopisywanych do widoków.
