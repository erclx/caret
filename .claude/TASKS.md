# Tasks

## In progress

## Up next

### Chore — icon design

- [ ] Design and export icon at 16/32/48/128px (see DESIGN.md for direction)
- [ ] Replace placeholder icons in `public/icons/`

## Done

- [x] Planning & document setup

- [x] Design setup
  - [x] Run `bunx shadcn@latest init`
  - [x] Set `--radius: 0.25rem` (4px)
  - [x] Override shadcn HSL variables with zinc scale (see DESIGN.md)
  - [x] Import Geist font, apply to all roots
  - [x] Verify light/dark mode via `prefers-color-scheme`
  - **Test strategy: none** — visual verification in browser

### Feature 1 — Prompt storage layer

- [x] Define Zod schemas for `Prompt` and `Settings`
- [x] Build typed `storage.ts` wrapper (get, set, subscribe)
- [x] Build `usePrompts` hook (list, create, update, delete)
- [x] Build `useSettings` hook (read/write per-site config)
- [x] Add `seeds.ts` with sample snippets mirroring `snippets/` folder content; seed storage on init when `NODE_ENV === development` and storage is empty
- [x] Replace `src/test/smoke.test.ts` with unit tests for storage utils and hooks (don't create new test files — overwrite the existing smoke test)
- **Test strategy: unit** — pure logic, no DOM needed

### Feature 2 — Popup & sidepanel prompt library UI

- [x] PromptList component (list all prompts)
- [x] PromptForm component (create/edit)
- [x] Delete with confirmation
- [x] Wire popup/sidepanel to usePrompts
- **Test strategy: unit** — component logic; e2e deferred

### Feature 3 — Options page

- [x] Scaffold `src/options/` (app.tsx, index.html, main.tsx)
- [x] Per-site trigger symbol config UI
- [x] Enable/disable per site toggle
- [x] Wire to useSettings
- **Test strategy: unit** — settings form logic

### Feature 4 — Content script: Input detection

- [x] Detect chat input per target site (Claude, Gemini, ChatGPT)
- [x] Abstract input adapter (contenteditable vs textarea)
- [x] Trigger symbol detection on keydown — symbol must be at position 0 or immediately preceded by whitespace; mid-word trigger (e.g. `word>`) must not fire
- [x] Position/reposition on resize
- **Test strategy: integration** — needs real DOM shapes per site

### Feature 5 — Content script: Dropdown

- [x] Inject React root adjacent to input
- [x] Fuzzy filter against prompt library
- [x] Keyboard nav: ↑↓, Ctrl+J (down), Ctrl+P (up), Enter/Tab, Escape
- [x] Position/reposition on resize
- **Test strategy: integration** — component + keyboard interaction

### Feature 6 — Prompt insertion

- [x] Insert at cursor for contenteditable (execCommand)
- [x] Insert at cursor for textarea (InputEvent dispatch)
- [x] Verify Claude.ai ProseMirror state updates correctly
- [x] Rename `e2e/smoke.test.ts` → `e2e/ui.test.ts` then overwrite with real Playwright tests for insertion

### Chore — migrate to sidepanel

- [x] Manifest: remove `default_popup`, add sidepanel + permission
- [x] Background worker: `chrome.action.onClicked` → `chrome.sidePanel.open()`
- [x] Popup: keep code, add dormant comment
- [x] ARCHITECTURE.md: note sidepanel-primary decision, popup dormant

### Chore — add extension icons at all sizes

- [x] Create logo at 16, 32, 48, 128px
- [x] Wire into manifest as extension icons

### Feature — sidepanel UI

- [x] Header: replace "Your prompts" → logo + "Caret" + gear icon
- [x] Gear icon → opens options page via `chrome.runtime.openOptionsPage()`
- [x] Add `[Prompts] [GitHub]` tab bar
- [x] GitHub tab: empty shell, "Set up in options →" placeholder
- [x] Add search input between tab bar and list, filters in real time
- [x] Remove pencil icon from list rows
- [x] Whole row clickable to edit
- [x] Row hover state: background shift + pointer cursor
- [x] Bin + inline delete confirmation: keep as-is
- [x] Form label: "Trigger name" → "Name"
- [x] Form: add `← Back` top-left
- [x] Save button: fix light mode solid → outlined (shared button component)
- [x] Empty state copy: "No prompts found." → "No prompts yet — click the extension icon to add one"
- [x] Scrollbar styling: thin 4px zinc thumb, transparent track, applied globally in `index.css` (textarea + dropdown list)

### Fix — minor UI & interaction

- [x] Inline "Settings saved" on save, fades after 2-3s
- [x] Add mousedown listener on document in `use-dropdown.ts`
- [x] Dismiss when click target is outside dropdown ref
- [x] Clean up listener in useEffect teardown

### Feature 7 — JSON export / import

- [x] Export prompts as JSON download
- [x] Import from JSON file with Zod validation
- [x] Handle merge conflicts (duplicate names)
- **Test strategy: unit** — pure parse/validate logic

### Feature 8 — GitHub Sync

- [x] Add GitHub config to Settings schema: `pat`, `owner`, `repo`, `branch`, `snippetsPath`
- [x] GitHub config UI in options page (PAT input, repo details, save, connection status); test connection before saving, only persist on success
- [x] Dedicated sync view in sidepanel: tab bar `[Prompts] [GitHub]`, connection status, last synced timestamp, snippet count, sync button
- [x] Fetch all `.md` files from configured `snippets/` path via GitHub Contents API
- [x] Map filename → slug (strip `.md`), file content → prompt body
- [x] Add `source?: 'github'` to `Prompt` schema; sync only manages prompts it owns; locally created prompts excluded from diff and untouched by apply
- [x] Diff view before confirming sync: apply surgically (add, update, remove), preserving `id` and `createdAt` for unchanged and updated prompts
- [x] Post-sync summary via `lastSyncedAt` / `lastSyncedCount` in settings
- [x] Dev seeding: seed GitHub config from `VITE_GITHUB_*` env vars in background `onInstalled`
- [x] Options page decomposed into `data-section.tsx`, `site-config-section.tsx`, `github-section.tsx`; `app.tsx` is loading gate and composition only
- **Test strategy: unit** — fetch parsing and mapping logic; e2e deferred (requires live PAT)

### Chore — UI polish

- [x] Remove tooltip arrow artifact
- [x] Fix options page white flash on load
- [x] Prompt form layout: textarea fills available height, buttons always visible below it
- [x] Add PAT setup link in GitHub config section
- **Test strategy: none** — visual verification in browser

### Feat — prompt list improvements

- [x] Name field: realtime kebab-case validation with inline error
- [x] Sort prompts by `updatedAt` descending; local prompts before GitHub-sourced
- **Test strategy: unit** — validation logic

### Chore — screenshot script rewrite

- [x] Capture options page (light + dark)
- [x] Remove stale popup captures
- [x] Add dropdown capture on mocked chat page
- [x] Add Gemini e2e insertion test (parity with Claude and ChatGPT)
- **Test strategy: none** — visual output, manually verified

### Feat — unsaved changes warning in prompt form

- [x] Warn before discarding a dirty form — Back and Cancel both trigger an inline confirmation row when values differ from initial; no warning if form is clean or new and empty
- **Test strategy: unit** — dirty state detection
