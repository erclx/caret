# Tasks

Track what is being built and why, at the level of features and outcomes. Not implementation steps or technical decisions. Those live in `ARCHITECTURE.md`. Update this doc whenever a task is started, completed, or scope changes.

What belongs:

- Task entries describing what and why: short bullet per item, one outcome per line
- A test strategy line per task: the type of test and a brief justification, not specific file or method names
- Inline notes on blockers or dependencies, attached to the relevant Up next entry

What does not belong:

- Class names, file paths, function names, or prop names in any entry or section title
- "In progress" or "Blocked" sections. Note those inline on the Up next entry instead
- How something will be implemented

Two sections only: Up next and Done. When completing a task, mark it `[x]` in place within "Up next" and do not move it. Done is capped at 10 entries. Oldest entries overflow to `.claude/TASKS-ARCHIVE.md`. When Up next has no real tasks, keep the `### Nothing queued` placeholder. Remove it when adding the first real task.

## Up next

### Chore: re-record demo for labels

- [ ] Record, edit, and export a new demo following `store/demo.md`. The existing demo predates labels and does not show filter pills or `label · name` display
- [ ] Upload to YouTube and update the link in `README.md`

> Test strategy: visual verification

## Done

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
