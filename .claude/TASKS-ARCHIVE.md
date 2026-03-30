# Tasks archive

Entries moved from TASKS.md when Done exceeded 10. Oldest first.

### Chore: planning & document setup

- [x] Set up planning docs and initial project structure
- [x] Configure design system: shadcn, zinc palette, Geist font, light/dark mode

> Test strategy: visual verification

### Feature 1: Prompt storage layer

- [x] Define Zod schemas for `Prompt` and `Settings`
- [x] Build typed `storage.ts` wrapper (get, set, subscribe)
- [x] Build `usePrompts` hook (list, create, update, delete)
- [x] Build `useSettings` hook (read/write per-site config)
- [x] Add `seeds.ts` with sample snippets mirroring `snippets/` folder content. Seed storage on init when `NODE_ENV === development` and storage is empty
- [x] Replace `src/test/smoke.test.ts` with unit tests for storage utils and hooks (don't create new test files, overwrite the existing smoke test)

> Test strategy: pure logic

### Feature 2: Popup & sidepanel prompt library UI

- [x] PromptList component (list all prompts)
- [x] PromptForm component (create/edit)
- [x] Delete with confirmation
- [x] Wire popup/sidepanel to usePrompts

> Test strategy: component logic

### Feature 3: Options page

- [x] Scaffold `src/options/` (app.tsx, index.html, main.tsx)
- [x] Per-site trigger symbol config UI
- [x] Enable/disable per site toggle
- [x] Wire to useSettings

> Test strategy: settings form logic

### Feature 4: Content script: Input detection

- [x] Detect chat input per target site (Claude, Gemini, ChatGPT)
- [x] Abstract input adapter (contenteditable vs textarea)
- [x] Trigger symbol detection on keydown. The symbol must be at position 0 or immediately preceded by whitespace. A mid-word trigger (e.g. `word>`) must not fire
- [x] Position/reposition on resize

> Test strategy: real DOM shapes per site

### Feature 5: Content script: Dropdown

- [x] Inject React root adjacent to input
- [x] Fuzzy filter against prompt library
- [x] Keyboard nav: ↑↓, Ctrl+J (down), Ctrl+P (up), Enter/Tab, Escape
- [x] Position/reposition on resize

> Test strategy: component and keyboard interaction

### Feature 6: Prompt insertion

- [x] Insert at cursor for contenteditable (execCommand)
- [x] Insert at cursor for textarea (InputEvent dispatch)
- [x] Verify Claude.ai ProseMirror state updates correctly
- [x] Rename `e2e/smoke.test.ts` → `e2e/ui.test.ts` then overwrite with real Playwright tests for insertion

### Chore: migrate to sidepanel

- [x] Manifest: remove `default_popup`, add sidepanel + permission
- [x] Background worker: `chrome.action.onClicked` → `chrome.sidePanel.open()`
- [x] Popup: keep code, add dormant comment
- [x] ARCHITECTURE.md: note sidepanel-primary decision, popup dormant

### Chore: add extension icons at all sizes

- [x] Create logo at 16, 32, 48, 128px
- [x] Wire into manifest as extension icons

### Feature: sidepanel UI

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
- [x] Empty state copy: "No prompts found." → "No prompts yet, click the extension icon to add one"
- [x] Scrollbar styling: thin 4px zinc thumb, transparent track, applied globally in `index.css` (textarea + dropdown list)

### Fix: minor UI & interaction

- [x] Inline "Settings saved" on save, fades after 2-3s
- [x] Add mousedown listener on document in `use-dropdown.ts`
- [x] Dismiss when click target is outside dropdown ref
- [x] Clean up listener in useEffect teardown

### Feature 7: JSON export / import

- [x] Export prompts as JSON download
- [x] Import from JSON file with Zod validation
- [x] Handle merge conflicts (duplicate names)

> Test strategy: parse and validate logic

### Feature 8: GitHub Sync

- [x] Add GitHub config to Settings schema: `pat`, `owner`, `repo`, `branch`, `snippetsPath`
- [x] GitHub config UI in options page (PAT input, repo details, save, connection status). Test connection before saving, only persist on success
- [x] Dedicated sync view in sidepanel: tab bar `[Prompts] [GitHub]`, connection status, last synced timestamp, snippet count, sync button
- [x] Fetch all `.md` files from configured `snippets/` path via GitHub Contents API
- [x] Map filename → slug (strip `.md`), file content → prompt body
- [x] Add `source?: 'github'` to `Prompt` schema. Sync only manages prompts it owns. Locally created prompts are excluded from the diff and untouched by apply
- [x] Diff view before confirming sync: apply surgically (add, update, remove), preserving `id` and `createdAt` for unchanged and updated prompts
- [x] Post-sync summary via `lastSyncedAt` / `lastSyncedCount` in settings
- [x] Dev seeding: seed GitHub config from `VITE_GITHUB_*` env vars in background `onInstalled`
- [x] Options page decomposed into `data-section.tsx`, `site-config-section.tsx`, `github-section.tsx`. `app.tsx` is the loading gate and composition only

> Test strategy: fetch parsing and mapping logic

### Chore: UI polish

- [x] Remove tooltip arrow artifact
- [x] Fix options page white flash on load
- [x] Prompt form layout: textarea fills available height, buttons always visible below it
- [x] Add PAT setup link in GitHub config section

> Test strategy: visual verification

### Feat: prompt list improvements

- [x] Name field: realtime kebab-case validation with inline error
- [x] Sort prompts by `updatedAt` descending. Local prompts before GitHub-sourced

> Test strategy: validation logic

### Chore: screenshot script rewrite

- [x] Capture options page (light + dark)
- [x] Remove stale popup captures
- [x] Add dropdown capture on mocked chat page
- [x] Add Gemini e2e insertion test (parity with Claude and ChatGPT)

> Test strategy: visual output, manually verified

### Feat: unsaved changes warning in prompt form

- [x] Warn before discarding a dirty form: Back and Cancel both trigger an inline confirmation row when values differ from initial. No warning if form is clean or new and empty
- [x] Two-anchor confirmation: Back shows confirmation at top replacing `← Back`. Cancel shows confirmation at bottom replacing Cancel/Save. Keep editing restores the replaced row

> Test strategy: dirty state detection

### Feat: prompt form improvements

- [x] Warn on duplicate name: prevent saving a prompt whose name already exists. Editing a prompt excludes itself from the check

> Test strategy: duplicate detection logic

### Feat: GitHub sync UX fixes

- [x] Fix connection status mismatch: saving with an invalid PAT no longer writes `connectionHealth: 'error'` to the stored config. The error stays local to the options form, leaving the valid stored config and sidebar dot unaffected
- [x] Fix options form initial status: `connectionStatus` now reads from `settings.github.connectionHealth` on load instead of always defaulting to `'connected'` when a config exists
- [x] Post-apply feedback: sidepanel shows a transient "Applied ✓" message below the sync button after a diff is applied, fading after 2.5s. Uses `handleApply` wrapper in `GitHubView` rather than touching the hook
- [x] Dev prefill: options form prefills PAT and repository fields from `VITE_GITHUB_*` env vars in development mode when no config is saved

> Test strategy: visual verification

### Feat: GitHub config improvements

- [x] Realtime format validation on owner/repo field: must match `owner/repo` pattern, inline error if not
- [x] Informative error messages on sync failure: surface the specific cause (bad PAT, repo not found, wrong path) rather than a generic error
- [x] Auto-cancel sync when config changes mid-review: stale diff should not be applied against a different config

> Test strategy: validation logic and diff cancellation

### Fix: options page polish

- [x] Guard "Saved ✓" feedback in `site-config-section.tsx`. Skip if no sites were modified
- [x] Per-site trigger validation: show error on blur only, not on every keystroke
- [x] Em dash audit: grep all rendered component strings for `—`. None found in rendered UI
- [x] UI copy audit: apply copy standards to options page and shared utils error messages

> Test strategy: settings form logic and visual verification

### Fix: import feedback copy

- [x] Replace count-only import result string with named changes: e.g. "Updated: summarize, refactor. Added: new-prompt."
- [x] Render Updated and Added on separate lines. Dynamic timeout scaled to item count (`Math.max(3000, total * 800ms)`)

> Test strategy: feedback string logic

### Feat: onboarding

- [x] First install empty state: the onboarding hint shows only when the prompt list is empty and no prompts have ever been created. Uses a key-existence check on `chrome.storage.local` (`prompts` key absent means fresh install). Once any write to `prompts` occurs, `hasEverHadPrompts` flips to `true` permanently. The deleted-all state shows "No prompts yet, click + New to add one."

> Test strategy: empty state branching

### Fix: GitHub tab state + docs

- [x] Lift `useGithubSync` from `GitHubView` into `PromptLibrary`. Pass result as props so diff state survives tab switches
- [x] Expand `snippetsPath` hint in `github-section.tsx` to note that filename (without `.md`) becomes the snippet name and non-`.md` files are skipped

> Test strategy: manual verification

### Chore: governance compliance pass

- [x] Replace default exports with named exports across all entry points
- [x] Replace non-null assertions with explicit null checks
- [x] Rename boolean variables to follow `is/has/should/can` prefix convention
- [x] Add `.strict()` to Zod schemas at external data boundaries
- [x] Fix `describe()` label casing in test files
- [x] Add `AbortSignal.timeout()` to all external GitHub fetch calls

### Fix: e2e stale empty-state assertion

- [x] Update sidepanel empty-state assertion in `e2e/ui.test.ts` to match current onboarding copy

> Test strategy: e2e

### Fix: options page fields reset on refresh

- [x] PAT, repository, and per-site config revert to defaults after refresh despite saved config

> Test strategy: settings form initialization

### Fix: slash trigger conflict on Claude.ai and ChatGPT

- [x] Warn when trigger symbol is `/` on claude.ai or chatgpt.com: conflicts with their native slash command menus

> Test strategy: validation logic

### Fix: options page UI polish

- [x] Tighten per-site config section typography and sizing
- [x] Align save button placement across sections: both left-aligned
- [x] Move GitHub disconnect into footer row with tooltip hint. Remove the separate bordered block
- [x] Update wireframes to reflect current options page layout and section order

> Test strategy: visual verification

### Fix: duplicate prompts on GitHub sync when local and remote share a name

- [x] Skip adding an incoming GitHub prompt during apply if a local prompt with the same name already exists. The local prompt is preserved and the GitHub entry is ignored

> Test strategy: name-collision case in sync apply

### Fix: Esc to cancel in edit form

- [x] Handle Esc in the prompt edit form: trigger the same dirty-state check as Back/Cancel (show confirmation if dirty, navigate immediately if clean). A second Esc dismisses the confirmation

> Test strategy: dirty-state and keyboard interaction

### Chore: test coverage, GitHub feature

- [x] Add unit tests for the GitHub sync flow: apply, cancel, error, and diff states
- [x] Add unit tests for the GitHub options section: save, disconnect, connection status

> Test strategy: sync and options section logic

### Chore: test coverage, data section and content input

- [x] Add unit tests for export and import handlers in the data section
- [x] Improve unit test coverage for the content script input detection and insertion paths

> Test strategy: data section and input detection

### Fix: focus ring thickness and clipping

- [x] Reduce focus ring width on buttons, inputs, and textareas: default width was visually heavy
- [x] Fix focus ring clipping on edge items in the scrollable prompt list and sidepanel header: parent clip cut off the ring

> Test strategy: visual verification

### Fix: trailing space after prompt insertion

- [x] Trim trailing whitespace from the prompt body and append a single space on insertion so the user can continue typing immediately. Prompts ending with spaces or newlines get the excess stripped rather than a double space appended

> Test strategy: insertion output

### Chore: logo

- [x] Design `>` glyph mark in a rounded-square container, zinc palette
- [x] Export as PNG at 16, 32, 48, and 128px for the manifest and store listing

> Test strategy: visual verification

### Chore: CI/CD pipeline

- [x] Add a GitHub Actions workflow: on version tag push, run checks, build, and zip the extension
- [x] Attach the zip to a GitHub Release with an auto-generated changelog
- [x] Automate Chrome Web Store publish after a successful release

> Test strategy: pipeline verified by test tag push

### Chore: Chrome Web Store listing

- [x] Write `README.md` with install instructions, feature overview, and supported sites
- [x] Write short description (132 char max) and full store description, drawing from the README
- [x] Add a privacy policy page hosted via GitHub Pages (extension requests `storage` and `sidePanel` permissions. Confirm whether `contentSettings` is still used and remove it from the manifest if not)
- [x] Produce at least one 1280×800 screenshot of the sidepanel in use. Compose manually as an OS-level screenshot with the sidepanel docked alongside a chat tab and the dropdown visual
- [x] Export a 440×280 promo tile for the Chrome Web Store small promo slot
- [x] Update the manifest display name to a human-readable value and add a `short_name`
- [x] Register developer account ($5 one-time fee) if not done. This blocks submission
- [x] Fill in Privacy practices tab: single purpose description, host permission justification, remote code justification, sidePanel and storage justifications, data usage certification
- [x] Add and verify contact email on the Account tab
- [x] Submit for review

> Test strategy: Chrome Web Store human review

### Chore: demo

- [x] Record raw capture in OBS Studio at 1920×1080 using FancyZones: side panel docked alongside claude.ai, showing create prompt → type `>` → filter → insert
- [x] Edit in DaVinci Resolve: zoom in on side panel during prompt creation, zoom in on chat input when dropdown appears, add minimal on-screen labels (`"Click Caret icon"`, `"Type > to invoke"`, `"Enter to insert"`), trim to 30–40 seconds
- [x] Export as `store/demo.mp4`
- [x] Add to `README.md` once the file exists

> Test strategy: visual verification

### Fix: GitHub sync CORS error with PAT configured

- [x] Fix CORS failure when syncing snippets with a PAT configured. The auth header on the file fetch triggered a preflight that GitHub's raw content server rejects

> Test strategy: manual verification in installed extension with PAT configured
