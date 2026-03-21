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

### Chore: Chrome Web Store listing

- [ ] Write `README.md` with install instructions, feature overview, and supported sites
- [ ] Write short description (132 char max) and full store description, drawing from the README
- [ ] Add a privacy policy page hosted via GitHub Pages (required: extension requests `storage` and `sidePanel` permissions; confirm whether `contentSettings` is still used and remove it from the manifest if not)
- [ ] Produce at least one 1280×800 screenshot of the sidepanel in use; compose manually as an OS-level screenshot with the sidepanel docked alongside a chat tab and the dropdown visible
- [ ] Export a 440×280 promo tile for the Chrome Web Store small promo slot
- [ ] Update the manifest display name to a human-readable value and add a `short_name`
- [ ] Register developer account ($5 one-time fee) if not done; this blocks submission
- [ ] Submit for review
- **Test strategy: none**: human review by Chrome Web Store team

### Chore: demo

- [ ] Record a short screen capture showing trigger invocation, prompt selection, and insertion across at least one supported site
- [ ] Export as GIF or MP4 for use in the README and store listing
- **Test strategy: none**: visual verification

### Chore: visual UI testing

- [ ] Add Playwright screenshot baselines for sidepanel list, edit form, GitHub tab (not-configured state), and options page
- [ ] Wire screenshot comparisons into CI to catch regressions on every PR once baselines are stable
- **Test strategy: visual regression via Playwright screenshots**

## Done

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

### Chore: logo

- [x] Design `>` glyph mark in a 4px rounded-square container, zinc palette, matching DESIGN.md tokens
- [x] Export as PNG at 16, 32, 48, and 128px for the manifest and store listing
- **Test strategy: none**: visual verification

### Chore: CI/CD pipeline

- [x] Add a GitHub Actions workflow: on version tag push, run `bun run format && bun run lint && bun run test:run && bun run test:e2e`, then build and zip `dist/`
- [x] Attach the zip to a GitHub Release with an auto-generated changelog via `changelogithub`
- [x] Automate Chrome Web Store publish via `chrome-web-store-upload-cli` after a successful release
- **Test strategy: none**: pipeline correctness verified by a test tag push
