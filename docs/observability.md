# FlowDesk observability readiness

## Status i odpowiedzialność dokumentu

Ten dokument opisuje aktualny lokalny kontrakt telemetryczny oraz proponowaną
granicę przyszłego monitoringu. Nie wybiera providera, nie dodaje DSN, tokenów,
analytics ani requestów sieciowych.

Architektura request correlation i audit jest skoordynowana z
[`backend-readiness.md`](backend-readiness.md) oraz
[`api-contracts.md`](api-contracts.md). Nierozstrzygnięte wybory są utrzymywane w
[`future-saas-readiness.md`](future-saas-readiness.md).

## Aktualny frontend

`js/core/observability.js` udostępnia:

```js
initObservability();
captureError(error, context);
captureMessage(message, context);
```

Moduł:

- rejestruje `window.error` i `window.unhandledrejection`,
- normalizuje błędy i wiadomości,
- sanitizuje kontekst,
- trzyma maksymalnie 25 zdarzeń in-memory,
- pozwala w przyszłości podpiąć `reporter`,
- nie wykonuje requestów i nie stanowi produkcyjnego monitoringu.

Store, repozytoria i demo auth nie emitują dziś request telemetry ani domain
events. In-memory buffer znika po odświeżeniu strony.

## Rozdzielenie odpowiedzialności

| Warstwa                  | Cel                                      | Autorytatywne miejsce       | Retencja i dostęp               |
| ------------------------ | ---------------------------------------- | --------------------------- | ------------------------------- |
| frontend error telemetry | diagnoza błędów UI i wydajności klienta  | przyszły monitoring adapter | Deferred privacy/consent policy |
| backend operational logs | stan API, latency, failures i zależności | infrastruktura usługi       | operacyjna, nie audytowa        |
| metrics i alerts         | wykrywanie degradacji i naruszeń SLO     | monitoring provider         | Deferred owner/budget policy    |
| security audit log       | accountability dla zmian i odmów         | osobny audit store          | odrębna, zatwierdzona retencja  |
| UI activity/history      | kontekst produktu widoczny użytkownikowi | domain data                 | nie zastępuje audytu            |

Operational log nie może być używany jako niezmienny audit record. Audit event
nie powinien przechowywać debug payloadów ani stack traces.

## Request correlation

Proposed flow:

1. API gateway albo backend tworzy lub normalizuje canonical `requestId`.
2. Ten sam identyfikator trafia do response header `X-Request-ID` i
   `meta.requestId`.
3. Backend propaguje go do structured logs, error reports i powiązanych audit
   events.
4. Frontend zachowuje `requestId` przy mapowaniu błędu API i może przekazać go
   do zsanityzowanego `captureError`/`captureMessage`.
5. UI może pokazać krótki support reference, ale nie ujawnia stack trace ani
   wewnętrznych identyfikatorów infrastruktury.

Client-generated correlation value jest niezaufane i nie zastępuje canonical
server request ID. Distributed tracing (`traceparent`) może zostać dodany po
wyborze infrastruktury, ale nie jest zatwierdzony w tym zadaniu.

## Structured server logs

Proposed allowlist pól:

- timestamp, level, service, environment i release,
- canonical `requestId`, route template, method, status i latency,
- bezpieczny error code oraz dependency name/status,
- pseudonymous actor/organization identifiers tylko, gdy polityka prywatności
  na to pozwala,
- retry count, idempotency outcome i revision-conflict category bez payloadu.

Nie wolno logować:

- haseł, tokenów, cookies, authorization headers ani sekretów,
- adresów email, numerów telefonu i pełnych nazw bez zatwierdzonej potrzeby,
- pełnych formularzy, importów i response bodies,
- notatek, komentarzy, treści użytkownika i danych organizacji,
- surowych query strings, jeśli mogą zawierać dane użytkownika,
- danych z innego tenanta w komunikacie błędu.

Redaction musi działać przed wysłaniem eventu do providera. Provider-side
scrubbing jest drugą linią ochrony, nie jedyną.

## Frontend production adapter

Przyszły adapter może zostać wstrzyknięty przez
`initObservability({ reporter })`, ale wymaga osobnego zadania. Powinien:

- otrzymywać wyłącznie zsanityzowane eventy,
- obsługiwać sampling, rate limit i backpressure,
- nie blokować renderowania ani działania aplikacji,
- bezpiecznie ignorować własne awarie,
- dołączać release/environment i request ID bez PII,
- działać zgodnie z consent, privacy i data-region policy,
- nie przechwytywać automatycznie payloadów, DOM snapshots ani user input bez
  jawnej zgody i review.

## Backend monitoring boundary

Przyszły backend powinien zapewnić provider-neutral adapters dla logów, metrics
i error reporting. Minimalne sygnały obejmują:

- request count, latency i error rate per route template,
- auth/session failures bez credential data,
- permission denials i cross-tenant attempts w bezpiecznej agregacji,
- storage/dependency health,
- migration i background-job status,
- idempotency conflicts i revision conflicts,
- audit-write failures jako krytyczny sygnał operacyjny.

Alerty wymagają jawnego ownera, severity, runbooku i kanału eskalacji. Ten
dokument nie ustala SLO, progów ani dyżurów.

## Dane i retencja

Frontend i backend traktują każdy telemetry context jako potencjalnie wrażliwy.
Retention musi być minimalna i niezależna od retencji audit logu. Dostęp ma być
least-privilege i rejestrowany tam, gdzie wymagają tego polityki.

Deferred owner decisions:

- monitoring/logging provider i region danych,
- privacy basis, consent oraz dozwolone actor/organization metadata,
- sampling, rate limits i koszt,
- retention, deletion i dostęp operacyjny,
- SLO, alert thresholds, runbook ownership i on-call model,
- distributed tracing oraz propagacja do zewnętrznych zależności.

## Czego ta warstwa nie rozwiązuje

Aktualny moduł oraz ten plan nie zapewniają backendowych logów, monitoringu API,
security audit, alertingu, RUM, diagnostyki bezpieczeństwa, incident response ani
produkcjnej zgodności. Są wyłącznie bezpiecznym kontraktem gotowościowym.
