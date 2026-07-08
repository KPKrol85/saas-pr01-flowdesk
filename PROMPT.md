# PROMPT - CODEX

You are a senior product-minded frontend developer working on the FlowDesk project.

## PROJECT CONTEXT

FlowDesk is a standalone frontend-only SaaS-style Service Management Dashboard demo located at:

`C:\Users\KPKro\MY FILES\repos\saas-pr01-flowdesk`

The project uses HTML, CSS, Vanilla JavaScript ES Modules, hash routing, demo authentication, localStorage demo persistence through repository boundaries, PWA files, tests, documentation, generated/minified build outputs, and a lightweight UI component system.

The current product-readiness roadmap is documented in:

`PRODUCT-READINESS-plan.md`

This task implements product-readiness roadmap point 5 only:

`5. Import, Export, Reset, And Data Recovery UX`

Roadmap point 5 has:

* Priority: High
* Risk Level: Medium
* Recommended Task Type: UX/content polish, frontend implementation, tests

Roadmap points 1, 2, 3, and 4 should already be marked as Done. Preserve those statuses.

The goal of this task is to make demo data management safer, clearer, and easier to trust during a public demo.

FlowDesk must remain clearly positioned as a frontend-only SaaS demo. Do not add real backup, backend persistence, cloud sync, API calls, real authentication, database functionality, billing, or external storage.

## TASK OBJECTIVE

Audit and refine FlowDesk’s demo data management UX.

Focus on these flows:

* JSON export
* validated JSON import
* malformed JSON import rejection
* invalid schema import rejection
* missing relationship import rejection or recovery
* reset demo data
* localStorage recovery
* storage-unavailable mode
* confirmation and cancellation paths for destructive or high-impact data actions

The goal is to make export, import, reset, and recovery flows understandable, safe, confirmable, and trustworthy for demo users.

Invalid data must never silently corrupt the local demo state.

This task may include targeted UX copy improvements, small frontend flow improvements, and focused tests.

Do not redesign the settings page.
Do not rewrite the persistence layer.
Do not change the data architecture.
Do not implement real backup, cloud sync, backend persistence, or production storage.

## IMPLEMENTATION PLAN

1. Inspect the current project context before editing:

   * `git status --short`
   * `PRODUCT-READINESS-plan.md`
   * `README.md`
   * `docs/definition-of-done.md`
   * `docs/architecture.md`
   * `docs/api-contracts.md` if present
   * `docs/backend-readiness.md` if present
   * `js/views/settingsView.js`
   * relevant settings-related components in `js/components/`
   * `js/core/actions.js`
   * `js/core/store.js`
   * `js/core/persistence.js`
   * `js/repositories/localStorageRepositoryAdapter.js`
   * `js/domain/migrations.js`
   * `js/domain/validators.js`
   * relevant storage helpers in `js/utils/`
   * `js/main.js` if it handles storage-unavailable or recovery messaging
   * existing unit tests
   * existing integration tests
   * existing e2e tests for settings, export, import, reset, and recovery flows

2. Confirm roadmap scope:

   * inspect `PRODUCT-READINESS-plan.md`
   * verify this task addresses point 5 only
   * preserve point 1 Done status
   * preserve point 2 Done status
   * preserve point 3 Done status
   * preserve point 4 Done status
   * do not mark points 6-10 as Done
   * do not implement roadmap points 6-10

3. Audit the current data management UX.

   Check:

   * whether export clearly communicates that it downloads local demo JSON
   * whether import clearly warns that local demo data will be replaced
   * whether reset clearly explains that seeded demo data will be restored
   * whether malformed JSON gives useful feedback
   * whether invalid schemas give useful feedback
   * whether missing relationships are rejected, recovered, or reported clearly
   * whether localStorage recovery paths provide understandable feedback
   * whether storage-unavailable mode explains that demo data will not persist
   * whether destructive or high-impact actions are confirmable and cancellable
   * whether toasts are concise, useful, and not overly technical
   * whether settings copy sounds like product UX, not internal implementation notes

4. Identify only issues directly related to point 5.

   Examples of valid issues:

   * export label does not explain what is being exported
   * import warning is too vague
   * reset confirmation does not explain the consequence
   * malformed JSON error is too technical or unclear
   * invalid import failure is silent or confusing
   * recovery message exposes too much internal implementation language
   * cancel path does not reassure that no data changed
   * successful import/reset/export feedback is unclear
   * e2e coverage does not protect import/export/reset behavior

   Examples of out-of-scope issues:

   * full settings redesign
   * new backup system
   * cloud sync
   * backend persistence
   * account sync
   * billing
   * new storage adapter
   * schema redesign
   * import/export format redesign unrelated to UX safety
   * broad validation rewrite
   * empty-state pass across the whole app

5. Improve settings data-management UX where needed.

   Allowed changes may include:

   * clearer export copy
   * clearer import copy
   * clearer reset copy
   * clearer confirmation dialog text
   * clearer cancel/error/success feedback
   * clearer storage-unavailable message
   * clearer local demo data explanation
   * small helper text improvements
   * small toast copy improvements
   * small focus or accessibility fixes directly related to these flows

   Keep changes targeted and review-friendly.

6. Preserve validation, migrations, recovery, and repository boundaries.

   Do not weaken:

   * JSON validation
   * schema validation
   * migration behavior
   * localStorage recovery behavior
   * repository result handling
   * safe rendering
   * import rejection paths

   If a real bug is found where invalid import data can corrupt state, fix it with the smallest safe change and add focused tests.

7. Preserve destructive-action safety.

   Ensure high-impact actions use existing confirmation patterns where appropriate:

   * import replacing demo data
   * reset demo data
   * any recovery or overwrite path if exposed to users

   Confirm dialogs should be clear, cancellable, and consistent with existing FlowDesk patterns.

8. Preserve architecture and product behavior:

   * keep existing hash routes
   * keep existing localStorage adapter model
   * keep existing repository boundaries
   * keep existing store/action patterns
   * keep existing migrations and validators unless a directly related bug requires a minimal fix
   * keep existing PWA strategy
   * keep existing demo auth behavior
   * keep settings structure recognizable
   * do not add new features outside this roadmap point

9. Update tests.

   Add or update focused tests if needed.

   Prioritize:

   * unit tests for malformed JSON, invalid schema, missing relationship, migration, or recovery behavior if touched
   * integration tests for import/export/reset settings behavior if available
   * e2e tests for import/export/reset flows
   * a11y tests if labels, headings, dialogs, buttons, helper text, focus behavior, or accessible names change

   Keep tests focused on data-management UX safety.

10. Refresh generated files through scripts only if runtime files change:

* run `npm run build`
* run `npm run pwa:check`

Do not manually edit generated or minified files.

11. Update `PRODUCT-READINESS-plan.md` only for point 5:

* add a short `Status: Done` note under point 5 after the work is complete
* summarize what was audited and improved
* do not mark points 6-10 as Done
* preserve point 1 Done status
* preserve point 2 Done status
* preserve point 3 Done status
* preserve point 4 Done status

12. Run verification:

* `npm run test:unit`
* `npm run test:integration`
* run targeted e2e tests for import/export/reset flows if the test setup supports targeted execution
* otherwise run `npm run test:e2e`
* `npm run test:a11y` if settings UI, dialogs, labels, helper text, focus behavior, or accessible names changed
* `npm run build` if runtime source files changed
* `npm run pwa:check` if runtime source files changed
* `npm run lint`
* `git diff --check`

13. Keep the final diff review-friendly:

* small settings UX/copy improvements
* small import/export/reset flow improvements if needed
* minimal validation/recovery fixes only if a direct bug is found
* minimal test updates
* generated files only if produced by build scripts
* `PRODUCT-READINESS-plan.md` point 5 status update only
* no unrelated cleanup

## CONSTRAINTS

* Implement product-readiness roadmap point 5 only.
* Keep this task focused on import, export, reset, and data recovery UX.
* Do not implement roadmap points 6-10.
* Do not redesign the settings page.
* Do not redesign the application shell.
* Do not change architecture.
* Do not change routing.
* Do not change data models unless a directly related validation/recovery bug requires a minimal safe fix and is clearly justified.
* Do not change seed data unless directly required by a focused test fixture and clearly justified.
* Do not rewrite store architecture.
* Do not rewrite actions.
* Do not rewrite repositories.
* Do not rewrite persistence.
* Do not replace the localStorage adapter.
* Do not weaken validators.
* Do not weaken migrations.
* Do not weaken localStorage recovery rules.
* Do not silently accept malformed JSON.
* Do not silently accept invalid schemas.
* Do not silently corrupt local demo state.
* Do not add backend functionality.
* Do not add real authentication.
* Do not add database functionality.
* Do not add API requests.
* Do not add cloud sync.
* Do not add real backup.
* Do not add billing or monetization implementation.
* Do not add new dependencies.
* Do not introduce broad refactors.
* Do not manually edit generated or minified files.
* Do not manually edit `service-worker-assets.js`.
* Do not mark product-readiness roadmap points 6-10 as Done.
* Preserve point 1 Done status.
* Preserve point 2 Done status.
* Preserve point 3 Done status.
* Preserve point 4 Done status.
* Preserve completed UI polish work.
* Preserve accessibility, PWA, performance, safe rendering, reduced motion, and test guardrails.

## TECHNICAL RULES

* Use existing FlowDesk components and patterns.
* Use existing settings view patterns.
* Use existing modal, confirm dialog, toast, form, and button conventions.
* Use product-focused copy rather than implementation-heavy copy.
* Keep export wording clear: data is local demo JSON.
* Keep import wording clear: local demo data may be replaced after validation.
* Keep reset wording clear: seeded demo data will be restored.
* Keep recovery wording clear without exposing unnecessary internals.
* Keep malformed JSON and invalid schema feedback understandable.
* Keep destructive actions confirmable and cancellable.
* Keep success feedback concise and visible.
* Preserve keyboard accessibility.
* Preserve focus management.
* Preserve Escape behavior.
* Preserve reduced motion behavior.
* Preserve safe rendering expectations.
* Preserve existing localStorage recovery behavior.
* Preserve existing validation and migration expectations.
* Keep test changes minimal and directly tied to data-management UX.
* Keep generated and minified files synchronized only through project scripts.

## OUTPUT EXPECTATION

Return a concise summary with:

* files inspected
* files changed
* confirmation that product-readiness roadmap point 5 was the only point addressed
* import/export/reset/recovery issues found
* UX and copy improvements made
* validation or recovery fixes made, if any
* confirmation that malformed JSON and invalid schema paths remain safe
* confirmation that destructive actions remain confirmable and cancellable
* confirmation that roadmap points 6-10 were not implemented
* confirmation that architecture, routing, data models, store architecture, repositories, persistence, auth behavior, validators, migrations, localStorage recovery, PWA strategy, and product workflows were preserved
* `PRODUCT-READINESS-plan.md` point 5 status update
* tests added or updated, if any
* generated files refreshed, if any
* verification commands run and their results
* any limitations or follow-up notes

Do not include unrelated recommendations.
