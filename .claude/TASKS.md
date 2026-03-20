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

### Chore: logo

- [ ] Design logo in Figma
- **Test strategy: none**: visual verification

## Done

### Chore: governance compliance pass

- [x] Replace default exports with named exports across all entry points
- [x] Replace non-null assertions with explicit null checks
- [x] Rename boolean variables to follow `is/has/should/can` prefix convention
- [x] Add `.strict()` to Zod schemas at external data boundaries
- [x] Fix `describe()` label casing in test files
- [x] Add `AbortSignal.timeout()` to all external GitHub fetch calls

### Fix: e2e stale empty-state assertion

- [x] Update sidepanel empty-state assertion in `e2e/ui.test.ts` to match current onboarding copy
- **Test strategy: e2e**: `bun run test:e2e`

### Fix: options page fields reset on refresh

- [x] PAT, repository, and per-site config revert to defaults after refresh despite saved config
- **Test strategy: unit**: settings form initialization

### Fix: slash trigger conflict on Claude.ai and ChatGPT

- [x] Warn when trigger symbol is `/` on claude.ai or chatgpt.com: conflicts with their native slash command menus
- **Test strategy: unit**: validation logic

### Fix: options page UI polish

- [x] Tighten per-site config section typography and sizing
- [x] Align save button placement across sections: both left-aligned
- [x] Move GitHub disconnect into footer row with tooltip hint; remove separate bordered block
- [x] Update wireframes to reflect current options page layout and section order
- **Test strategy: none**: visual verification

### Fix: Esc to cancel in edit form

- [x] Handle Esc in the prompt edit form: trigger the same dirty-state check as Back/Cancel (show confirmation if dirty, navigate immediately if clean); second Esc dismisses the confirmation
- **Test strategy: unit and e2e**: unit covers dirty-state logic; e2e covers keyboard interaction in the real extension page

### Chore: test coverage, GitHub feature

- [x] Add unit tests for the GitHub sync flow: apply, cancel, error, and diff states
- [x] Add unit tests for the GitHub options section: save, disconnect, connection status
- **Test strategy: unit**: no new behavior introduced; tests verify existing sync and options section logic

### Chore: test coverage, data section and content input

- [x] Add unit tests for export and import handlers in the data section
- [x] Improve unit test coverage for the content script input detection and insertion paths
- **Test strategy: unit**: no new behavior introduced; tests verify existing data section and adapter/detector logic

### Fix: focus ring thickness and clipping

- [x] Reduce focus ring width on buttons, inputs, and textareas: 3px was visually heavy
- [x] Fix focus ring clipping on edge items in the scrollable prompt list and sidepanel header: parent `overflow-hidden` cut off the ring
- **Test strategy: none**: visual verification

### Fix: trailing space after prompt insertion

- [x] Trim trailing whitespace from the prompt body and append a single space on insertion so the user can continue typing immediately; prompts ending with spaces or newlines get the excess stripped rather than a double space appended
- **Test strategy: unit**: insertion output in detector
