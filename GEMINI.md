# SlashPrompt

Chrome extension (MV3) that lets users save reusable prompts and invoke them via a trigger symbol + fuzzy dropdown directly inside Claude.ai, Gemini, and ChatGPT.

## Key Paths

- `src/content/` — injected UI and input detection per site
- `src/popup/` + `src/sidepanel/` — prompt library management
- `src/shared/` — hooks, types, utils shared across entry points
- `.claude/` — planning docs (requirements, architecture, tasks)
