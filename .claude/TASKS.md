# Tasks: SlashPrompt

## In Progress

- [ ] Planning & document setup

## Up Next

### Feature 1 — Prompt Storage Layer

- [ ] Define Zod schemas for `Prompt` and `Settings`
- [ ] Build typed `storage.ts` wrapper (get, set, subscribe)
- [ ] Build `usePrompts` hook (list, create, update, delete)
- [ ] Build `useSettings` hook (read/write per-site config)
- [ ] Unit test storage utils and hooks
- **Test strategy: unit** — pure logic, no DOM needed

### Feature 2 — Popup & Sidepanel Prompt Library UI

- [ ] PromptList component (list all prompts)
- [ ] PromptForm component (create/edit)
- [ ] Delete with confirmation
- [ ] Wire popup/sidepanel to usePrompts
- **Test strategy: unit** — component logic; e2e deferred

### Feature 3 — Options Page

- [ ] Per-site trigger symbol config UI
- [ ] Enable/disable per site toggle
- [ ] Wire to useSettings
- **Test strategy: unit** — settings form logic

### Feature 4 — Content Script: Input Detection

- [ ] Detect chat input per target site (Claude, Gemini, ChatGPT)
- [ ] Abstract input adapter (contenteditable vs textarea)
- [ ] Trigger symbol detection on keydown
- **Test strategy: integration** — needs real DOM shapes per site

### Feature 5 — Content Script: Dropdown

- [ ] Inject React root adjacent to input
- [ ] Fuzzy filter against prompt library
- [ ] Keyboard nav: ↑↓, Ctrl+J/K, Ctrl+N/P, Enter, Escape
- [ ] Position/reposition on resize
- **Test strategy: integration** — component + keyboard interaction

### Feature 6 — Prompt Insertion

- [ ] Insert at cursor for contenteditable (execCommand)
- [ ] Insert at cursor for textarea (InputEvent dispatch)
- [ ] Verify Claude.ai ProseMirror state updates correctly
- **Test strategy: e2e** — must verify real site behavior

### Feature 7 — JSON Export / Import

- [ ] Export prompts as JSON download
- [ ] Import from JSON file with Zod validation
- [ ] Handle merge conflicts (duplicate names)
- **Test strategy: unit** — pure parse/validate logic

## Done

## Blocked

- Claude.ai input insertion — ProseMirror compatibility unverified until Feature 6
