# Requirements

## Problem

Power users of AI chat tools (Claude.ai, Gemini, ChatGPT) repeatedly type the same prompts.
There's no native way to save, organize, and quickly invoke reusable prompt templates across these platforms.

## Goals

- Let users build a personal prompt library
- Invoke any prompt instantly via a configurable trigger symbol + fuzzy search dropdown, directly inside the chat input
- Work across Claude.ai, Gemini, and ChatGPT without conflicts
- Keep data local, private, and fast

## Non-goals

- Cloud sync or user accounts (MVP). GitHub sync is explicitly read-only and personal, not a backend or account system.
- Prompt variables/placeholders (MVP)
- Collaboration or shared libraries (MVP)
- Mobile or Firefox support (MVP)
- Floating badge or overlay injected into chat sites
- Categories or tags (bet on fuzzy search + slug naming conventions)
- Multi-paragraph / document-length prompts (sentence to paragraph max)
- Per-site theming / blending with host site styles (MVP)
- Push/write back to GitHub — extension is read-only; GitHub is source of truth

## MVP features

1. **Prompt library CRUD** — create, edit, delete prompts with a name (slug) and body text
2. **Trigger detection** — user types configurable symbol (default: `>`) in chat input → dropdown appears; only fires at position 0 or after whitespace, never mid-word
3. **Fuzzy filter dropdown** — command palette style, rendered above input, 6 visible rows, name + truncated body preview per row
4. **Keyboard nav** — ↑↓, Ctrl+J (down), Ctrl+P (up) to move; Enter to insert; Escape to dismiss
5. **Prompt insertion** — inserts prompt text at cursor position in the chat input
6. **Per-site trigger config** — configurable trigger symbol per site to avoid native conflicts (e.g. Claude.ai uses `/`)
7. **Side panel UI** — manage library from Chrome side panel; extension icon opens sidepanel; popup entry kept dormant for rollback
8. **Options page** — full settings including per-site trigger symbol config and GitHub sync config
9. **JSON export/import** — backup and restore prompt library
10. **GitHub sync** — pull snippets from a GitHub repo into the extension; manual sync only; GitHub is source of truth; read-only from extension side

## Tech Stack

- React 19 + TypeScript + Vite (via @crxjs/vite-plugin, Manifest V3)
- Tailwind v4
- shadcn/ui — headless, Tailwind-native, tree-shakeable
- lucide-react — icons
- Zod — schema validation for prompts and settings
- vitest (unit/integration), Playwright (e2e)
- chrome.storage.local

## UI Decisions

See `DESIGN.md` for all theme, token, typography, and component-specific decisions.

## Constraints

- Manifest V3 only
- No external backend for MVP
- Must not break native slash commands on Claude.ai
- chrome.storage.local (up to 10MB)
- GitHub PAT stored in chrome.storage.local — acceptable for personal use; not encrypted
