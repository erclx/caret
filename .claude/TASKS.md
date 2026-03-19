# Tasks

Track what is being built and why, at the level of features and outcomes. Not implementation steps or technical decisions; those live in ARCHITECTURE.md. Update this doc whenever a task is started, completed, or scope changes.

What belongs:

- Task entries describing what and why: short bullet per item, one outcome per line
- A test strategy line per task: the type of test and a brief justification, not specific file or method names
- Inline notes on blockers or dependencies, attached to the relevant Up next entry

What does not belong:

- Class names, file paths, function names, or prop names in any entry or section title
- "In progress" or "Blocked" sections; note those inline on the Up next entry instead
- How something will be implemented

Two sections only: Up next and Done. When completing a task, append it at the bottom of Done (newest last). When Done exceeds 10 entries, move the oldest to `.claude/TASKS-ARCHIVE.md`; do this automatically when adding a Done entry that would push past the limit.

## Up next

### Fix — Esc to cancel in edit form

- [ ] Handle `keydown` Esc in the prompt edit form — trigger the same dirty-state check as Back/Cancel (show confirmation if dirty, navigate immediately if clean)
- **Test strategy:** unit test in `prompt-form.test.tsx`; e2e in `e2e/ui.test.ts`

### Chore — test coverage: GitHub feature

- [ ] Add unit tests for the GitHub sync flow — apply, cancel, error, and diff states
- [ ] Add unit tests for the GitHub options section — save, disconnect, connection status
- **Test strategy:** unit tests

### Chore — test coverage: data section and content input

- [ ] Add unit tests for export and import handlers in the data section
- [ ] Improve unit test coverage for the content script input detection and insertion paths
- **Test strategy:** unit tests

### Chore — logo

- [ ] Design logo in Figma
- **Test strategy: none** — visual verification

## Done

### Chore — planning & document setup

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
- [x] Two-anchor confirmation: Back shows confirmation at top replacing `← Back`; Cancel shows confirmation at bottom replacing Cancel/Save; Keep editing restores the replaced row
- **Test strategy: unit** — dirty state detection

### Feat — prompt form improvements

- [x] Warn on duplicate name — prevent saving a prompt whose name already exists; editing a prompt excludes itself from the check
- **Test strategy: unit** — duplicate detection logic

### Feat — GitHub config improvements

- [x] Realtime format validation on owner/repo field — must match `owner/repo` pattern, inline error if not
- [x] Informative error messages on sync failure — surface the specific cause (bad PAT, repo not found, wrong path) rather than a generic error
- [x] Auto-cancel sync when config changes mid-review — stale diff should not be applied against a different config
- **Test strategy: unit** — validation logic and diff cancellation

### Feat — GitHub sync UX fixes

- [x] Fix connection status mismatch — saving with an invalid PAT no longer writes `connectionHealth: 'error'` to the stored config; error stays local to the options form, leaving the valid stored config and sidebar dot unaffected
- [x] Fix options form initial status — `connectionStatus` now reads from `settings.github.connectionHealth` on load instead of always defaulting to `'connected'` when a config exists
- [x] Post-apply feedback — sidepanel shows a transient "Applied ✓" message below the sync button after a diff is applied, fading out after 2.5s; uses `handleApply` wrapper in `GitHubView` rather than touching the hook
- [x] Dev prefill — options form prefills PAT and repository fields from `VITE_GITHUB_*` env vars in development mode when no config is saved
- **Test strategy: none** — visual verification

### Fix — options page polish

- [x] Guard "Saved ✓" feedback in `site-config-section.tsx` — skip if no sites were modified
- [x] Per-site trigger validation: show error on blur only, not on every keystroke
- [x] Em dash audit — grep all rendered component strings for `—`; none found in rendered UI
- [x] UI copy audit — apply copy standards to options page and shared utils error messages
- **Test strategy: unit** — settings form logic; visual verification for copy

### Fix — GitHub tab state + docs

- [x] Lift `useGithubSync` from `GitHubView` into `PromptLibrary`; pass result as props so diff state survives tab switches
- [x] Expand `snippetsPath` hint in `github-section.tsx` to note that filename (without `.md`) becomes the snippet name and non-`.md` files are skipped
- **Test strategy: none** — manual verification

### Fix — import feedback copy

- [x] Replace count-only import result string with named changes: e.g. "Updated: summarize, refactor. Added: new-prompt."
- [x] Render Updated and Added on separate lines; dynamic timeout scaled to item count (`Math.max(3000, total * 800ms)`)
- **Test strategy: unit** — feedback string logic (`formatImportFeedback`)

### Feat — onboarding

- [x] First install empty state — onboarding hint shown only when prompt list is empty and no prompts have ever been created; uses key-existence check on `chrome.storage.local` (`prompts` key absent means fresh install); once any write to `prompts` occurs, `hasEverHadPrompts` flips to `true` permanently; deleted-all state shows "No prompts yet, click + New to add one."
- **Test strategy: unit** — empty state branching in `PromptList`

### Chore — governance compliance pass

- [x] Replace default exports with named exports across all entry points
- [x] Replace non-null assertions with explicit null checks
- [x] Rename boolean variables to follow `is/has/should/can` prefix convention
- [x] Add `.strict()` to Zod schemas at external data boundaries
- [x] Fix `describe()` label casing in test files
- [x] Add `AbortSignal.timeout()` to all external GitHub fetch calls

### Fix — e2e stale empty-state assertion

- [x] Update sidepanel empty-state assertion in `e2e/ui.test.ts` to match current onboarding copy
- **Test strategy: e2e** — `bun run test:e2e`

### Fix — options page fields reset on refresh

- [x] PAT, repository, and per-site config revert to defaults after refresh despite saved config
- **Test strategy: unit** — settings form initialization

### Fix — slash trigger conflict on Claude.ai and ChatGPT

- [x] Warn when trigger symbol is `/` on claude.ai or chatgpt.com — conflicts with their native slash command menus
- **Test strategy: unit** — validation logic

### Fix — options page UI polish

- [x] Tighten per-site config section typography and sizing
- [x] Align save button placement across sections — both left-aligned
- [x] Move GitHub disconnect into footer row with tooltip hint; remove separate bordered block
- [x] Update wireframes to reflect current options page layout and section order
- **Test strategy: none** — visual verification
