# Tasks archive

Completed tasks moved here from `TASKS.md`. Oldest entries at the top, newest at the bottom.

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

### Feature: labels

- [x] Add `label?: string` to `PromptSchema`. Update import merge key to `(label, name)` composite
- [x] Update GitHub sync to recurse one level into subdirectories and derive label from folder name. Update diff identity key to `(label, name)` composite
- [x] Add label field to the prompt edit form with clickable label chips. Validate uniqueness per `(label, name)` pair
- [x] Add label filter pills to the sidepanel list view. Apply alongside text search with AND logic
- [x] Show `label · name` in trigger dropdown rows for labeled prompts

> Test strategy: unit tests for schema boundary, merge composite key, diff composite key and subdirectory fetch, form per-label uniqueness validation, filter pills rendering and interaction

### Fix: GitHub sync skips prompt with matching key but different body silently

- [x] When a local prompt and an incoming GitHub snippet share the same composite key but have different bodies, sync currently reports the prompt as up to date rather than flagging it as skipped or changed. Surface the distinction to the user

> Test strategy: unit test for the diff case, manual verification in installed extension

### Fix: import feedback is noisy with many entries

- [x] The inline feedback string after a bulk import becomes hard to read when many prompts are updated or added. Redesign the feedback to be scannable regardless of entry count

> Test strategy: visual verification with a large import fixture

### Chore: manual test fixture system

- [x] Create a manual testing folder at repo root with subfolders per feature area: import-export, github-sync, sidepanel, trigger, and dark-mode
- [x] Populate import-export with five JSON fixtures (single, multi, overflow, empty, invalid) and a verification checklist covering export, import feedback, idempotency, truncation, and round-trip
- [x] Add verification checklists for github-sync and sidepanel GitHub tab, sidepanel CRUD and filtering, trigger and dropdown on real sites, and dark mode
- [x] Add a docs overview page describing each folder and linking to its checklist
- [x] Add project instruction rules to keep fixtures and checklists current on feature changes and to review them before shipping
- [x] Leave seeds independent of fixtures: they serve different purposes and coupling them creates drift

> Test strategy: visual verification. Load each fixture in the extension and confirm the expected feedback message and prompt state.

### Fix: dropdown screenshots missing the dropdown

- [x] Both dropdown captures showed only the textarea because the trigger was typed before the extension was ready. Add synchronization so the dropdown appears correctly in both light and dark shots.

> Test strategy: visual verification of regenerated screenshots

### Fix: UI polish across sidepanel, options, and dropdown

- [x] Give "Keep editing" and delete "Cancel" buttons a visible border so they are distinguishable inside the destructive confirmation banner
- [x] Support Cmd+J/P on Mac in the dropdown keyboard handler alongside existing Ctrl+J/P
- [x] Remove leftover debug log calls from the background service worker
- [x] Add a focus ring to the "Create a token on GitHub" link in the GitHub section
- [x] Add a focus ring to the per-site configuration checkbox
- [x] Add bottom padding to the sidepanel list container so the GitHub tab button focus ring is not clipped
- [x] Move the discard confirmation to always appear at the bottom of the form, keeping the Back button visible at all times

> Test strategy: visual verification across light and dark modes, plus keyboard navigation smoke test in the installed extension

### Feature: scalable label UI

- [x] Replace sidepanel label filter pills row with a filter button + popover (checkbox list, multi-select, badge shows active count, scales to any number of labels)
- [x] Replace edit form label input + chips with a combobox (dropdown of existing labels on focus or match, free-text still accepted, no pills below)

> Test strategy: unit tests for filter popover toggle logic and combobox selection, visual verification with 10+ labels in both surfaces

### Fix: label UI keyboard and focus gaps

- [x] Label combobox option items are tab-reachable and show the browser default focus outline. They should be navigable by arrow keys only
- [x] Pressing Tab on the label field does not close the combobox dropdown before focus moves to the next field
- [x] Clicking the padding area of a filter row does not toggle the filter
- [x] Clearing the label via the inline clear button leaves focus on the button rather than returning it to the label field

> Test strategy: keyboard navigation smoke test in the installed extension, visual verification that all focus rings match the project style

### Fix: edit form bugs and polish

- [x] Dropdown shows "No prompts yet" when a query matches nothing. Show a distinct no-results message instead
- [x] Empty prompt body can be submitted. Validate body emptiness and block save consistently with how name validation works
- [x] Duplicate-pair error appears under the name field when a label change causes the conflict. Surface it under the label field instead
- [x] No feedback after a successful save. Add a brief signal before returning to the list
- [x] Label field accepts leading/trailing whitespace without warning and is case-sensitive with no hint. Trim visibly and surface the case-sensitivity constraint

> Test strategy: unit tests for dropdown empty-vs-no-match state, form save-disabled logic with empty body, and label trimming. Visual verification of error placement and save feedback

### Fix: confirmation row visual weight

- [x] Discard-changes row in the edit form shows a red container and red label text alongside the destructive button. Only the button reads as destructive when done
- [x] Delete confirm row in the prompt list has the same pattern. Only the button reads as destructive when done

> Test strategy: visual, light and dark verification in the installed extension

### Fix: label UI affordance and popover focus

- [x] Label combobox has no visual or semantic signal that it opens a dropdown. Make it recognizable as a combobox
- [x] Filter popover opens with focus on the second checkbox instead of the first

> Test strategy: keyboard navigation smoke test in the installed extension, visual verification of the combobox in light and dark modes

### Chore: add screenshot for filter zero-results state

- [x] Screenshot script has no capture of the zero-results filter state. Light and dark captures of the "No prompts found." empty state exist when done
- [x] Screenshot script has no capture of the sidepanel GitHub workflow. Light and dark captures of not configured, never synced, and diff view exist
- [x] Screenshot script has no capture of dropdown edge cases. Light and dark captures of zero-results and empty library states exist
- [x] Screenshot script has no capture of the sidepanel deleted-all empty state. Light and dark captures exist
- [x] Screenshot script has no capture of the options error states. Light and dark captures of the trigger conflict and GitHub connection errors exist

> Test strategy: visual, run the screenshot script and confirm the new captures appear

### Fix: GitHub options state and validation

- [x] Connection status dot stays green when the user edits repo or PAT fields without saving. Reset to neutral on any field change
- [x] Save is not blocked when owner/repo is empty and the field has never been touched. Block save until the field has a valid value
- [x] Empty snippets path shows no warning before save. Add inline validation
- [x] GitHub-synced prompts are visually identical to local ones in the list. Add a subtle indicator so users know which prompts are managed by sync and may be overwritten
- [x] Add a warning banner to the edit form for GitHub-synced prompts so users know local edits will be overwritten

> Test strategy: visual verification of each state transition and the sync indicator in the installed extension

### Fix: label hint clutters the prompt form

- [x] Replace the inline "Labels are case-sensitive." text with a tooltip icon next to the Label field label

> Test strategy: component, verify tooltip renders and inline hint is gone

### Fix: label combobox dropdown blends into the panel in dark mode

- [x] Add a visible ring in dark mode so the dropdown is visually separated from the panel background
- [x] Add an e2e screenshot capturing the edit form with the label dropdown open

> Test strategy: visual, verify dropdown is distinct in dark mode. E2e screenshot confirms capture succeeds

### Fix: GitHub sync status line flickers after apply

- [x] Spam-clicking "Sync now" after applying no longer flickers between "Up to date" and "Synced just now" during fetch
- [x] Status line shows "Up to date · N" immediately after applying, without briefly reverting to "Synced just now"
- [x] Concurrent sync calls are blocked: clicks during an in-flight fetch are ignored

> Test strategy: manual, spam sync button after apply and verify the status line stays stable

### Fix: GitHub sync button label flickers during fetch

- [x] "Fetching…" text removed from the sync button label. The spinner conveys in-progress state. The label stays "Sync now" throughout so it does not flash on fast fetches

> Test strategy: manual, trigger a sync and confirm the button label stays stable

### Fix: GitHub sync guard and state correctness

- [x] Clicking "Sync now" while a stale review is showing silently no-oped. The guard now resets stale diff state and proceeds with a fresh fetch
- [x] A fetch error while upToDateCount is set shows "Up to date · N" alongside the error message. Clear upToDateCount on fetch error
- [x] Cancelling after a fetch that found differences leaves a stale "Up to date · N" count visible. Clear upToDateCount on cancel

> Test strategy: manual, verify each edge case in the installed extension

### Feat: "Up to date ✓" transient after no-changes sync

- [x] After a sync that finds no changes, "Up to date ✓" appears below the sync button and fades after 2.5s, confirming the check ran

> Test strategy: manual, trigger a no-changes sync and confirm the transient appears and fades

### Fix: site config Save silently no-ops when nothing changed

- [x] Clicking Save when no fields differ from stored values gives no feedback, leaving the user unable to tell whether save succeeded or was skipped

> Test strategy: manual, click Save with no changes and verify feedback

### Fix: branch field has no empty guard in GitHub section

- [x] Clearing the branch field and saving succeeds with no inline error. Failure surfaces as a network error at sync time.

> Test strategy: manual, clear branch, save, observe no inline error

### Fix: body validation timing is inconsistent with name validation

- [x] Body error only fires on blur. Name error fires on every keystroke. Clearing body while focused shows no feedback until tab-away.

> Test strategy: manual, clear body while focused and verify no error appears until blur

### Fix: GitHub sync view has multiple feedback gaps

- [x] RefreshCw icon does not spin during `applying` state, only during `fetching`
- [x] Status line reads "Up to date · N snippets" after an apply, which implies a fresh check rather than a completed write
- [x] The "local" badge on skipped diff entries is cryptic. Users without context cannot tell it means the local version was preserved.

> Test strategy: manual, verify spinner, status line, and diff labels across fetch → review → apply flow

### Fix: wrong empty state shown after filtering and deleting the last matching prompt

- [x] Prompt list shows a context-aware empty state when filtered results are empty but unfiltered prompts exist

> Test strategy: component, verifying empty state message matches filtered vs. unfiltered context

### Fix: export gives no feedback

- [x] Clicking Export shows a brief confirmation that the file was downloaded

> Test strategy: manual, verifying feedback appears after clicking Export

### Fix: filter empty state gives no recovery path

- [x] "No prompts found." becomes "No prompts match your search." with a hint-weight secondary line: "Clear your search to see all."
- [x] When a label filter causes zero results, the empty state includes a "Clear filter" link that removes the active label filters

> Test strategy: component, verifying updated copy and the clear link appear when a filter is active with no results

### Fix: export runs silently with an empty library

- [x] Clicking Export when there are no prompts shows a brief inline message instead of downloading an empty file

> Test strategy: manual, verifying the message appears when the library is empty

### Fix: delete confirm row gives no keyboard dismissal hint

- [x] Pressing Escape while a confirm row is open cancels the deletion and restores the prompt row

> Test strategy: component, verifying Escape dismisses the confirm row without calling onDelete

### Fix: diff review gives no reason when apply is disabled

- [x] When all fetched entries are kept local (skipped), the review view explains that nothing can be applied

> Test strategy: visual, verify the message appears when a sync produces only skipped entries

### Fix: edit form shows no feedback when save fails

- [x] If saving a prompt fails, an inline error appears so the user knows the write did not succeed

> Test strategy: component, verifying the error renders when onSave rejects

### Chore: refresh the store demo

- [x] The existing demo is outdated and does not reflect current features. Record, edit, and export a replacement following the demo brief
- [x] Upload to YouTube and update the link in `README.md`

> Test strategy: visual verification

### Fix: confirmation row label is too faint to read

- [x] "Delete?" and "Discard changes?" labels use full-contrast foreground text in both dark and light modes

> Test strategy: visual, verify label reads clearly against the muted row background in both themes
