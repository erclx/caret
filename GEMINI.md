# Caret

Chrome extension (MV3) that lets users save reusable prompts and invoke them via a trigger symbol + fuzzy dropdown directly inside Claude.ai, Gemini, and ChatGPT.

## Behavior

- For any command that produces a FINAL COMMAND block, always show PREVIEW first. Never run a command without it.
- If the user responds with a short affirmation or clearly signals intent to proceed, execute the FINAL COMMAND immediately without re-explaining or re-previewing.

## Key Paths

- `src/content/` — injected UI and input detection per site
- `src/sidepanel/` — primary prompt library UI (extension icon opens this)
- `src/popup/` — dormant, kept for rollback only
- `src/options/` — per-site trigger config and settings page
- `src/shared/` — hooks, types, utils and components shared across entry points
- `manifest.config.ts` — extension manifest (entry points, permissions, icons)
- `.claude/` — planning docs (requirements, architecture, wireframes, design, tasks)
