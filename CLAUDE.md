# Caret

Chrome extension (MV3) that lets users save reusable prompts and invoke them via a trigger symbol + fuzzy dropdown directly inside Claude.ai, Gemini, and ChatGPT.

## Key paths

- `src/content/` — injected UI and input detection per site
- `src/sidepanel/` — primary prompt library UI (extension icon opens this)
- `src/popup/` — dormant, kept for rollback only
- `src/options/` — per-site trigger config and settings page
- `src/shared/` — hooks, types, utils and components shared across entry points
- `manifest.config.ts` — extension manifest (entry points, permissions, icons)
- `.claude/` — planning docs (requirements, architecture, wireframes, design, tasks)

## Collaboration rules

- Reason through the approach and confirm with the user before making any edits
- After implementing changes, run `bun run format && bun run lint && bun run test:run`

## Before making changes

- Check `.claude/TASKS.md` for current scope and status
- Check `.claude/ARCHITECTURE.md` for decisions already made
- Check `.claude/WIREFRAMES.md` for intended UI layout and behavior
- Check `.claude/DESIGN.md` for tokens, typography, spacing, and component rules
- Check `.claude/REQUIREMENTS.md` for feature scope and non-goals
