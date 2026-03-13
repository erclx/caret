# Caret

Chrome extension (MV3) that lets users save reusable prompts and invoke them via a trigger symbol + fuzzy dropdown directly inside Claude.ai, Gemini, and ChatGPT.

## Key Paths

- `src/content/` — injected UI and input detection per site
- `src/sidepanel/` — primary prompt library UI (extension icon opens this)
- `src/popup/` — dormant, kept for rollback only
- `src/options/` — per-site trigger config and settings page
- `src/shared/` — hooks, types, utils and components shared across entry points
- `manifest.config.ts` — extension manifest (entry points, permissions, icons)
- `.claude/` — planning docs (requirements, architecture, wireframes, design, tasks)
