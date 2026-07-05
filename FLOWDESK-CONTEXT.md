# FlowDesk — Project Context / Memory

## 1. Project Identity

**Project name:** FlowDesk
**Project type:** SaaS-style frontend demo
**Category:** Service Management Dashboard
**Repository / local path:**
`C:\Users\KPKro\MY FILES\repos\saas-pr01-flowdesk`

FlowDesk is a frontend-only SPA demo designed as a professional portfolio project in the KP_Code ecosystem. The project represents a Service Management Dashboard for small service businesses that need a clean, modern way to manage clients, jobs/orders, calendar events, dashboard metrics, and basic application settings.

The goal of FlowDesk is not to be a real production backend application yet, but to look, feel, and behave like a polished SaaS product demo. It should present realistic workflows, structured UI, consistent design, accessible interactions, and clean frontend architecture.

---

## 2. Main Product Idea

FlowDesk is a dashboard for small service-oriented companies, for example:

- local service teams,
- maintenance businesses,
- repair companies,
- cleaning companies,
- small technical support teams,
- local agencies,
- field-service style businesses.

The app should simulate the daily operational flow of such a business:

1. User logs into the demo dashboard.
2. User sees key business metrics on the dashboard.
3. User manages clients.
4. User manages service jobs/orders.
5. User checks calendar events.
6. User adjusts demo settings.
7. Data persists locally through `localStorage`.
8. The app remains a frontend-only SaaS demo without real backend, database, payments, or real authentication.

The project should feel like a serious product prototype that could later be expanded into a real SaaS application.

---

## 3. Current Technical Scope

FlowDesk is built as a frontend-only SPA using:

- HTML,
- CSS,
- Vanilla JavaScript,
- JavaScript modules,
- localStorage,
- fake authentication,
- client-side routing,
- seeded demo data,
- PWA-related files.

The project should remain lightweight and framework-free unless a future decision explicitly changes that direction.

The current project should focus on professional frontend quality, not backend development.

---

## 4. Core Features

### 4.1 Fake Authentication

FlowDesk includes fake auth functionality for demo purposes.

Expected behavior:

- login form,
- form validation,
- fake user session stored locally,
- route guard for protected app views,
- logout action,
- no real authentication,
- no real user accounts,
- no backend API.

Authentication should be clearly treated as demo-only.

---

### 4.2 App Routing

FlowDesk works as a client-side SPA.

Expected routes / app sections may include:

- login,
- dashboard,
- clients,
- jobs / orders,
- calendar,
- settings.

The app should protect dashboard routes behind fake auth. If the user is not logged in, protected routes should redirect to login or show a safe fallback.

Routing should remain clear, predictable, and easy to extend.

---

### 4.3 Dashboard

The dashboard is the main overview screen.

It should include:

- KPI cards,
- recent jobs/orders,
- quick actions,
- operational summaries,
- clean SaaS layout,
- realistic demo data.

The dashboard should immediately communicate what the app is for.

Possible KPI examples:

- active clients,
- open jobs,
- completed jobs,
- revenue simulation,
- upcoming appointments,
- urgent tasks.

The dashboard should avoid fake complexity but still feel realistic.

---

### 4.4 Clients Module

The clients module should allow the user to manage demo clients.

Expected features:

- client list,
- filtering,
- sorting,
- create client,
- edit client,
- delete client,
- view client details,
- localStorage persistence.

Client records may include fields such as:

- name,
- company,
- email,
- phone,
- address,
- status,
- notes,
- last activity,
- assigned jobs.

All client actions should be demo-safe and local-only.

---

### 4.5 Jobs / Orders Module

The jobs or orders module represents service work handled by the business.

Expected features:

- jobs/orders list,
- status filtering,
- create job/order,
- edit job/order,
- delete job/order,
- view job/order details,
- localStorage persistence.

Example statuses:

- new,
- scheduled,
- in progress,
- completed,
- cancelled,
- urgent.

Job/order records may include:

- title,
- client,
- service type,
- status,
- priority,
- date,
- assigned person/team,
- notes,
- estimated value.

This module is one of the most important parts of the project because it shows the operational SaaS workflow.

---

### 4.6 Calendar Module

The calendar module should present scheduled events, appointments, or service jobs.

Expected features:

- list or calendar-like view,
- upcoming events,
- event details,
- add/edit/delete event if implemented,
- connection to jobs/orders if possible,
- localStorage persistence.

The calendar does not need to be a full advanced calendar engine. It should be practical, readable, and visually consistent with the rest of the app.

---

### 4.7 Settings Module

The settings module should contain demo-friendly user options.

Possible settings:

- theme switcher,
- reduced motion preference,
- compact mode,
- JSON export,
- data reset,
- demo account information.

Settings should make the app feel more like a real SaaS product.

The reset function should safely reset demo data without breaking navigation or leaving the app in an inconsistent state.

---

### 4.8 Data Layer

FlowDesk uses seeded demo data and localStorage.

Expected structure:

- seed data stored in a dedicated file such as `js/data/seed.js`,
- localStorage used for persistence,
- CRUD actions update local state,
- app can reset to seeded demo state,
- no external database,
- no backend,
- no real API.

The data layer should be predictable, readable, and easy to extend.

---

### 4.9 PWA Support

FlowDesk includes or should include PWA-related files.

Expected elements:

- `manifest.webmanifest` or equivalent manifest file,
- service worker,
- offline fallback,
- app icons if available,
- safe caching strategy.

The PWA setup should not overcomplicate the project. It should demonstrate professional awareness of offline behavior and installable app basics.

---

## 5. Accessibility Requirements

FlowDesk should be treated as a professional portfolio-level frontend project, so accessibility matters.

Important accessibility expectations:

- skip link,
- visible focus states,
- `focus-visible` styling,
- keyboard navigation,
- Escape handling for dialogs, drawers, and menus,
- ARIA labels where useful,
- accessible form labels and error messages,
- correct button/link semantics,
- sufficient color contrast,
- reduced motion support,
- no keyboard traps,
- modals/drawers should manage focus correctly,
- live regions for important UI updates if needed.

Accessibility should be improved methodically, not randomly.

---

## 6. UI / Design Direction

FlowDesk should look like a clean, modern SaaS dashboard.

Preferred visual direction:

- premium minimal UI,
- calm professional colors,
- clear spacing,
- card-based dashboard,
- readable tables/lists,
- polished forms,
- strong mobile behavior,
- consistent buttons,
- consistent panels,
- good empty states,
- realistic product feel.

The design should feel closer to a serious SaaS demo than a simple school exercise.

Good inspiration style:

- Linear-like clarity,
- Stripe-like polish,
- Apple-like spacing and restraint,
- modern admin dashboard patterns.

The UI should not become overloaded, flashy, or chaotic.

---

## 7. CSS / Architecture Preferences

The project should follow clean CSS structure and naming.

Preferred rules:

- mobile-first CSS,
- BEM-like class naming,
- avoid styling by IDs unless absolutely necessary,
- IDs should mostly be used as JavaScript hooks or accessibility anchors,
- reusable components,
- design tokens,
- consistent spacing scale,
- consistent typography scale,
- clean responsive breakpoints,
- no random one-off styles,
- avoid unnecessary inline styles in JavaScript,
- avoid broad global selectors that accidentally affect unrelated sections.

Preferred breakpoint logic:

- base mobile styles first,
- `480px` for wider mobile / small cards,
- `760px` for tablet layouts,
- `1024px` or `1025px` for desktop layout decisions.

---

## 8. JavaScript Preferences

JavaScript should remain readable, modular, and maintainable.

Expected approach:

- Vanilla JavaScript,
- ES modules where possible,
- clear separation between data, views, components, utilities, and routing,
- no unnecessary framework,
- no overengineering,
- no large rewrites without a clear reason,
- safe DOM rendering,
- avoid duplicated logic,
- clear event handling,
- forms should validate before saving,
- localStorage operations should be centralized where possible.

The project should feel like a frontend engineer’s portfolio piece, not a random script collection.

---

## 9. Known Build / Tooling Context

Earlier FlowDesk tooling included scripts such as:

- local dev with `serve`,
- CSS build/minification with PostCSS and cssnano,
- JS minification with terser,
- image optimization tooling.

Important note:

For this demo project, image optimization tooling was previously considered removable for now. The optimizer/tooling can be rebuilt later when the project needs it. Current work should not get blocked by image optimizer issues.

Do not reintroduce complex tooling unless it directly supports the current task.

---

## 10. Current Project Role in KP_Code

FlowDesk belongs to the KP_Code project ecosystem as a SaaS-style portfolio/demo project.

It should eventually support Kamil’s broader goal of building a professional frontend portfolio and later moving toward real commercial programming work or his own KP_Code business activity.

FlowDesk should be treated as a serious product demo that can show:

- SPA architecture,
- dashboard UI,
- state management without a framework,
- CRUD workflows,
- accessibility awareness,
- responsive design,
- PWA basics,
- professional polish,
- product thinking.

The project should not be treated as a throwaway demo.

---

## 11. Work Style for Future Sessions

When working on FlowDesk, the preferred workflow is:

1. First understand the current project state.
2. Identify the exact area being improved.
3. Avoid chaotic broad changes.
4. Work in small, scoped steps.
5. Prepare professional prompts for Codex when needed.
6. Review Codex results carefully.
7. Commit only clear, meaningful improvements.
8. Keep the app stable after each step.

The project should be improved methodically.

No random redesigns.
No uncontrolled refactors.
No changing unrelated files without reason.
No mixing FlowDesk work with unrelated KP_Code projects.

---

## 12. PROMPT - CODEX Rules for FlowDesk

Future PROMPT - CODEX tasks should be written in a professional format.

Each prompt should include:

- project context,
- exact task,
- files or areas likely involved,
- implementation plan,
- constraints,
- quality requirements,
- testing/checklist,
- expected output from Codex.

Codex should be instructed to:

- inspect existing project structure first,
- use existing conventions,
- avoid unrelated redesign,
- avoid changing unrelated files,
- preserve current app behavior unless the task requires a change,
- improve accessibility where relevant,
- keep code readable and modular,
- respect localStorage demo architecture,
- keep the app frontend-only,
- not add backend functionality,
- not add external dependencies unless explicitly requested,
- provide a short summary of changes after finishing.

---

## 13. Things Not To Do Without Explicit Decision

Do not add:

- real backend,
- real authentication,
- payment system,
- database,
- external API integration,
- heavy framework migration,
- large design system rewrite,
- unrelated build system replacement,
- random animations,
- unnecessary dependencies.

Do not convert the project into React, Vue, Next.js, Laravel, or another stack unless this is explicitly decided later.

For now, FlowDesk remains a clean HTML/CSS/Vanilla JS SaaS demo.

---

## 14. Quality Target

FlowDesk should reach a polished portfolio-ready level.

Target quality:

- stable navigation,
- no obvious layout bugs,
- good mobile experience,
- clean desktop dashboard,
- readable data tables/cards,
- consistent UI components,
- accessible dialogs/forms/navigation,
- logical state management,
- seeded demo data,
- reliable localStorage CRUD,
- basic PWA support,
- clean README,
- clear project description,
- professional commit history.

The final version should be good enough to present in KP_Code Digital Studio as a SaaS dashboard demo.

---

## 15. Suggested Future Improvement Areas

Potential future work may include:

- full UI audit,
- accessibility audit,
- responsive layout polish,
- dashboard redesign,
- table/list component cleanup,
- forms validation improvements,
- better empty states,
- better toast notifications,
- drawer/details panel improvements,
- localStorage store cleanup,
- README update,
- smoke test checklist,
- PWA cache review,
- portfolio page integration,
- Netlify deployment polish,
- metadata and SEO improvements.

These improvements should be done one by one, not all at once.

---

## 16. Short Project Summary

FlowDesk is a frontend-only SaaS-style Service Management Dashboard for small service businesses. It uses HTML, CSS, and Vanilla JavaScript to simulate a realistic operational dashboard with fake auth, protected routes, dashboard KPIs, clients, jobs/orders, calendar, settings, localStorage CRUD, seeded data, and PWA basics.

The project should be developed as a professional KP_Code portfolio product: clean, accessible, responsive, modular, and polished. The main rule is to improve it step by step, without chaos, without unrelated rewrites, and without adding backend complexity unless a future decision explicitly changes the project direction.
