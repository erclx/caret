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

### Chore: test coverage, data section and content input

- [ ] Add unit tests for export and import handlers in the data section
- [ ] Improve unit test coverage for the content script input detection and insertion paths
- **Test strategy:** unit tests

### Chore: logo

- [ ] Design logo in Figma
- **Test strategy: none**: visual verification

## Done

### Fix: options page polish

- [x] Guard "Saved ✓" feedback in `site-config-section.tsx`; skip if no sites were modified
- [x] Per-site trigger validation: show error on blur only, not on every keystroke
- [x] Em dash audit: grep all rendered component strings for `—`; none found in rendered UI
- [x] UI copy audit: apply copy standards to options page and shared utils error messages
- **Test strategy: unit**: settings form logic; visual verification for copy

### Fix: GitHub tab state + docs

- [x] Lift `useGithubSync` from `GitHubView` into `PromptLibrary`; pass result as props so diff state survives tab switches
- [x] Expand `snippetsPath` hint in `github-section.tsx` to note that filename (without `.md`) becomes the snippet name and non-`.md` files are skipped
- **Test strategy: none**: manual verification

### Fix: import feedback copy

- [x] Replace count-only import result string with named changes: e.g. "Updated: summarize, refactor. Added: new-prompt."
- [x] Render Updated and Added on separate lines; dynamic timeout scaled to item count (`Math.max(3000, total * 800ms)`)
- **Test strategy: unit**: feedback string logic (`formatImportFeedback`)

### Feat: onboarding

- [x] First install empty state: onboarding hint shown only when prompt list is empty and no prompts have ever been created; uses key-existence check on `chrome.storage.local` (`prompts` key absent means fresh install); once any write to `prompts` occurs, `hasEverHadPrompts` flips to `true` permanently; deleted-all state shows "No prompts yet, click + New to add one."
- **Test strategy: unit**: empty state branching in `PromptList`

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
