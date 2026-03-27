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

Two sections only: Up next and Done. When completing a task, mark it `[x]` in place within "Up next"; do not move it. Done is capped at 10 entries; oldest entries overflow to `.claude/TASKS-ARCHIVE.md`.

## Up next

### Fix: GitHub sync skips prompt with matching key but different body silently

- [ ] When a local prompt and an incoming GitHub snippet share the same composite key but have different bodies, sync currently reports the prompt as up to date rather than flagging it as skipped or changed; surface the distinction to the user

> Test strategy: unit test for the diff case; manual verification in installed extension

### Fix: import feedback is noisy with many entries

- [ ] The inline feedback string after a bulk import becomes hard to read when many prompts are updated or added; redesign the feedback to be scannable regardless of entry count

> Test strategy: visual verification with a large import fixture

## Done

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
- [x] Add a privacy policy page hosted via GitHub Pages (required: extension requests `storage` and `sidePanel` permissions; confirm whether `contentSettings` is still used and remove it from the manifest if not)
- [x] Produce at least one 1280×800 screenshot of the sidepanel in use; compose manually as an OS-level screenshot with the sidepanel docked alongside a chat tab and the dropdown visual
- [x] Export a 440×280 promo tile for the Chrome Web Store small promo slot
- [x] Update the manifest display name to a human-readable value and add a `short_name`
- [x] Register developer account ($5 one-time fee) if not done; this blocks submission
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

- [x] Fix CORS failure when syncing snippets with a PAT configured; the auth header on the file fetch triggered a preflight that GitHub's raw content server rejects

> Test strategy: manual verification in installed extension with PAT configured

### Feature: labels

- [x] Add `label?: string` to `PromptSchema`; update import merge key to `(label, name)` composite
- [x] Update GitHub sync to recurse one level into subdirectories and derive label from folder name; update diff identity key to `(label, name)` composite
- [x] Add label field to the prompt edit form with clickable label chips; validate uniqueness per `(label, name)` pair
- [x] Add label filter pills to the sidepanel list view; apply alongside text search with AND logic
- [x] Show `label · name` in trigger dropdown rows for labeled prompts

> Test strategy: unit tests for schema boundary, merge composite key, diff composite key and subdirectory fetch, form per-label uniqueness validation, filter pills rendering and interaction
