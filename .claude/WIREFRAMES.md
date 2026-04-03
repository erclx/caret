# Wireframes

ASCII wireframes for planning purposes. Structure and layout only, not final design. Update this doc when a new surface is designed or a layout decision changes.

What belongs:

- ASCII diagrams showing layout, hierarchy, and component placement
- A context sentence per section describing when and where it appears
- All meaningful states: empty, loading, error, and any variant where the layout changes significantly
- Exact UI copy strings: labels, empty states, confirmation text, hints
- Interaction rules: what triggers what, navigation flow, confirmation behavior
- Intentional omissions with a brief reason, so they are not re-added later

What does not belong:

- Implementation details (event listeners, API call counts, storage keys). Those live in ARCHITECTURE.md.
- Visual decisions (colors, spacing, typography). Those live in DESIGN.md.
- Pixel values or final measurements. Verify those in the browser.

Use `←` for inline annotations inside diagrams. Use sentence case for all text labels. Document state variants as separate subsections when the layout changes. Keep behavior bullets to UX only: what the user sees and does, not how the code handles it.

## 1. In-Chat Dropdown (Command Palette)

Appears above the chat input when user types the trigger symbol (default `>`).

```plaintext
┌─────────────────────────────────────────┐
│   summarize...                          │  ← no search input, filter is typed
├─────────────────────────────────────────┤  directly in chat input after trigger
│ ▶ claude · summarize  Summarize the f.. │  ← selected, label shown for labeled prompts
│   claude · fix-code   Fix and explain.. │
│   fix-grammar         Fix grammar an... │  ← unlabeled prompt, no label prefix
│   bullet-points       Convert this i... │
│   eli5                Explain this l... │
│   writing · draft     Draft an email... │
├─────────────────────────────────────────┤
│ ↑↓ navigate · Enter/Tab insert · Esc close  │
└─────────────────────────────────────────┘
        ▲ anchored above input
┌─────────────────────────────────────────┐
│ > summarize█                            │  ← chat input, typing here filters above
└─────────────────────────────────────────┘
```

Behavior:

- Labeled prompts render as `label · name` in the name line. Unlabeled prompts show name only.

**Trigger**

- User types `>` (configurable per site)
- Fires only at position 0 or immediately after whitespace. Mid-word does not trigger (e.g. `word>` must not open dropdown)
- Filters in real time as user types after the trigger symbol in the chat input. No separate search field inside the dropdown (intentional design decision)

**Keyboard**

- ↑↓, Ctrl+J / Cmd+J (down), Ctrl+P / Cmd+P (up) to navigate · Enter or Tab to insert · Esc to dismiss
- Ctrl+K and Ctrl+N are intentionally excluded. Ctrl+K conflicts with Claude.ai's native formatting shortcut

**States**

- Empty library: "No prompts yet. Click the extension icon to add one." (directs to sidepanel, not the sidepanel's own "+ New" button)
- No results: "No results." shown when the library has prompts but none match the current query
- Keyboard hint footer is hidden in both empty states. There is nothing to navigate.

**Layout**

- Max 6 rows visible before scroll
- Width matches input element exactly
- Anchored above input. Repositions when the input resizes

**Insertion**

- Removes trigger + query text, inserts prompt body at cursor position
- Dropdown dismisses and focus returns to chat input

## 2. Sidepanel

> Popup code is kept but not surfaced. The extension icon opens the sidepanel.
> All prompt management lives here.

### List view

```plaintext
┌────────────────────────────────┐
│ ⚡ Caret                ⚙️    │  ← logo + "Caret" left, gear right (opens options)
├────────────────────────────────┤
│ [Prompts]  [GitHub]   + New   │  ← tab bar, + New scoped to Prompts tab, hides on GitHub tab
├────────────────────────────────┤
│ 🔍 Search prompts...  ✕ [Label ▾] │  ← filter button shown only when ≥1 labeled prompt exists
├────────────────────────────────┤
│ claude · summarize     🗑️     │  ← whole row clickable to edit, no pencil icon
│ Summarize the following...     │
├────────────────────────────────┤
│ fix-grammar            🗑️     │  ← unlabeled prompt, no label prefix
│ Fix grammar and spelling...    │
├────────────────────────────────┤
│ claude · explain-code  🗑️     │
│ Explain this code in simp...   │
└────────────────────────────────┘
```

Behavior:

**Label filter**

- Button: shown only when at least one labeled prompt exists. "Label ▾" when inactive, "Label · N ▾" when N selected.
- Popover: "Clear" link at the top (visible when filters active), scrollable list of labels in alphabetical order, "Unlabeled" at the bottom if applicable. Multiple checkboxes can be active simultaneously. Unchecking all returns to showing everything.
- When active: only prompts matching the active set are shown. "Unlabeled" shows prompts with no label.
- Combines with text search using AND logic. When nothing matches, the list area shows "No prompts match your search." with a hint-weight "Clear filter to see all" button below it. Clicking the button resets both the text query and the label filter.
- Session-only. Resets to all on sidepanel close.

**Rows**

- Click anywhere → opens edit form (full replace, no modal)
- Hover → background shift + pointer cursor
- 🗑️ click → inline confirmation expands in-row:
  ```
  │ Delete?      [Cancel]  [Confirm]  │
  ```
  Cancel dismisses, Confirm deletes with animation

**Search and navigation**

- Search filters on prompt name in real time. Empty query shows all
- List is scrollable. Header, tab bar, and search input are fixed
- `+ New` opens new prompt form (full replace), hidden when GitHub tab is active

### Edit / new form

```plaintext
┌────────────────────────────────┐
│ ← Back                         │  ← discards changes, returns to list
├────────────────────────────────┤
│ Name                           │  ← was "Trigger name", simplified
│ ┌──────────────────────────┐   │
│ │ summarize                │   │
│ └──────────────────────────┘   │
│                                │
│ Label (optional) ?             │  ← "(optional)" signals the field may be left blank, ? icon opens case-sensitivity tooltip
│ ┌──────────────────────────┐   │
│ │ claude               ✕  ↓│   │  ← chevron always visible, X appears to its left when non-empty
│ └──────────────────────────┘   │
│                                │
│ Prompt body                    │
│ ┌──────────────────────────┐   │
│ │ Summarize the following  │   │
│ │ text in 3 bullet points: │   │
│ └──────────────────────────┘   │
│                                │
│ [Cancel]        [Save]         │  ← Save is outlined, not solid, in both modes
└────────────────────────────────┘
```

### Edit / new form: GitHub source

When editing a prompt synced from GitHub, a muted warning banner appears below the Back button.

```plaintext
┌────────────────────────────────┐
│ ← Back                         │
├────────────────────────────────┤
│ ┌──────────────────────────┐   │
│ │ [Github] Synced from     │   │
│ │ GitHub. Local edits will │   │
│ │ be lost on next sync.    │   │
│ └──────────────────────────┘   │
│                                │
│ Name                           │
│ ┌──────────────────────────┐   │
```

### Edit / new form: dirty state

```plaintext
┌────────────────────────────────┐
│ ← Back                         │  ← always visible, never replaced
├────────────────────────────────┤
│ Name                           │
│ ┌──────────────────────────┐   │
│ │ summarize                │   │
│ └──────────────────────────┘   │
│                                │
│ Prompt body                    │
│ ┌──────────────────────────┐   │
│ │ ...                      │   │
│ └──────────────────────────┘   │
│                                │
│ Discard changes?  [Keep editing] [Discard] │  ← always at bottom, replaces Cancel/Save
└────────────────────────────────┘
```

Behavior:

**Dirty state**

- `← Back` and Cancel both check dirty state before navigating
- Dirty = values differ from initial. New form with empty fields is never dirty
- If dirty: confirmation row appears at the bottom, replacing Cancel/Save. Back stays visible at the top regardless of which action triggered the confirmation
- Keep editing dismisses the confirmation and restores Cancel/Save
- Discard navigates back without saving
- If clean: navigate immediately with no confirmation

**Fields**

- Name field: required, kebab-case only (`[a-z0-9-]+`)
  - Inline error appears below the field in real time
  - Save is disabled while the error is active or name is empty
  - The same name is allowed if the label differs
  - Duplicate-pair error appears below the name field when a name change causes the conflict
- Label field: optional, no format restriction
  - Case-sensitivity hint shown as a tooltip on a `?` icon next to the field label
  - Combobox: chevron icon at the right edge signals the field opens a dropdown
  - Focus or typing opens the dropdown showing existing labels, narrowed to matches when input is non-empty
  - Arrow keys navigate options. Enter selects the highlighted option. Escape closes without clearing the field or triggering the form's discard flow.
  - Accepts values not in the list to create a new label. An empty value means no label.
  - X button appears inside the field when non-empty, to the left of the chevron, and clears the label on click
  - Included in dirty-state check. Whitespace is trimmed on blur.
  - Duplicate-pair error appears below the label field when a label change causes the conflict
- Prompt body: required, must not be empty
  - Inline error "Enter the prompt content" appears below the field on blur when the field is empty
  - Save is disabled while the field is empty

**Save**

- Persists the prompt, shows "Saved ✓" in place of the Cancel/Save row for 1.2 seconds, then returns to the list automatically

**Display**

- Textarea scrollbar: thin zinc thumb, transparent track
- Edit form pre-fills fields with existing prompt data
- New form shows empty fields with placeholder hints
- GitHub source banner: shown exclusively when editing a GitHub-synced prompt. Uses a muted background and text, with the Github icon, to warn the user that their edits are ephemeral without breaking the mono zinc aesthetic constraint. It sits between the Back button and the Name field.

### Onboarding empty state

Shown only on fresh install, before the user has created their first prompt.

```plaintext
┌────────────────────────────────┐
│ ⚡ Caret                ⚙️    │
├────────────────────────────────┤
│ [Prompts]  [GitHub]   + New   │
├────────────────────────────────┤
│                                │
│   No prompts yet.              │
│   Add one above, then type >   │
│   in any chat to use it.       │
│                                │
└────────────────────────────────┘
```

### Empty state

Shown when the library is empty, but the user has previously created or synced prompts.

```plaintext
┌────────────────────────────────┐
│ ⚡ Caret                ⚙️    │
├────────────────────────────────┤
│ [Prompts]  [GitHub]   + New   │
├────────────────────────────────┤
│                                │
│   No prompts yet,              │
│   click + New to add one.      │
│                                │
└────────────────────────────────┘
```

### GitHub tab: not configured

```plaintext
┌────────────────────────────────┐
│ ⚡ Caret                ⚙️    │
├────────────────────────────────┤
│ [Prompts]  [GitHub]            │
├────────────────────────────────┤
│                                │
│   Set up in Options →          │  ← link to options page
│                                │
└────────────────────────────────┘
```

### GitHub tab: configured, never synced

```plaintext
┌────────────────────────────────┐
│ ⚡ Caret                ⚙️    │
├────────────────────────────────┤
│ [Prompts]  [GitHub]            │
├────────────────────────────────┤
│ ● Connected · owner/repo       │
│ Never synced                   │
│                                │
│ [↻ Sync now]                   │
└────────────────────────────────┘
```

### GitHub tab: diff view

```plaintext
┌────────────────────────────────┐
│ ⚡ Caret                ⚙️    │
├────────────────────────────────┤
│ [Prompts]  [GitHub]            │
├────────────────────────────────┤
│ ● Connected · owner/repo       │
│ 9 snippets fetched             │
├────────────────────────────────┤
│ CHANGES                        │
│                                │
│ + claude · new-prompt  new     │  ← label shown when present
│ ~ writing · summarize  modified│
│ - claude · summarize   removed │  ← a folder move shows as remove + add
│ + writing · summarize  new     │
│ · chat-mode       kept local   │  ← unlabeled local prompt, no label prefix
│                                │
│ 5 unchanged                    │
├────────────────────────────────┤
│ [Cancel]       [Apply 3 changes]│
└────────────────────────────────┘
```

### GitHub tab: post-sync

```plaintext
┌────────────────────────────────┐
│ ⚡ Caret                ⚙️    │
├────────────────────────────────┤
│ [Prompts]  [GitHub]            │
├────────────────────────────────┤
│ ● Connected · owner/repo       │
│ Synced just now · 8 snippets   │
│                                │
│ [↻ Sync now]                   │
└────────────────────────────────┘
```

GitHub behavior:

**Indicator**

- `●` indicator: green = connected, red = error. When not configured, no dot is shown and the whole view shows "Set up in Options →" instead
- Not configured: show "Set up in Options →" link instead of sync button
- PAT optional for public repos, required for private

**Sync**

- Sync is always manual. No auto-sync
- The sync button shows a spinning icon during both fetch and apply
- Cancel on diff discards fetch, does not modify storage
- Apply is surgical: added snippets are inserted, updated prompts patch body and label, removed prompts are deleted, local prompts are untouched

**Diff entries**

- Show `label · name` when a label is present, unlabeled entries show name only
- A file moved between GitHub subdirectories (label change) appears as two entries: a remove at the old composite key and an add at the new one
- Skipped entries (`·`) are GitHub snippets whose `(label, name)` composite key matches a local prompt. They are not imported and the local prompt is preserved

## 3. Options page

Section order: Data → Per-site configuration → GitHub sync.

### Data section

```plaintext
┌─────────────────────────────────────────────┐
│ Data                                        │
│ Export your prompts as a backup or restore  │
│ from a previous export.                     │
├─────────────────────────────────────────────┤
│ [↓ Export prompts as JSON            ]      │
│ [↑ Import prompts from JSON          ]      │
│                                             │
│ Exported ✓                                  │  ← export feedback, fades after 2.5s
│ Nothing to export.                          │  ← shown instead when library is empty
│ Updated 2: baz, qux. Added 1: foo.          │  ← import feedback, single line
│ Added 5: a, b, c and 2 more.                │  ← truncates after 3 names
│ All prompts are already up to date.         │  ← when import produces no changes
└─────────────────────────────────────────────┘
```

### Per-site configuration section

```plaintext
┌─────────────────────────────────────────────┐
│ Per-site configuration                      │
│ Configure the trigger symbol and toggle     │
│ Caret integration for supported platforms.  │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ claude.ai                               │ │
│ │ [✓] Enable Caret on this site           │ │
│ │                              Trigger    │ │
│ │                              [ > ]      │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ gemini.google.com                       │ │
│ │ [✓] Enable Caret on this site           │ │
│ │                              Trigger    │ │
│ │                              [ > ]      │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ chatgpt.com                             │ │
│ │ [✓] Enable Caret on this site           │ │
│ │                              Trigger    │ │
│ │                              [ > ]      │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ [💾 Save]                       Saved ✓      │  ← Save left-aligned, "Saved ✓" ml-auto, fades after 2.5s
└─────────────────────────────────────────────┘
```

Notes on per-site rows:

- On `sm+` screens the trigger input floats right. On mobile it goes full-width below
- Invalid trigger (non-symbol or empty): red `"Enter a single non-letter symbol"` below input, shown only after blur
- `/` on claude.ai or chatgpt.com: amber `"/ conflicts with this site's native slash menu"` below input
- Save button disabled while any enabled site has an invalid trigger

### GitHub sync section

```plaintext
┌─────────────────────────────────────────────┐
│ GitHub sync                                 │
│ Pull prompts from a GitHub repository.      │
│ Read-only. GitHub is the source of truth.   │
├─────────────────────────────────────────────┤
│ Personal access token ?                     │
│ ┌─────────────────────────────────────┐     │
│ │ ghp_••••••••••••••••••••••••••••••  │     │
│ └─────────────────────────────────────┘     │
│ Create a token on GitHub →                  │
│                                             │
│ Repository ?        Branch ?                │
│ ┌──────────────┐    ┌──────────────┐        │
│ │ owner/repo   │    │ main         │        │
│ └──────────────┘    └──────────────┘        │
│                                             │
│ Snippets path ?                             │
│ ┌─────────────────────────────────────┐     │
│ │ snippets                            │     │
│ └─────────────────────────────────────┘     │
├─────────────────────────────────────────────┤
│ [💾 Save]  ● Connected   Saved ✓  [Disconnect] │  ← Save left, Saved ✓ + Disconnect ml-auto right
│                                               │    Disconnect shown only when GitHub configured
│ connection error message (if any)             │    Hint on Disconnect shown as tooltip on hover
└───────────────────────────────────────────────┘
```

Behavior:

**Data**

- Export downloads `caret-backup.json`. Shows "Exported ✓" (muted color) inline right of the button, fades after 2.5s. Shows "Nothing to export." in destructive color instead when the library is empty
- Import validates JSON with Zod before writing to storage. Shows error on invalid file
- Import merge conflict (duplicate name): last-write-wins

**Per-site**

- Trigger symbol editable per site. Toggle enable/disable per site without losing trigger config

**GitHub sync**

- PAT: full width, masked, displayed masked after save, not encrypted (documented risk). No inline validation on format; error shown only after a failed save attempt.
- Repository and Branch: side by side, equal width
- Snippets path: full width. "Enter a snippets path" inline error below the field on blur when empty.
- `?` icon on each field label opens a tooltip with usage hint, no arrow on tooltip
- `●` connection dot: green = connected, red = error, gray = not configured or dirty (any field edited since last save). Resets to gray on any field change. Updates on save.
- Save is blocked when repository is empty or snippets path is empty, even before the user touches those fields
- "Saved ✓" appears inline right of Save button, fades after 2.5s
- Disconnect shown only when GitHub is configured. No confirmation dialog
- Constrained max width, centered
