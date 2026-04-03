# Design

Capture visual intent and the decisions behind it: the why behind how things look. Not a style guide, component spec, or framework reference. Update this doc when a visual decision is made or a rule changes.

What belongs:

- Tokens described as intent ("mid gray, muted text"), not computed values. Exact values live in code.
- Layout constraints and sizing rules not obvious from wireframes
- Visual rules a developer could get wrong without guidance
- Non-obvious omissions ("no motion", "no custom icons") that prevent scope creep

What does not belong:

- CSS classes, computed values, component filenames, or prop names. Those live in code.
- UX copy and interaction flows, which live in WIREFRAMES.md
- Anything that requires updating every time the code is refactored

Use tables for token systems, one row per token. Use short bullets for component rules, one decision per line. Plain English over technical notation. If a section could be removed and the developer would still build it correctly from wireframes and code alone, remove it.

> Minimal and invisible. Renders on top of other tools. Must never compete with them visually.

## Personality

Utilitarian. Sharp. Out of the way. If the user notices the design, we've failed.

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

Shadow on the dropdown only. It floats above the host page. Subtle two-layer drop shadow.

## Border radius

4px everywhere.

## Focus rings

2px ring on all interactive elements, using the `--ring` token at 50% opacity. Reduced from the shadcn default of 3px to match the overall minimal visual weight. Containers that clip with `overflow-hidden` need at least 4px of inset padding on any side where a focusable element sits flush against the boundary, or the ring is clipped.

Custom `<button>` elements that do not use a shadcn component must suppress the browser default outline and apply the project ring explicitly. Without this, the browser outline flashes before the custom ring renders.

## Motion

None. Speed over delight for a keyboard-driven tool.

## Components

> Widths are starting points. Verify in browser.

### Dropdown

- Width matches the input element exactly
- Max height 280px, then scrollable
- Each row shows the prompt name and a one-line truncated preview
- Labeled prompts render as `label · name` in the name line: label in `--muted-foreground`, separator `·` in `--muted-foreground`, name in `--foreground`. Unlabeled prompts show name only.
- Selected row uses accent background only, no border or left bar
- No search input inside the dropdown. The user filters by typing in the chat input after the trigger symbol.
- Keyboard hint footer in muted hint text. Hidden when the filtered list is empty. Showing it with nothing to select is misleading.

### Sidepanel

- Width ~380px, user-resizable
- Tab bar with plain text tabs, bottom border on the active tab
- Edit view replaces the list inline, no modal

### Sidepanel: label filter

- Shown only when at least one labeled prompt exists, hidden otherwise
- A button at the right end of the search row, labeled "Label". When filters are active, the button shows "Label · N" in full-contrast foreground text
- Button height matches the search input. Button text is `text-xs` to read as a secondary control relative to the primary search field
- Clicking opens a popover with a scrollable checkbox list: existing labels in alphabetical order, "Unlabeled" at the bottom if applicable
- A "Clear" link sits at the top of the popover, separated by a bottom border. It is always rendered (to prevent height shifts on activation) but visible only when filters are active
- Each row is fully clickable. Clicking anywhere in the row toggles the filter, not only the checkbox or label text
- Button uses `--border` border, `--muted-foreground` text when inactive, `--foreground` text when active

### Sidepanel: edit form label field

- Field label reads "Label (optional)" to communicate that the field may be left blank without a tooltip or helper text
- Case-sensitivity hint is shown in a tooltip triggered by a help icon (`HelpCircle`, 14px) placed inline next to the field label.
- Combobox behavior:
  - Focus or typing opens a dropdown of existing labels. Empty input shows all. Typed characters narrow to matching entries.
  - Arrow keys navigate the list. Enter selects the highlighted option. Escape closes without clearing the field or triggering the form's discard flow. Tab closes and moves focus to the next field.
  - Selecting from the dropdown fills the input. The user may also type a value not in the list to create a new label.
- Chevron icon: always visible at the right edge, signals the dropdown opens, non-interactive
- X button: appears when the value is non-empty, to the left of the chevron, clears on click and returns focus to the label input. Input text must not overlap either icon.
- No chips or pills below the input
- Combobox dropdown adds a `--border` ring in dark mode. The `--card` and `--background` tokens are nearly identical in dark, so the ring defines the boundary

### Sidepanel: edit form GitHub banner

- When editing a GitHub-synced prompt, a muted warning banner sits between the Back button and the Name field
- The banner explains that local edits will be overwritten on the next sync
- Uses `bg-muted` and `text-muted-foreground` to blend with the utilitarian dark/light schemes without competing with the form inputs
- Contains the 16px `Github` lucide icon aligned with the text

### Sidepanel: prompt list rows

- Labeled prompts render as `label · name` in the name line using the same color split as the dropdown: label and separator in `--muted-foreground`, name in `--foreground`.

### Sidepanel: confirmation rows

Applies to the delete confirm row in the list and the discard-changes row in the edit form.

- Container uses `--muted` background with no border in light mode. In dark mode, add a `--border` border. The muted background blends into the panel background in dark, so the border defines the box.
- Label text uses `--muted-foreground`. It is a prompt, not an alarm.
- Only the destructive action button carries red. No other element in the row uses a destructive color.
- Trash icon in list rows uses `--destructive` at 80% opacity at rest, full opacity on hover. The reduced opacity signals availability without competing with the prompt name and body that are the row's primary content.

### Sidepanel: GitHub view

- Connection indicator: 8px filled circle, green when connected, red on error. Only shown when GitHub is configured.
- When not configured, the entire view is replaced by a plain link to Options.

### Options page

- Max width 640px, centered
- Section headers use full-contrast foreground text to create hierarchy against the muted description text below
- Save button left-aligned in all section footers, feedback text pushed to the far right
- Destructive actions sit in the same footer row as Save. Supplementary hints shown as tooltip on hover, not inline

### Options page: GitHub section

- PAT field: full width
- Repository and Branch fields: side by side, equal width
- Snippets path field: full width
- No inline validation on PAT format. Error shown only after a failed save attempt.
- Snippets path is required and non-empty. Inline error shows on blur when empty.
- Connection dot resets to gray when any field changes without a save.
- Disconnect shown only when GitHub is configured. No confirmation dialog.

## Logo

`>` glyph mark in a 4px rounded-square container, mono zinc palette. Icon-only at all sizes, no wordmark at 16–128px. The rounded-square container handles varied backgrounds in the Chrome toolbar and store grid. Export as PNG at 16, 32, 48, and 128px.

- Container: zinc-900 (`#18181b`), solid fill, no stroke, 4px radius, single variant
- Glyph: white (`#ffffff`), geometric path (not a text character), two segments meeting at a point, 90 degrees total (each segment 45 degrees from vertical), bounding box 40% of container size, butt stroke caps, miter join at apex, 16px stroke in a 128px viewBox (scales proportionally), 25% padding on each side
- Manifest icons (`public/icons/`): full-bleed at 16, 32, 48, and 128px
- Store icon (`store/icon.png`): 96x96 artwork centered in a 128x128 transparent canvas with 16px padding on each side. Chrome applies its own frame and rounding on top

## Iconography

lucide-react, 16px, stroke 1.5px, `currentColor`. No filled icons. No custom icons.
