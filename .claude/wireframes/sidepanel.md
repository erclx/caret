---
title: Sidepanel
description: Prompt library UI opened by the extension icon. Houses all prompt management and GitHub sync state.
---

# Sidepanel

> Popup code is kept but not surfaced. The extension icon opens the sidepanel.
> All prompt management lives here.

Surface shape:

- Width ~380px, user-resizable
- Tab bar with plain text tabs and a bottom border on the active tab
- Edit view replaces the list inline. No modal

## List view

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
  Cancel or Escape dismisses. Confirm deletes with animation.

**Search and navigation**

- Search filters on prompt name in real time. Empty query shows all
- List is scrollable. Header, tab bar, and search input are fixed
- `+ New` opens new prompt form (full replace), hidden when GitHub tab is active

## Edit / new form

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

## Edit / new form: GitHub source

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

## Edit / new form: dirty state

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
- If the save fails, an error appears above the buttons. The error clears when the user edits any field.

**Display**

- Textarea scrollbar: thin zinc thumb, transparent track
- Edit form pre-fills fields with existing prompt data
- New form shows empty fields with placeholder hints
- GitHub source banner: shown exclusively when editing a GitHub-synced prompt. Uses a muted background and text, with the Github icon, to warn the user that their edits are ephemeral without breaking the mono zinc aesthetic constraint. It sits between the Back button and the Name field.

## Onboarding empty state

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

## Empty state

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

## GitHub tab: not configured

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

## GitHub tab: configured, never synced

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

## GitHub tab: diff view

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

## GitHub tab: post-sync

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
- When the diff contains only skipped entries with no added, updated, or removed entries, a note below the list reads "Nothing to apply. Local edits are preserved." Apply is disabled.

## Appearance

### Label filter button

- Hidden when no labeled prompts exist
- Button uses `--border` border, `--muted-foreground` text when inactive, `--foreground` text when active
- Button height matches the search input. Button text is `text-xs` to read as a secondary control relative to the primary search field
- When active, the button label reads "Label · N" in full-contrast foreground text. `N` is the count of selected labels

### Label filter popover

- Scrollable checkbox list: existing labels in alphabetical order with "Unlabeled" at the bottom when applicable
- A "Clear" link sits at the top of the popover, separated by a bottom border. It is always rendered to prevent height shifts on activation, but it is visible only when filters are active
- Each row is fully clickable. Clicking anywhere in the row toggles the filter, not only the checkbox or label text

### Prompt list rows

- Labeled prompts render the `label · name` line with label and separator in `--muted-foreground` and name in `--foreground`. Matches the dropdown styling
- Trash icon uses `--destructive` at 80% opacity at rest and full opacity on hover. The reduced opacity signals availability without competing with the prompt name and body that are the row's primary content

### Confirmation rows

Applies to the inline delete confirm row in the list and the discard-changes row in the edit form.

- Container uses `--muted` background with no border in light mode. In dark mode, add a `--border` border, since the muted background blends into the panel background and a border is needed to define the box
- Label text uses `--foreground`. It is the context for the action buttons and must be fully legible
- Only the destructive action button carries red. No other element in the row uses a destructive color

### Edit form label field

- Field label reads "Label (optional)" to communicate that the field may be left blank without a tooltip or helper text
- Case-sensitivity hint shows in a tooltip triggered by a help icon (`HelpCircle`, 14px) placed inline next to the field label
- Chevron icon is always visible at the right edge to signal that the dropdown opens. It is non-interactive
- X button appears when the value is non-empty, sits to the left of the chevron, clears on click, and returns focus to the label input. Input text must not overlap either icon
- No chips or pills below the input
- Combobox dropdown adds a `--border` ring in dark mode, since `--card` and `--background` are nearly identical in dark and a ring is needed to define the boundary

### Edit form GitHub banner

- When editing a GitHub-synced prompt, a muted warning banner sits between the Back button and the Name field
- The banner explains that local edits will be overwritten on the next sync
- Uses `bg-muted` and `text-muted-foreground` to blend with the utilitarian dark and light schemes without competing with the form inputs
- Contains the 16px `Github` lucide icon aligned with the text

### GitHub view

- Connection indicator: 8px filled circle. Green when connected, red on error. Shown only when GitHub is configured
- When not configured, the entire view is replaced by a plain link to Options
- Post-sync transient: a label fades in below the sync button and out after 2.5s. "Applied ✓" after a successful apply. "Up to date ✓" after a fetch that finds no changes. Both use `--muted-foreground` centered `text-xs` with opacity-only transition
