# Requirements: SlashPrompt

## Problem

Power users of AI chat tools (Claude.ai, Gemini, ChatGPT) repeatedly type the same prompts.
There's no native way to save, organize, and quickly invoke reusable prompt templates across these platforms.

## Goals

- Let users build a personal prompt library
- Invoke any prompt instantly via a configurable trigger symbol + fuzzy search dropdown, directly inside the chat input
- Work across Claude.ai, Gemini, and ChatGPT without conflicts
- Keep data local, private, and fast

## Non-Goals

- Cloud sync or user accounts (MVP)
- Prompt variables/placeholders (MVP)
- Collaboration or shared libraries (MVP)
- Mobile or Firefox support (MVP)
- Floating badge or overlay injected into chat sites
- Categories or tags (bet on fuzzy search + slug naming conventions)
- Multi-paragraph / document-length prompts (sentence to paragraph max)
- Per-site theming / blending with host site styles (MVP)

## MVP Features

1. **Prompt library CRUD** — create, edit, delete prompts with a name (slug) and body text
2. **Trigger detection** — user types configurable symbol (default: `>`) in chat input → dropdown appears
3. **Fuzzy filter dropdown** — command palette style, rendered above input, 6 visible rows, name + truncated body preview per row
4. **Keyboard nav** — ↑↓, Ctrl+J/K, Ctrl+N/P to move; Enter to insert; Escape to dismiss
5. **Prompt insertion** — inserts prompt text at cursor position in the chat input
6. **Per-site trigger config** — configurable trigger symbol per site to avoid native conflicts (e.g. Claude.ai uses `/`)
7. **Popup UI** — manage library from extension icon popup
8. **Side panel UI** — manage library from Chrome side panel
9. **Options page** — full settings including per-site trigger symbol config
10. **JSON export/import** — backup and restore prompt library

## Nice to Have

- Prompt variables/placeholders (`{{topic}}`)
- Categories or tags
- Usage count / recently used sorting
- Cloud sync (backend)
- Additional site support beyond initial three
- Per-site theming to blend with host UI

## Tech Stack

- React 19 + TypeScript + Vite (via @crxjs/vite-plugin, Manifest V3)
- Tailwind v4
- shadcn/ui — headless, Tailwind-native, tree-shakeable
- lucide-react — icons
- Zod — schema validation for prompts and settings
- vitest (unit/integration), Playwright (e2e)
- chrome.storage.local

## UI Decisions

- **Theme** — follows system `prefers-color-scheme`; single unified theme across all sites
- **Dropdown style** — command palette (Linear/Raycast feel)
- **Dropdown position** — above the chat input (correct for bottom-anchored inputs on all three sites)
- **Dropdown rows** — 6 visible before scrolling; name + truncated body preview per row
- **Empty state** — inline hint: "No prompts yet — click the extension icon to add one"
- **Extension icon** — clean, no badge

## Constraints

- Manifest V3 only
- No external backend for MVP
- Must not break native slash commands on Claude.ai
- chrome.storage.local (up to 10MB)
