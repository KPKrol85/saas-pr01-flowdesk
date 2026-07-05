# FlowDesk Design System

## Purpose

FlowDesk uses a lightweight component system built with Vanilla JavaScript ES Modules. Components return safe HTML strings and use `escapeHTML` / `escapeAttribute` for dynamic values. The goal is predictable UI composition without adding a frontend framework.

## Tokens

Tokens live in `css/tokens.css` and are the source for UI styling.

### Colors

- `--bg`, `--bg-elev`, `--bg-glass`: page, elevated surfaces, and translucent topbar surfaces
- `--text`, `--text-muted`: primary and secondary text
- `--border`: low-contrast structural borders
- `--primary`, `--primary-strong`: primary actions and focus color
- `--success`, `--warning`, `--danger`, `--info`: semantic badges, destructive actions, and feedback states

Themes are exposed through `.theme-light` and `.theme-dark` on `body`.

### Spacing

Spacing uses the `--space-*` scale from `2` to `64`. Components should use existing tokens instead of one-off pixel values.

### Radius

- `--radius-8`: compact elements
- `--radius-12`: buttons, inputs, list items
- `--radius-16`: cards and modal surfaces
- `--radius-pill`: badges

### Shadows

- `--shadow-sm`: cards and primary buttons
- `--shadow-md`: dropdowns and toasts
- `--shadow-lg`: modal and drawer surfaces

### Typography

The font family is `--font-sans` with the local Inter font files. Font sizes use `--fs-12` through `--fs-28`.

### Breakpoints

- `--bp-480`: small mobile refinements
- `--bp-700`: tablet layout split
- `--bp-1024`: desktop shell and multi-column views
- `--bp-1280`: wide desktop spacing

## Components

- `button({ label, variant, iconName, iconOnly, attributes })`: button HTML with optional internal SVG icon
- `inputField`, `selectField`, `textareaField`, `setFieldError`: accessible form controls with labels, helper text, errors, `aria-describedby`, and synchronized `aria-invalid`
- `pageHeader({ title, description, actions, eyebrow })`: standard page heading block
- `emptyState({ title, description, action, iconName })`: consistent empty-state block
- `openConfirmDialog({ title, message, confirmLabel, cancelLabel, destructive, onConfirm })`: modal-backed destructive confirmation
- `icon(name, options)`: fixed local SVG icon dictionary, decorative by default
- `openModal`, `createDrawer`, `showToast`, `renderTable`: existing primitives kept small and framework-free

## Naming

CSS follows the current BEM-like naming:

- blocks: `.btn`, `.input`, `.page-header`, `.empty-state`
- elements: `.input__label`, `.page-header__actions`
- modifiers: `.btn--primary`, `.btn--danger`, `.input__field--error`

Keep new components small, accessible by default, and backed by tokens instead of bespoke styles.
