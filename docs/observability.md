# FlowDesk observability readiness

## Current state

FlowDesk ma lekką warstwę observability readiness w `js/core/observability.js`. Moduł działa lokalnie, bez zewnętrznych providerów, tokenów, DSN, analytics i requestów sieciowych.

## API

```js
initObservability();
captureError(error, context);
captureMessage(message, context);
```

Moduł:

- rejestruje `window.error`,
- rejestruje `window.unhandledrejection`,
- normalizuje błędy i wiadomości,
- sanitizuje kontekst,
- trzyma krótki in-memory buffer,
- pozwala w przyszłości podpiąć adapter produkcyjnego providera.

## Data policy

Nie wolno zbierać:

- haseł,
- tokenów,
- sekretów,
- adresów email,
- numerów telefonu,
- pełnych payloadów formularzy,
- notatek, komentarzy i treści użytkownika,
- danych organizacji w pełnej postaci.

Kontekst błędu jest traktowany jako potencjalnie wrażliwy. Klucze wyglądające na dane osobowe lub payloady są redagowane jako `[redacted]`.

## Production adapter

Przyszły adapter produkcyjny powinien być podpięty przez `initObservability({ reporter })`.

Adapter powinien:

- wysyłać tylko zsanityzowane eventy,
- mieć kontrolę sampling/rate limit,
- działać po consent i zgodnie z polityką prywatności,
- obsługiwać awarie bez wpływu na aplikację,
- korelować eventy z backendowym `requestId`, jeśli API będzie dostępne.

## What this does not solve

Ten moduł nie zastępuje:

- logów backendowych,
- monitoringu API,
- audit logów,
- alertingu produkcyjnego,
- RUM z pełnymi metrykami,
- diagnostyki bezpieczeństwa.

Jest tylko bezpiecznym frontendowym kontraktem gotowościowym.
