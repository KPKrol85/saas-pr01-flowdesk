# FlowDesk UI Audit

## Audit Purpose

This audit documents prioritized UI issues before any layout, styling, or interaction fixes are implemented. It supports the first roadmap item in `UI-improvements-plan.md`: UI Audit By View.

The audit is focused on professional SaaS UI polish: responsive stability, spacing, alignment, overflow, wrapping, hierarchy, component consistency, accessibility risks, keyboard flow, data readability, and optional visual refinements.

## Scope

Audited views:

- login
- dashboard
- clients
- client detail
- projects
- project detail
- calendar
- settings

Audited shell and interaction surfaces:

- topbar
- hamburger / mobile menu trigger
- sidebar
- drawer
- modal
- toast

## Methodology

- Inspected project documentation: `README.md`, `UI-improvements-plan.md`, `docs/design-system.md`, `docs/definition-of-done.md`, and `docs/architecture.md`.
- Inspected UI source structure in `css/`, `js/views/`, `js/components/`, and `js/core/`.
- Reviewed layout, component, and view implementation against FlowDesk design tokens, BEM-like naming, mobile-first breakpoints, accessibility requirements, PWA constraints, and Definition of Done.
- Attempted to run a Playwright viewport audit with a temporary static server.

The requested browser-based viewport, theme, and keyboard pass could not be completed because headless Chromium launch was blocked in the current sandbox environment. Findings below are therefore code-backed and documentation-backed, not screenshot-backed. Live verification remains required before fixing or closing UI issues.

Requested viewport targets for the follow-up visual pass:

- 360px
- 390px
- 480px
- 760px
- 1024px
- 1280px+

## Priority Legend

- P0: blocking or severe layout/accessibility issue
- P1: important responsive, usability, or visual consistency issue
- P2: polish, refinement, or non-blocking improvement
- P3: optional decorative enhancement

No P0 issue was confirmed through static inspection. A browser pass is still required before ruling out viewport-specific P0 regressions.

## Findings By View And Shell Surface

### Login

| Priority | Component  | Issue                                                                                         | Condition     | Future fix direction                                                                                             | Roadmap    |
| -------- | ---------- | --------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------- | ---------- |
| P2       | login      | Login card is functionally clear, but visual hierarchy is minimal for the product entry point | all viewports | strengthen brand cue, title/supporting copy rhythm, and submit button prominence without creating a landing page | typography |
| P2       | login form | Submit button may feel visually narrow because buttons are inline-flex by default             | mobile        | consider full-width form submit treatment within the login form only                                             | forms      |
| P2       | login      | Card padding may feel heavy on 360px if viewport height is constrained                        | 360px, 390px  | verify vertical fit and reduce mobile-only padding if needed                                                     | spacing    |

### Dashboard

| Priority | Component       | Issue                                                                                                                          | Condition                     | Future fix direction                                             | Roadmap      |
| -------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- | ---------------------------------------------------------------- | ------------ |
| P1       | dashboard lists | `.list__item` uses a single horizontal flex row; long project names plus badges can crowd or wrap awkwardly                    | 360px, 390px, 480px           | introduce mobile list stacking or constrained badge/action areas | data density |
| P2       | KPI cards       | KPI card heights and value baselines are not explicitly normalized                                                             | tablet, desktop, wide desktop | align KPI card heights and value/label rhythm                    | dashboard    |
| P2       | dashboard copy  | Mixed Polish and English labels reduce SaaS polish (`High priority open`, `Upcoming`)                                          | all themes                    | standardize operational labels while preserving product meaning  | typography   |
| P2       | dashboard grid  | Dashboard sections use consistent gaps, but visual priority between KPI, next actions, high priority, and events is still flat | desktop, wide desktop         | tune card hierarchy and section emphasis without changing data   | dashboard    |

### Clients

| Priority | Component                 | Issue                                                                                         | Condition           | Future fix direction                                                                      | Roadmap      |
| -------- | ------------------------- | --------------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------- | ------------ |
| P1       | clients table             | Mobile table relies on horizontal scrolling while row actions contain several text buttons    | 360px, 390px, 480px | evaluate mobile card rows or compact action treatment for clients                         | data density |
| P1       | client row actions        | `Szczegóły`, `Edytuj`, and `Archiwizuj` can create wide action clusters                       | mobile, tablet      | group secondary row actions or move destructive actions behind a confirm flow/action menu | data density |
| P2       | clients filters           | Three filters inside `form-grid--two` can create an uneven two-column rhythm at tablet widths | 760px               | define filter toolbar behavior for 2 or 3 controls                                        | spacing      |
| P2       | client preview side panel | Preview panel appears after the table on mobile and can feel detached from the selected row   | mobile              | verify order and consider clearer selected-row state or mobile detail affordance          | data density |

### Client Detail

| Priority | Component         | Issue                                                                                                               | Condition             | Future fix direction                                                | Roadmap      |
| -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------- | ------------ |
| P1       | related records   | `.list__item` rows with long client/project/event metadata can crowd badges on small widths                         | 360px, 390px          | stack metadata and badges on mobile                                 | data density |
| P2       | detail cards      | Detail grid has consistent cards but similar visual weight across profile, contacts, projects, events, and timeline | desktop, wide desktop | strengthen primary profile card hierarchy and secondary card rhythm | typography   |
| P2       | tags and metadata | Tags and helper metadata use existing badges/helpers but may need contrast spot checks in dark theme                | dark theme            | verify status/tag readability and adjust token usage if needed      | typography   |

### Projects

| Priority | Component           | Issue                                                                                                             | Condition           | Future fix direction                                                                 | Roadmap      |
| -------- | ------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------ | ------------ |
| P1       | projects kanban     | Kanban stacks four status columns vertically on mobile, producing a long scan path                                | 360px, 390px, 480px | consider mobile status segmentation, collapsible columns, or clearer section anchors | data density |
| P1       | kanban card actions | Edit/archive/restore actions can wrap or dominate compact cards                                                   | mobile, tablet      | compact card actions and separate destructive action hierarchy                       | data density |
| P2       | filter card         | Filter controls and add action share one card without a strong toolbar rhythm                                     | all viewports       | define a reusable filter/action toolbar pattern                                      | spacing      |
| P2       | kanban columns      | Column surfaces have consistent tokens but limited hierarchy between column title, count, cards, and empty states | desktop             | refine column header and empty state density                                         | dashboard    |

### Project Detail

| Priority | Component      | Issue                                                                                        | Condition             | Future fix direction                                                           | Roadmap    |
| -------- | -------------- | -------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------ | ---------- |
| P1       | checklist rows | Checkbox rows use `.list__item` with the checkbox pushed to the far edge                     | mobile, desktop       | improve checkbox alignment and hit area while preserving semantics             | forms      |
| P2       | detail cards   | Summary, estimate, checklist, events, comments, and history have similar visual weight       | desktop, wide desktop | clarify primary information hierarchy and secondary operational sections       | typography |
| P2       | comment form   | Comment textarea and submit action work, but form spacing should be verified in card context | mobile                | tune card-contained form rhythm if crowded                                     | forms      |
| P2       | page actions   | Back and destructive archive actions can wrap in page header                                 | 360px, 390px          | verify page-header actions and preserve destructive hierarchy on narrow widths | forms      |

### Calendar

| Priority | Component          | Issue                                                                                    | Condition      | Future fix direction                                                                  | Roadmap      |
| -------- | ------------------ | ---------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------- | ------------ |
| P1       | event list row     | Event row combines metadata, project badge, and delete action in one horizontal item     | mobile         | stack event metadata/actions and prevent badge/action crowding                        | data density |
| P1       | destructive delete | Delete event action is immediate and visually ghost-like, increasing accidental tap risk | touch devices  | consider confirm treatment or stronger destructive hierarchy in a future product task | forms        |
| P2       | calendar structure | Add action sits in a standalone card above the list, which adds vertical cost            | mobile         | consider page-header action placement or a compact toolbar                            | spacing      |
| P2       | event badge        | Long project names inside badges can reduce readability                                  | mobile, tablet | constrain badge width or switch to metadata text on small widths                      | data density |

### Settings

| Priority | Component    | Issue                                                                                       | Condition           | Future fix direction                                                  | Roadmap    |
| -------- | ------------ | ------------------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------- | ---------- |
| P1       | data tools   | Reset demo data uses a ghost button despite being destructive                               | all viewports       | apply consistent destructive action hierarchy with confirm affordance | forms      |
| P2       | profile card | Profile values are rendered as simple text blocks rather than consistent metadata rows      | desktop, dark theme | align with `meta-grid` or a settings metadata pattern                 | typography |
| P2       | preferences  | Checkbox list rows use generic `.list__item`; hit area and alignment need live verification | mobile              | verify target size and label/control alignment                        | forms      |
| P2       | import JSON  | Large textarea is useful but may dominate the settings page on mobile                       | 360px, 390px        | verify mobile height and helper/error readability                     | forms      |

### Topbar

| Priority | Component      | Issue                                                                                                           | Condition           | Future fix direction                                                              | Roadmap           |
| -------- | -------------- | --------------------------------------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------- | ----------------- |
| P1       | desktop topbar | Hamburger / mobile menu trigger is rendered in the topbar even when the desktop sidebar is visible              | 1024px+             | hide mobile menu trigger at desktop breakpoint or define explicit desktop purpose | responsive shell  |
| P1       | mobile topbar  | Search is hidden below 700px with no alternate mobile search affordance                                         | 360px, 390px, 480px | add a compact mobile search entry if global search remains key workflow           | responsive shell  |
| P2       | topbar actions | Quick add, theme, and user menu may crowd the narrow topbar                                                     | mobile              | verify tap target spacing and consider icon-only or priority treatment            | responsive shell  |
| P2       | user menu      | User menu opens on click and closes on outside click, but Escape and menu keyboard patterns are not implemented | keyboard            | add Escape close and focus return in a future accessibility task                  | microinteractions |

### Sidebar

| Priority | Component          | Issue                                                                                         | Condition           | Future fix direction                                                       | Roadmap      |
| -------- | ------------------ | --------------------------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------- | ------------ |
| P2       | sidebar navigation | Active route styling is clear, but active state relies mostly on color/background             | desktop, dark theme | verify contrast and add stronger non-color active cue if needed            | typography   |
| P2       | sidebar surface    | Sidebar uses `--bg-elev` and border but could better align with subtle surface polish roadmap | desktop             | tune surface depth only after responsive shell fixes                       | glass polish |
| P2       | nav labels         | Polish-language labels are consistent, but dashboard remains English                          | all viewports       | decide whether `Dashboard` remains product language or should be localized | typography   |

### Drawer

| Priority | Component          | Issue                                                                                                      | Condition        | Future fix direction                                         | Roadmap          |
| -------- | ------------------ | ---------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------ | ---------------- |
| P1       | drawer close state | Closing drawer via Escape or backdrop removes the open class but does not update hamburger `aria-expanded` | mobile, keyboard | centralize drawer close logic and sync invoking button state | responsive shell |
| P1       | focus return       | Drawer close logic does not return focus to the hamburger / mobile menu trigger                            | keyboard         | store invoker and restore focus after close                  | responsive shell |
| P1       | explicit close     | Drawer has no visible close button inside the panel                                                        | touch, keyboard  | add an accessible close control or clear close affordance    | responsive shell |
| P2       | drawer semantics   | Drawer panel uses `role="dialog"` and `aria-modal="true"` but lacks an accessible name                     | screen readers   | add `aria-label` or labelled heading for mobile navigation   | accessibility    |
| P2       | drawer width       | Panel width is `min(280px, 80vw)`; usable, but needs visual verification on 360px and 390px                | 360px, 390px     | verify panel width, active route visibility, and tap comfort | responsive shell |

### Modal

| Priority | Component          | Issue                                                                                          | Condition     | Future fix direction                                       | Roadmap |
| -------- | ------------------ | ---------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------- | ------- |
| P1       | modal focus return | Modal close removes the backdrop but does not restore focus to the invoking control            | keyboard      | capture invoker before open and restore focus after close  | forms   |
| P1       | modal footer       | Footer is a non-wrapping horizontal flex row                                                   | 360px, 390px  | allow wrapping or mobile full-width stacked actions        | forms   |
| P1       | modal close button | Icon close button may be below the recommended 44px touch target                               | touch devices | set stable icon-button dimensions for modal close controls | forms   |
| P2       | nested forms       | Form-heavy modals use consistent controls, but long forms may exceed comfortable mobile height | mobile        | verify scroll area, footer access, and focus path          | forms   |

### Toast

| Priority | Component       | Issue                                                                                                                  | Condition                | Future fix direction                                                     | Roadmap           |
| -------- | --------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------ | ----------------- |
| P1       | toast width     | Toast stack has fixed bottom/right offsets and no max-width rule                                                       | 360px, 390px             | constrain toast width with viewport-aware max-width and wrapping         | microinteractions |
| P2       | toast dismissal | Standard toasts auto-dismiss and have no user-controlled close affordance                                              | keyboard, reduced motion | evaluate dismiss controls for important messages only                    | microinteractions |
| P2       | action toast    | Action toast layout is horizontal and may crowd long text/action labels                                                | mobile                   | verify wrapping and action alignment before service worker update polish | microinteractions |
| P2       | live region     | Toast stack uses `role="status"` and `aria-live="polite"`, which is good; repeated rapid toasts need live verification | keyboard, screen readers | test announcement behavior during common flows                           | accessibility     |

## Dedicated Hamburger / Mobile Navigation Audit

### Result

The hamburger / mobile menu trigger is the highest-priority UI risk area found in this audit.

Confirmed from code:

- the hamburger button is rendered in the topbar for both mobile and desktop
- the drawer uses a modal-like panel with overlay, focus trap, Escape handler, and body scroll lock
- opening through the hamburger sets `aria-expanded="true"`
- closing through Escape or backdrop uses drawer-internal close logic that does not update the hamburger state
- focus is moved into the drawer on open but is not returned to the hamburger after close
- the drawer has no visible close button inside the panel

Follow-up implementation should treat this as roadmap point 2 before decorative polish.

### Required Future Checks

- visibility on 360px, 390px, 480px, 760px, 1024px, and 1280px+
- 44px tap target for hamburger and any close control
- icon optical alignment inside the button
- open and close by click, Escape, backdrop, and nav link activation
- active route visibility inside opened navigation
- synchronized `aria-expanded` on every close path
- focus return after closing
- body scroll lock release after every close path
- no horizontal overflow caused by topbar, drawer, overlay, or panel

## Responsive Findings

| Priority | Area          | Issue                                                                                            | Viewport or condition | Future fix direction                                                     | Roadmap          |
| -------- | ------------- | ------------------------------------------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------ | ---------------- |
| P1       | mobile shell  | Drawer close paths need state/focus synchronization                                              | 360px, 390px, 480px   | fix drawer state model before visual polish                              | responsive shell |
| P1       | data rows     | Shared `.list__item` flex pattern can crowd text, badges, and controls                           | mobile                | add responsive list item variants                                        | data density     |
| P1       | tables        | Clients table depends on horizontal scroll and wide action groups                                | mobile                | evaluate card or compact action pattern                                  | data density     |
| P1       | modal actions | Modal footer may not wrap on narrow screens                                                      | mobile                | add responsive footer behavior                                           | forms            |
| P2       | desktop shell | Hamburger remains visible beside desktop sidebar                                                 | 1024px+               | hide or redefine desktop hamburger behavior                              | responsive shell |
| P2       | wide desktop  | Container max-width is 1100px, which keeps content readable but may leave large empty side areas | 1280px+               | verify whether wide screens need slightly richer layout, not wider noise | spacing          |

## Accessibility And Keyboard Findings

| Priority | Area                | Issue                                                                                      | Future fix direction                                | Roadmap           |
| -------- | ------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------- | ----------------- |
| P1       | drawer              | no focus return and stale `aria-expanded` on Escape/backdrop close                         | centralize close behavior                           | responsive shell  |
| P1       | modal               | no focus return to invoking control after close                                            | add invoker tracking                                | forms             |
| P1       | destructive actions | some destructive actions use low-emphasis ghost treatment                                  | standardize destructive hierarchy and confirmations | forms             |
| P2       | user menu           | no explicit Escape close or full menu keyboard behavior                                    | add keyboard handling and focus return              | microinteractions |
| P2       | drawer              | modal navigation panel lacks accessible name                                               | add label/heading semantics                         | accessibility     |
| P2       | toast               | live region exists, but announcement and mobile wrapping require browser/a11y verification | test with keyboard and screen reader workflow       | microinteractions |

## Data Readability Findings

| Priority | Area         | Issue                                                                       | Future fix direction                                      | Roadmap      |
| -------- | ------------ | --------------------------------------------------------------------------- | --------------------------------------------------------- | ------------ |
| P1       | clients      | table rows and action clusters are dense on mobile                          | compact mobile data pattern                               | data density |
| P1       | projects     | kanban is operationally clear on desktop but long on mobile                 | mobile-specific status navigation or collapsible sections | data density |
| P1       | calendar     | event rows mix title, metadata, badge, and delete action in one row         | stack content/actions by viewport                         | data density |
| P2       | dashboard    | KPI labels and list badges need stronger hierarchy and language consistency | polish typography and labels                              | dashboard    |
| P2       | detail pages | cards share similar visual weight across primary and secondary data         | improve hierarchy and metadata rhythm                     | typography   |
| P2       | settings     | profile and data tool sections need stronger semantic grouping              | apply metadata/settings patterns                          | typography   |

## Optional Visual Polish Opportunities

| Priority | Area           | Opportunity                                                            | Timing                                   | Roadmap           |
| -------- | -------------- | ---------------------------------------------------------------------- | ---------------------------------------- | ----------------- |
| P3       | glass surfaces | refine topbar/sidebar/card elevation with existing tokens              | after responsive shell and density fixes | glass polish      |
| P3       | hover states   | tune row/card hover states to feel more interactive                    | after data density fixes                 | microinteractions |
| P3       | badges         | refine badge color and contrast consistency in dark theme              | after typography checks                  | typography        |
| P3       | dashboard      | add subtle hierarchy to make dashboard feel more like the product home | after mobile layout verification         | dashboard         |

## Recommended Next Implementation Order

1. Fix hamburger / mobile menu trigger, drawer close paths, focus return, and desktop visibility.
2. Fix mobile list/table/card density for clients, projects, calendar, and detail records.
3. Fix modal footer wrapping, modal focus return, and destructive action hierarchy.
4. Tune dashboard KPI/list hierarchy and language consistency.
5. Standardize spacing rhythm for filters, page headers, cards, and detail grids.
6. Run live responsive QA at 360px, 390px, 480px, 760px, 1024px, and 1280px+.
7. Add subtle glass/surface polish only after the responsive and accessibility issues are addressed.

## Notes And Limitations

- This task did not implement any UI fixes.
- No application code, CSS, JavaScript, HTML, tests, package files, PWA files, generated files, or GitHub Actions were edited.
- Browser-based Playwright verification was attempted but blocked by the current sandbox when launching headless Chromium.
- Light theme, dark theme, exact viewport behavior, keyboard traversal, and visual screenshots still need a live browser pass before implementation tasks are closed.
- Findings are intentionally scoped so each P1/P2 area can become a separate future CODEX task.
