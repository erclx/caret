# Design: SlashPrompt

> Minimal & invisible. Renders on top of other tools — must never compete with them visually.

## Personality

**Utilitarian. Sharp. Out of the way.** If the user notices the design, we've failed.

## Color

No accent. Mono zinc scale only. These override shadcn's default HSL variables in `index.css` — not a separate token system. Two palettes switched via `prefers-color-scheme`.

| Token            | Light                | Dark                 | Usage                         |
| ---------------- | -------------------- | -------------------- | ----------------------------- |
| `--background`   | `zinc-50` (#fafafa)  | `zinc-900` (#18181b) | Popup, sidepanel, dropdown bg |
| `--surface`      | `white` (#ffffff)    | `zinc-800` (#27272a) | Cards, input bg               |
| `--border`       | `zinc-200` (#e4e4e7) | `zinc-700` (#3f3f46) | All borders                   |
| `--text-primary` | `zinc-900` (#18181b) | `zinc-50` (#fafafa)  | Body text, prompt names       |
| `--text-muted`   | `zinc-500` (#71717a) | `zinc-400` (#a1a1aa) | Preview text, hints, labels   |
| `--selected`     | `zinc-100` (#f4f4f5) | `zinc-700` (#3f3f46) | Dropdown selected row, hover  |
| `--destructive`  | `red-600` (#dc2626)  | `red-500` (#ef4444)  | Delete, error                 |

Buttons use `--text-primary` on `--surface` with `--border` outline. Selection = background shift only, no color pop.

## Typography

**Font: Geist.** Applied explicitly to all roots (popup, sidepanel, content script shadow DOM). Never inherits from host page.

```css
font-family: 'Geist', ui-sans-serif, system-ui, sans-serif;
```

| Role      | Size | Weight | Usage                       |
| --------- | ---- | ------ | --------------------------- |
| `label`   | 13px | 500    | Prompt name in dropdown row |
| `preview` | 12px | 400    | Truncated body preview      |
| `body`    | 13px | 400    | List items, general text    |
| `heading` | 14px | 600    | Section headers             |
| `hint`    | 11px | 400    | Keyboard hints, empty state |

All sizes in `px` — surfaces are fixed-width, rem scaling irrelevant.

## Spacing

Base unit: **4px**. Use Tailwind's built-in scale (`p-1` = 4px, `p-2` = 8px, etc.) — no custom tokens needed.

## Border Radius

**4px everywhere.** Maps to shadcn's `--radius: 0.25rem`.

## Borders & Shadows

Borders: `1px solid --border`. No double borders.

Shadow: dropdown only (floats above host page).

```css
box-shadow:
  0 4px 6px -1px rgb(0 0 0 / 0.1),
  0 2px 4px -2px rgb(0 0 0 / 0.1);
```

## Motion

None for MVP. Speed > delight for a keyboard-driven tool.

## Component Notes

> Widths below are starting points — verify in browser.

### Dropdown

- Width: matches input element (min 320px, max 480px)
- Max height: 6 rows × 44px = 264px, then scrollable
- Row: `[name label] ··· [preview muted, truncated 1 line]`
- Selected state: `--selected` bg only, no border or left bar
- Search input: borderless, `--surface` bg, placeholder in `--text-muted`
- Footer hint: `↑↓ navigate · Enter insert · Esc close`, `hint` size, `--text-muted`
- Empty state: `"No prompts yet — click the extension icon to add one"`

### Popup

- Width: ~320px
- Header: icon + title left, gear icon right
- List: prompt name only, full-width clickable rows
- `+ New prompt` bottom-anchored, `--text-muted` until hovered

### Sidepanel

- Width: ~380px (user-resizable)
- Same components as popup, wider layout shows name + preview per row
- Edit view: full list replacement, `← Back` top-left, no modal

### Options Page

- Max width: 640px, centered
- Section headers: `heading` size, `--text-muted`, uppercase, `letter-spacing: 0.05em`
- Toggles: shadcn Switch, zinc only (no accent color)

## Iconography

lucide-react, 16px, stroke 1.5px, `currentColor`. No filled icons. No custom icons for MVP.
