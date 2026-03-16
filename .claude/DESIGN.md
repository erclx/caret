# Design

> Minimal & invisible. Renders on top of other tools — must never compete with them visually.

## General rules

All UI text uses sentence case — never title case. Proper nouns and product names retain their casing.

## Personality

**Utilitarian. Sharp. Out of the way.** If the user notices the design, we've failed.

## Color

No accent. Mono zinc scale only. These override shadcn's default HSL variables in `index.css` — not a separate token system. Two palettes switched via `prefers-color-scheme`.

| Token            | Light                | Dark                       | Usage                         |
| ---------------- | -------------------- | -------------------------- | ----------------------------- |
| `--background`   | `zinc-50` (#fafafa)  | `240 4% 15%` (#222226)     | Popup, sidepanel, dropdown bg |
| `--surface`      | `white` (#ffffff)    | `240 3.7% 15.9%` (#27272a) | Cards, input bg               |
| `--border`       | `zinc-200` (#e4e4e7) | `240 3.7% 25%` (#3a3a42)   | All borders                   |
| `--text-primary` | `zinc-900` (#18181b) | `zinc-50` (#fafafa)        | Body text, prompt names       |
| `--text-muted`   | `zinc-500` (#71717a) | `zinc-400` (#a1a1aa)       | Preview text, hints, labels   |
| `--selected`     | `zinc-100` (#f4f4f5) | `240 3.7% 22%` (#333338)   | Dropdown selected row, hover  |
| `--destructive`  | `red-600` (#dc2626)  | `0 72% 51%` (#e03131)      | Delete, error                 |

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

> Keyboard hint footer text: `↑↓ navigate · Enter/Tab insert · Esc close`

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

- Width: matches input element exactly
- Max height: 280px, then scrollable (rows are ~48px with two-line name + preview layout)
- Row: `[name label] ··· [preview muted, truncated 1 line]`
- Selected state: `--selected` bg only, no border or left bar
- No search input inside dropdown — filtering happens by typing after the trigger symbol in the chat input (intentional)
- Footer hint: `↑↓ navigate · Enter/Tab insert · Esc close`, `hint` size, `--text-muted`
- Empty state: `"No prompts yet - click the extension icon to add one"`

### Popup

> Dormant — extension icon now opens the sidepanel. Popup kept for rollback only.

### Sidepanel

- Width: ~380px (user-resizable)
- Same components as popup, wider layout shows name + preview per row
- Edit view: full list replacement, `← Back` top-left, no modal
- Tab bar: `[Prompts] [GitHub]` — plain text tabs, `--border` bottom, selected tab uses `--text-primary`, unselected uses `--text-muted`

### Sidepanel — GitHub Sync View

- Connection indicator: 8px filled circle driven by `connectionHealth` in settings — `green-500` connected (or absent, fallback) / `red-500` error / `zinc-400` not configured; inline with repo name in `--text-muted`
- Status line: `hint` size, `--text-muted` — e.g. "Synced just now · 8 snippets", "Up to date · 8 snippets" (transient, after a no-change sync), or "Never synced"
- Sync button: standard outline button, full width, lucide `RefreshCw` icon 16px left of label
- Diff list: monospace slug names, `body` size; prefix symbols `+` in `green-600`/`green-400`, `~` in `zinc-500`, `-` in `--destructive`; "N unchanged" in `--text-muted` below list
- Apply button: `--text-primary` on `--surface`, shows count inline e.g. "Apply 3 changes"
- Not configured state: replace sync button with `"Set up in Options →"` link, `--text-muted`

### Options Page

- Max width: 640px, centered
- Section headers: `heading` size, `--text-foreground`, sentence case — deliberately full contrast (not muted) to create clear hierarchy against the muted description text below
- Toggles: shadcn Switch, zinc only (no accent color)

### Options Page — GitHub Sync Section

- PAT input: `type="password"`, masked after save, full width
- Repository and Branch fields: side by side, equal width
- Snippets path field: full width, placeholder `snippets`
- Save button: standard outline, left-aligned
- Connection status: inline right of Save — 8px dot + short label ("Connected" / "Not configured" / "Error"), `hint` size
- No inline validation on PAT format — only show error state after a failed save attempt
- Field labels have a `HelpCircle` icon (16px, `--text-muted`) that shows a tooltip on hover; tooltip styled zinc-800/zinc-700 via `className` override at usage site; `TooltipPrimitive.Arrow` is removed from the shared `tooltip.tsx` component (no arrow anywhere)
- PAT field has a "Create a token on GitHub →" link below the input, `--text-muted`, opens in new tab
- Repository field accepts `owner/repo` combined input and parses into separate `owner` and `repo` fields on change
- Disconnect button: shown below the save footer only when GitHub is configured; outline style, `--destructive` text, no confirmation; hint below: "Your synced prompts will not be removed."

## Iconography

lucide-react, 16px, stroke 1.5px, `currentColor`. No filled icons. No custom icons for MVP.
