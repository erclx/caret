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

## Memory

- Write all memory files to `.claude/memory/`, not `~/.claude/projects/`

## Collaboration rules

- Follow `standards/prose.md` for all document edits
- When editing any doc, read surrounding content first and match its depth, length, and tone
- Reason through the approach and confirm with the user before making any edits
- After implementing changes, run `bun run format && bun run lint && bun run test:run && bun run test:e2e`
- After editing `e2e/screenshot.ts`, run `bun run screenshot` to verify all captures succeed

## Before making changes

- Check `.claude/TASKS.md` for current scope and status
- Check `.claude/ARCHITECTURE.md` for decisions already made
- Check `.claude/WIREFRAMES.md` for intended UI layout and behavior
- Check `.claude/DESIGN.md` for tokens, typography, spacing, and component rules
- Check `.claude/REQUIREMENTS.md` for feature scope and non-goals
- Check `.claude/GOV.md` for coding standards before writing or editing any code
