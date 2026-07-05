# FlowDesk Definition of Done

Zmiana jest gotowa dopiero wtedy, gdy spełnia poniższe warunki.

## Scope

- Zakres zmiany jest jasny i zgodny z zadaniem.
- Brak niepowiązanych refactorów, redesignu i zmian terminologii.
- Istniejące przepływy Service Management pozostają zachowane.
- Nowe zachowanie ma czytelne kryteria akceptacji.

## Code quality

- `npm run format` wykonane dla zmienionych plików.
- `npm run lint` przechodzi.
- Kod używa istniejących modułów, helperów i komponentów.
- Wygenerowane lub minifikowane pliki są zmieniane tylko przez skrypty.
- Brak sekretów, tokenów, DSN i produkcyjnych credentiali.

## Tests

- `npm run test:unit` przechodzi.
- `npm run test:integration` przechodzi.
- `npm run test:e2e` przechodzi, jeśli zmiana dotyka przepływu użytkownika.
- `npm run test:a11y` przechodzi, jeśli zmiana dotyka UI.
- Testy są adekwatne do ryzyka i blast radius.

## PWA and performance

- `npm run pwa:check` przechodzi po zmianach runtime.
- `npm run perf:budget` przechodzi, jeśli zmiana dotyka app-shell, CSS, JS lub assetów.
- Service worker manifest jest regenerowany przez `npm run pwa:manifest`, nie ręcznie.
- Update flow service workera pozostaje kontrolowany przez użytkownika.

## Security and accessibility

- Dane użytkownika są escapowane albo renderowane przez bezpieczne DOM API.
- Nie ma nowych miejsc wykonujących niezaufany HTML.
- Focus, semantyka i keyboard flow nie są pogorszone.
- CSP, fake auth boundaries i demo-only limitations pozostają jasne.

## Documentation

- README lub `docs/*` są zaktualizowane, jeżeli zmienia się architektura, workflow, komendy, PWA, release, security albo zachowanie produktu.
- ADR jest dodany lub zaktualizowany dla istotnej decyzji architektonicznej.
- CHANGELOG jest uzupełniony przy zmianie releasowej.

## Final gate

Przed uznaniem zmiany za gotową uruchom:

```bash
npm run check
npm run lighthouse
git diff --check
```
