# Caret

Chrome extension (MV3) that lets users save reusable prompts and invoke them via a trigger symbol + fuzzy dropdown directly inside Claude.ai, Gemini, and ChatGPT.

## Key Paths

- `src/content/` — injected UI and input detection per site
- `src/popup/` + `src/sidepanel/` — prompt library management
- `src/options/` — per-site trigger config and settings page
- `src/shared/` — hooks, types, utils shared across entry points
- `.claude/` — planning docs (requirements, architecture, tasks)

## Before Making Changes

- Check `.claude/TASKS.md` for current scope and status
- Check `.claude/ARCHITECTURE.md` for decisions already made
