# Wireframes

> ASCII wireframes for planning purposes. Not final design — structure and layout only.

## 1. In-Chat Dropdown (Command Palette)

Appears above the chat input when user types the trigger symbol (default `>`).

```plaintext
┌─────────────────────────────────────────┐
│   summarize...                          │  ← no search input; filter is typed
├─────────────────────────────────────────┤  directly in chat input after trigger
│ ▶ summarize        Summarize the fol... │  ← selected
│   fix-grammar      Fix grammar and s... │
│   explain-code     Explain this code... │
│   bullet-points    Convert this into... │
│   eli5             Explain this like... │
│   translate-en     Translate the fol... │
├─────────────────────────────────────────┤
│ ↑↓ navigate · Enter/Tab insert · Esc close  │
└─────────────────────────────────────────┘
        ▲ anchored above input
┌─────────────────────────────────────────┐
│ > summarize█                            │  ← chat input; typing here filters above
└─────────────────────────────────────────┘
```

**Behavior:**

- Trigger: user types `>` (configurable per site)
- Symbol only fires at position 0 or immediately after whitespace — mid-word does not trigger (e.g. `word>` must not open dropdown)
- Filters in real time as user types after trigger symbol in the chat input — no separate search field inside the dropdown (intentional design decision)
- Max 6 rows visible before scroll
- Keyboard: ↑↓, Ctrl+J (down), Ctrl+P (up) to navigate · Enter or Tab to insert · Esc to dismiss
- Ctrl+K and Ctrl+N intentionally excluded — Ctrl+K conflicts with Claude.ai native formatting shortcut
- Keydown listener on window capture phase to intercept before host page handlers fire
- Empty state: "No prompts yet, click + New to add one."
- Dropdown width matches input element exactly
- Anchored above input via `getBoundingClientRect`; ResizeObserver repositions on input resize
- Insertion: removes trigger + query text, inserts prompt body at cursor position
- After insertion dropdown dismisses and focus returns to chat input

## 2. Sidepanel

> Popup code is kept but not surfaced. `chrome.action.onClicked` opens the sidepanel.
> All prompt management lives here.

### List view

```plaintext
┌────────────────────────────────┐
│ ⚡ Caret                ⚙️    │  ← logo + "Caret" left, gear right (opens options)
├────────────────────────────────┤
│ [Prompts]  [GitHub]   + New   │  ← tab bar; + New scoped to Prompts tab, hides on GitHub tab
├────────────────────────────────┤
│ 🔍 Search prompts...        ✕ │  ← X appears only when query is non-empty; clears and refocuses
├────────────────────────────────┤
│ summarize              🗑️     │  ← whole row clickable to edit; no pencil icon
│ Summarize the following...     │
├────────────────────────────────┤
│ fix-grammar            🗑️     │
│ Fix grammar and spelling...    │
├────────────────────────────────┤
│ explain-code           🗑️     │
│ Explain this code in simp...   │
└────────────────────────────────┘
```

**Behavior:**

- Click anywhere on row → opens edit form (full replace, no modal)
- Hover → background shift + pointer cursor
- 🗑️ click → inline confirmation expands in-row:
  ```
  │ Delete?      [Cancel]  [Confirm]  │
  ```
  Cancel dismisses, Confirm deletes with animation
- Search filters on prompt name in real time; empty query shows all
- List is scrollable; header, tab bar, and search input are fixed
- `+ New` opens new prompt form (full replace); hidden when GitHub tab is active

### Edit / new form

```plaintext
┌────────────────────────────────┐
│ ← Back                         │  ← discards changes, returns to list
├────────────────────────────────┤
│ Name                           │  ← was "Trigger name"; simplified
│ ┌──────────────────────────┐   │
│ │ summarize                │   │
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

### Edit / new form — dirty state (Back triggered)

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

### Edit / new form — dirty state (Cancel triggered)

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

**Behavior:**

- `← Back` and Cancel both check dirty state before navigating
- Dirty = values differ from initial; new form with empty fields is never dirty
- If dirty: confirmation row appears at the anchor that was triggered — Back replaces the top `← Back` row; Cancel replaces the bottom Cancel/Save row
- Keep editing dismisses the confirmation and restores whichever row was replaced
- Discard navigates back without saving
- If clean: navigate immediately with no confirmation
- Name field: required, kebab-case only (`[a-z0-9-]+`) — inline error shown in real time below the field; Save disabled while error is active or name is empty
- Prompt body: required, must not be empty
- Save writes to `chrome.storage.local` immediately, returns to list
- Textarea scrollbar: thin 4px zinc thumb, transparent track (styled in `index.css`)
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

### GitHub tab — not configured

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

### GitHub tab — configured, never synced

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

### GitHub tab — diff view

```plaintext
┌────────────────────────────────┐
│ ⚡ Caret                ⚙️    │
├────────────────────────────────┤
│ [Prompts]  [GitHub]            │
├────────────────────────────────┤
│ ● Connected · owner/repo       │
│ 8 snippets fetched             │
├────────────────────────────────┤
│ CHANGES                        │
│                                │
│ + chat-mode        new         │
│ ~ summarize        modified    │
│ - old-snippet      removed     │
│                                │
│ 5 unchanged                    │
├────────────────────────────────┤
│ [Cancel]       [Apply 3 changes]│
└────────────────────────────────┘
```

### GitHub tab — post-sync

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

**GitHub behavior:**

- `●` indicator: green = connected · red = error · gray = not configured
- Sync is always manual — no auto-sync
- Cancel on diff discards fetch, does not modify storage
- Apply does full replace of all prompts then returns to post-sync state
- Not configured: show "Set up in Options →" link instead of sync button
- PAT optional for public repos; required for private
- Each sync: 1 directory listing request + 1 per snippet file (N+1 total)
- Filename → slug: strip `.md` extension; file content → prompt body

## 3. Options Page

```plaintext
┌─────────────────────────────────────────────┐
│ ⚡ Caret — Settings                         │
├─────────────────────────────────────────────┤
│ TRIGGER SYMBOLS                             │
│                                             │
│ claude.ai       [ > ] ✏️    [✅ enabled]    │
│ gemini.google   [ > ] ✏️    [✅ enabled]    │
│ chatgpt.com     [ > ] ✏️    [✅ enabled]    │
│                                             │
├─────────────────────────────────────────────┤
│ DATA                                        │
│                                             │
│ [⬇️ Export prompts as JSON]                 │
│ [⬆️ Import prompts from JSON]               │
│                                             │
├─────────────────────────────────────────────┤
│ GITHUB SYNC                                 │
│                                             │
│ Personal access token                       │
│ ┌─────────────────────────────────────┐     │
│ │ ghp_••••••••••••••••••••••••••••••  │     │
│ └─────────────────────────────────────┘     │
│                                             │
│ Repository          Branch                  │
│ ┌──────────────┐    ┌──────────────┐        │
│ │ owner/repo   │    │ main         │        │
│ └──────────────┘    └──────────────┘        │
│                                             │
│ Snippets path                               │
│ ┌─────────────────────────────────────┐     │
│ │ snippets                            │     │
│ └─────────────────────────────────────┘     │
│                                             │
│ [Save]   ● Connected   Settings saved ✓     │  ← inline feedback, fades after 2-3s
│                                             │
└─────────────────────────────────────────────┘
```

**Behavior:**

- Trigger symbol is editable per site inline
- Toggle enable/disable per site without losing its trigger config
- Export downloads `caret-backup.json`
- Import validates JSON with Zod before writing to storage; shows error on invalid file
- Import merge conflict (duplicate name): last-write-wins
- PAT stored in `chrome.storage.local` — displayed masked after save; not encrypted (documented risk)
- PAT field: `type="password"`, full width
- Repository and Branch fields: side by side, equal width
- `●` Connected status updates on save; red if credentials fail
- No inline validation on PAT format — error shown only after failed save attempt
- "Settings saved ✓" appears inline right of Save button, fades after 2-3s
- Max width 640px, centered
