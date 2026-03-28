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
- Trigger: user types `>` (configurable per site)
- Symbol only fires at position 0 or immediately after whitespace. Mid-word does not trigger (e.g. `word>` must not open dropdown)
- Filters in real time as user types after trigger symbol in the chat input. No separate search field inside the dropdown (intentional design decision)
- Max 6 rows visible before scroll
- Keyboard: ↑↓, Ctrl+J (down), Ctrl+P (up) to navigate · Enter or Tab to insert · Esc to dismiss
- Ctrl+K and Ctrl+N are intentionally excluded. Ctrl+K conflicts with Claude.ai's native formatting shortcut
- Empty state: "No prompts yet - click the extension icon to add one." (directs to sidepanel, not the sidepanel's own "+ New" button)
- Dropdown width matches input element exactly
- Anchored above input. Repositions when the input resizes
- Insertion: removes trigger + query text, inserts prompt body at cursor position
- After insertion dropdown dismisses and focus returns to chat input

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
│ 🔍 Search prompts...        ✕ │  ← X appears only when query is non-empty, clears and refocuses
├────────────────────────────────┤
│ [All] [claude] [writing] [Unlabeled] │  ← pills, only shown when ≥1 labeled prompt exists
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

- Label filter pills: `All` is always first. Existing labels follow in alphabetical order. `Unlabeled` is last and appears only when unlabeled prompts exist alongside at least one labeled prompt. The pills row is hidden when no labeled prompts exist.
- Clicking a label pill toggles it on or off. Active pills show an X on the right. Multiple pills can be active simultaneously. `All` clears all active pills and shows with accent background only when nothing is selected.
- When label pills are active, only prompts whose label matches the active set are shown. Selecting `Unlabeled` shows prompts with no label.
- Label filter and text search apply together with AND logic. Empty state when the combination returns nothing: "No prompts found."
- Label filter state is session-only. Resets to All when the sidepanel closes.
- Click anywhere on row → opens edit form (full replace, no modal)
- Hover → background shift + pointer cursor
- 🗑️ click → inline confirmation expands in-row:
  ```
  │ Delete?      [Cancel]  [Confirm]  │
  ```
  Cancel dismisses, Confirm deletes with animation
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
│ Label                          │  ← optional, free-text with clickable chips below
│ ┌──────────────────────────┐   │
│ │ claude                   │   │  ← accepts free-text, chips toggle existing labels
│ └──────────────────────────┘   │
│ [claude ×] [writing]           │  ← chips, active chip shows × on right, click to toggle
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

### Edit / new form: dirty state (Back triggered)

```plaintext
┌────────────────────────────────┐
│ Discard changes?  [Keep editing] [Discard] │  ← replaces ← Back
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
│ [Cancel]        [Save]         │  ← Cancel/Save remain visible
└────────────────────────────────┘
```

### Edit / new form: dirty state (Cancel triggered)

```plaintext
┌────────────────────────────────┐
│ ← Back                         │  ← Back remains visible
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
│ Discard changes?  [Keep editing] [Discard] │  ← replaces Cancel/Save
└────────────────────────────────┘
```

Behavior:

- `← Back` and Cancel both check dirty state before navigating
- Dirty = values differ from initial. New form with empty fields is never dirty
- If dirty: confirmation row appears at the anchor that was triggered. Back replaces the top `← Back` row. Cancel replaces the bottom Cancel/Save row
- Keep editing dismisses the confirmation and restores whichever row was replaced
- Discard navigates back without saving
- If clean: navigate immediately with no confirmation
- Name field: required, kebab-case only (`[a-z0-9-]+`). An inline error appears below the field in real time. Save is disabled while the error is active or name is empty. The same name is allowed if the label differs.
- Label field: optional, no format restriction. Free-text input with clickable chips below showing existing labels. Clicking a chip sets it as the label, and clicking again clears it. Accepts values not in the chip list. An empty value means no label. Label is included in the dirty-state check.
- Prompt body: required, must not be empty
- Save persists the prompt immediately and returns to list
- Textarea scrollbar: thin zinc thumb, transparent track
- Edit form pre-fills fields with existing prompt data
- New form shows empty fields with placeholder hints

### Onboarding empty state

Shown only on fresh install, before any prompt has ever been created (`hasEverHadPrompts = false`).

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

Shown when all prompts have been deleted (`hasEverHadPrompts = true`, `prompts.length === 0`).

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
│ · chat-mode            local   │  ← unlabeled local prompt, no label prefix
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

- `●` indicator: green = connected, red = error. When not configured, no dot is shown and the whole view shows "Set up in Options →" instead
- Sync is always manual. No auto-sync
- Cancel on diff discards fetch, does not modify storage
- Apply is surgical: added snippets are inserted, updated prompts patch body and label, removed prompts are deleted, local prompts are untouched
- Diff entries show `label · name` when a label is present, unlabeled entries show name only
- A file moved between GitHub subdirectories (label change) appears as two entries: a remove at the old composite key and an add at the new one
- Skipped entries (`·`) are GitHub snippets whose `(label, name)` composite key matches a local prompt. They are not imported and the local prompt is preserved
- Not configured: show "Set up in Options →" link instead of sync button
- PAT optional for public repos, required for private

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
│ Added: foo, bar.          ← success feedback│
│ Updated: baz.               fades after Ns  │
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

- Export downloads `caret-backup.json`
- Import validates JSON with Zod before writing to storage. Shows error on invalid file
- Import merge conflict (duplicate name): last-write-wins
- Trigger symbol editable per site. Toggle enable/disable per site without losing trigger config
- PAT displayed masked after save, not encrypted (documented risk)
- PAT field: full width, masked
- Repository and Branch fields: side by side, equal width
- `?` icon on each field label opens a tooltip with usage hint, no arrow on tooltip
- `●` connection dot: green = connected, red = error, gray = not configured. Updates on save
- No inline validation on PAT format. Error shown only after a failed save attempt.
- "Saved ✓" appears inline right of Save button, fades after 2.5s
- Disconnect shown only when GitHub is configured. No confirmation dialog
- Constrained max width, centered
