# Requirements

Describe what the product does and why. Not how it works. That lives in ARCHITECTURE.md. Update this doc when scope changes, goals shift, or a non-goal is promoted to a feature.

What belongs:

- The problem being solved and for whom
- User-facing goals stated as outcomes, not implementation
- Explicit non-goals: scope boundaries that prevent feature creep. Mark deferred items "(deferred)" to signal they are not permanently excluded.
- MVP features as a numbered list: feature name and one-line description. No implementation detail.
- Tech stack as a plain list of tools. Rationale lives in ARCHITECTURE.md.
- Hard constraints that shape all decisions

What does not belong:

- Implementation details, API names, or internal component references
- Rationale for tech choices. That lives in ARCHITECTURE.md.
- Anything that describes how a feature is built rather than what it does

## Problem

Power users of AI chat tools (Claude.ai, Gemini, ChatGPT) repeatedly type the same prompts.
There's no native way to save, organize, and quickly invoke reusable prompt templates across these platforms.

## Goals

- Let users build a personal prompt library
- Invoke any prompt instantly via a configurable trigger symbol + fuzzy search dropdown, directly inside the chat input
- Work across Claude.ai, Gemini, and ChatGPT without conflicts
- Keep data local, private, and fast

## Non-goals

- Cloud sync or user accounts. GitHub sync is read-only and personal, not a backend or account system.
- Collaboration or shared libraries. GitHub sync covers the read-only sharing case. Real-time or multi-user collaboration is out.
- Mobile or Firefox support
- Floating badge or overlay injected into chat sites
- Per-site theming / blending with host site styles
- Push/write back to GitHub: the extension is read-only and GitHub is source of truth

## MVP features

1. Prompt library CRUD: create, edit, delete prompts with a name (slug) and body text
2. Trigger detection: user types configurable symbol (default: `>`) in chat input. Dropdown appears at position 0 or after whitespace only, never mid-word
3. Fuzzy filter dropdown: command palette style, rendered above input, 6 visible rows, name + truncated body preview per row
4. Keyboard nav: ↑↓, Ctrl+J / Cmd+J (down), Ctrl+P / Cmd+P (up) to move, Enter to insert, Escape to dismiss
5. Prompt insertion: inserts prompt text at cursor position in the chat input
6. Per-site trigger config: configurable trigger symbol per site to avoid native conflicts (e.g. Claude.ai uses `/`)
7. Side panel UI: manage library from Chrome side panel. Extension icon opens the sidepanel. Popup entry is kept dormant for rollback
8. Options page: full settings including per-site trigger symbol config and GitHub sync config
9. JSON export/import: backup and restore prompt library
10. GitHub sync: pull snippets from a GitHub repo into the extension. Manual only. GitHub is source of truth. Extension is read-only
11. Labels: optional single label per prompt for grouping and filtering. Label filter button with popover in the sidepanel list. Label field in the edit form as a combobox showing existing labels. The same prompt name can appear under different labels

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind v4
- shadcn/ui
- lucide-react
- Zod
- vitest (unit/integration), Playwright (e2e)
- chrome.storage.local

## UI decisions

See `DESIGN.md` for all theme, token, typography, and component-specific decisions.

## Constraints

- Manifest V3 only
- No external backend
- Must not break native slash commands on Claude.ai
- chrome.storage.local (up to 10MB)
- GitHub PAT stored in chrome.storage.local, acceptable for personal use. Not encrypted
- New site support is added manually: update the manifest `matches` list and add a site-specific adapter. No user-configurable site support.
