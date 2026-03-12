# Tasks

## In progress

## Up next

### Feature 3 — Options page

- [ ] Scaffold `src/options/` (app.tsx, index.html, main.tsx) — not yet in repo
- [ ] Per-site trigger symbol config UI
- [ ] Enable/disable per site toggle
- [ ] Wire to useSettings
- **Test strategy: unit** — settings form logic

### Feature 4 — Content script: Input detection

- [ ] Detect chat input per target site (Claude, Gemini, ChatGPT)
- [ ] Abstract input adapter (contenteditable vs textarea)
- [ ] Trigger symbol detection on keydown — symbol must be at position 0 or immediately preceded by whitespace; mid-word trigger (e.g. `word>`) must not fire
- [ ] Position/reposition on resize
- **Test strategy: integration** — needs real DOM shapes per site

### Feature 5 — Content script: Dropdown

- [ ] Inject React root adjacent to input
- [ ] Fuzzy filter against prompt library
- [ ] Keyboard nav: ↑↓, Ctrl+J/K, Ctrl+N/P, Enter, Escape
- [ ] Position/reposition on resize
- **Test strategy: integration** — component + keyboard interaction

### Feature 6 — Prompt insertion

- [ ] Insert at cursor for contenteditable (execCommand)
- [ ] Insert at cursor for textarea (InputEvent dispatch)
- [ ] Verify Claude.ai ProseMirror state updates correctly
- [ ] Rename `e2e/smoke.test.ts` → `e2e/ui.test.ts` then overwrite with real Playwright tests for insertion (don't create new test files — overwrite the existing smoke test)
- **Test strategy: e2e** — must verify real site behavior

### Feature 7 — JSON export / import

- [ ] Export prompts as JSON download
- [ ] Import from JSON file with Zod validation
- [ ] Handle merge conflicts (duplicate names)
- **Test strategy: unit** — pure parse/validate logic

### Feature 8 — GitHub Sync

- [ ] Add GitHub config to Settings schema: `pat`, `owner`, `repo`, `branch`, `snippetsPath`
- [ ] GitHub config UI in options page (PAT input, repo details)
- [ ] Dedicated sync view in sidepanel: connection status, last synced timestamp, snippet count, sync button
- [ ] Fetch all `.md` files from configured `snippets/` path via GitHub Contents API
- [ ] Map filename → slug (strip `.md`), file content → prompt body; full replace on sync
- [ ] Show post-sync summary: how many snippets added/updated/removed
- [ ] Diff view before confirming sync: list of changes (add/update/delete) per snippet
- **Test strategy: unit** — fetch parsing and mapping logic; e2e deferred (requires live PAT)

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

## Blocked

- Claude.ai input insertion — ProseMirror compatibility unverified until Feature 6
