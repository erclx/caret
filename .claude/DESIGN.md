# Design

> Minimal and invisible. Renders on top of other tools. Must never compete with them visually.

## Personality

**Utilitarian. Sharp. Out of the way.** If the user notices the design, we've failed.

## General rules

All UI text uses sentence case. Proper nouns and product names retain their casing.

## Color

No accent. Mono zinc scale only. Defined as shadcn HSL variable overrides in `index.css`, switched via `prefers-color-scheme`.

| Variable             | Tone                         | Usage                        |
| -------------------- | ---------------------------- | ---------------------------- |
| `--background`       | Near-white / dark charcoal   | Page and panel backgrounds   |
| `--card`             | White / slightly raised dark | Cards, input fields          |
| `--border`           | Light gray / dark gray       | All borders                  |
| `--foreground`       | Near-black / near-white      | Body text, prompt names      |
| `--muted-foreground` | Mid gray                     | Preview text, hints, labels  |
| `--accent`           | Very light gray / dim dark   | Selected row, hover state    |
| `--destructive`      | Red                          | Delete actions, error states |

Buttons use `--foreground` on `--card` with a `--border` outline. Selection is a background shift only, no color pop.

## Typography

Font: Geist. Applied explicitly to all entry point roots. Never inherits from the host page.

| Role      | Size | Weight | Usage                        |
| --------- | ---- | ------ | ---------------------------- |
| `label`   | 13px | 500    | Prompt name in dropdown row  |
| `preview` | 12px | 400    | Truncated body preview       |
| `body`    | 13px | 400    | List items, general text     |
| `heading` | 14px | 600    | Section headers              |
| `hint`    | 11px | 400    | Keyboard hints, empty states |

All sizes in `px`. Surfaces are fixed-width, so rem scaling is irrelevant.

## Spacing

Base unit is 4px. Use Tailwind's built-in scale with no custom tokens.

## Borders and shadows

All borders are 1px. No double borders.

Shadow on the dropdown only — it floats above the host page. Subtle two-layer drop shadow.

## Border radius

4px everywhere.

## Motion

None for MVP. Speed over delight for a keyboard-driven tool.

## Components

> Widths are starting points. Verify in browser.

### Dropdown

- Width matches the input element exactly
- Max height 280px, then scrollable
- Each row shows the prompt name and a one-line truncated preview
- Selected row uses accent background only, no border or left bar
- No search input inside the dropdown. The user filters by typing in the chat input after the trigger symbol.
- Keyboard hint footer in muted hint text

### Sidepanel

- Width ~380px, user-resizable
- Tab bar with plain text tabs, bottom border on the active tab
- Edit view replaces the list inline, no modal

### Sidepanel — GitHub view

- Connection indicator: 8px filled circle, green when connected, red on error. Only shown when GitHub is configured.
- When not configured, the entire view is replaced by a plain link to Options.

### Options page

- Max width 640px, centered
- Section headers use full-contrast foreground text to create hierarchy against the muted description text below
- Save button left-aligned in all section footers; feedback text pushed to the far right
- Destructive actions sit in the same footer row as Save; supplementary hints shown as tooltip on hover, not inline

### Options page — GitHub section

- PAT field: full width
- Repository and Branch fields: side by side, equal width
- Snippets path field: full width
- No inline validation on PAT format. Error shown only after a failed save attempt.
- Disconnect shown only when GitHub is configured. No confirmation dialog.

## Iconography

lucide-react, 16px, stroke 1.5px, `currentColor`. No filled icons. No custom icons for MVP.
