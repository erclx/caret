# Architecture

## Overview

Chrome extension (MV3) with four entry points: background service worker, content scripts (injected per target site), popup, and side panel. Prompt data lives in chrome.storage.local and is accessed by all entry points via a shared storage utility.

## Structure

```
src/
├── background/
│   └── index.ts              # Service worker — storage message relay if needed
├── content/
│   ├── main.tsx              # Entry per site (Claude, Gemini, ChatGPT)
│   └── views/
│       ├── app.tsx           # Root content script component
│       └── dropdown/
│           ├── dropdown.tsx  # Command palette dropdown
│           └── use-dropdown.ts
├── popup/
│   ├── app.tsx               # Prompt library management UI
│   ├── index.html
│   └── main.tsx
├── sidepanel/
│   ├── app.tsx               # Same UI as popup, wider layout
│   ├── index.html
│   └── main.tsx
├── options/
│   ├── app.tsx               # Per-site trigger config + advanced settings
│   ├── index.html
│   └── main.tsx
├── test/
│   ├── setup.ts
│   ├── storage.test.ts       # Unit tests for storage utils
│   └── hooks.test.ts         # Unit tests for usePrompts, useSettings
├── index.css
└── shared/
    ├── components/           # Shared UI (prompt-form.tsx, prompt-list.tsx, etc.)
    ├── hooks/
    │   ├── use-prompts.ts    # CRUD over chrome.storage.local
    │   └── use-settings.ts   # Trigger symbol config per site
    ├── types/
    │   └── index.ts          # Prompt, Settings schemas (Zod)
    └── utils/
        ├── cn.ts
        ├── fuzzy.ts          # Fuzzy match util
        └── storage.ts        # chrome.storage.local wrapper (typed, async)
e2e/
└── insertion.test.ts         # Playwright e2e for prompt insertion
```

## Key technical decisions

### Trigger symbol default: `>`

Claude.ai natively intercepts `/` for its own command menu. Using `>` by default avoids DOM race conditions. Users can override per site in options.

### UI: shadcn/ui + Tailwind v4 + lucide-react

shadcn is headless and Tailwind-native — ships only what's used, no bloat. lucide-react is already in deps. No additional icon or component library needed. See `DESIGN.md` for theme, token, and typography decisions.

### Dropdown: command palette style, above input

Rendered as a React root injected adjacent to the detected input element. Positioned absolutely via `getBoundingClientRect`, anchored above the input. ResizeObserver watches for input resize to reposition. 6 rows visible, scrollable. Each row: prompt name + truncated body preview.

### Keyboard navigation

↑↓ arrows, Ctrl+J/K, Ctrl+N/P — all move selection. Enter inserts. Escape dismisses. All handled via keydown listener on the document while dropdown is open.

### Content script input detection

Each target site renders its chat input differently:

- Claude.ai — contenteditable div (ProseMirror)
- Gemini — contenteditable div
- ChatGPT — contenteditable div (also ProseMirror-based)

Insertion uses `document.execCommand('insertText')` which triggers framework synthetic events on all three. Abstracted behind an input adapter per site.

### Storage shape

```ts
// chrome.storage.local keys:
// "prompts" → Prompt[]
// "settings" → Settings

type Prompt = {
  id: string // nanoid
  name: string // slug used for filtering e.g. "summarize"
  body: string // text inserted into chat
  createdAt: number
  updatedAt: number
}

type Settings = {
  sites: {
    [hostname: string]: {
      triggerSymbol: string // default ">"
      enabled: boolean
    }
  }
}
```

### Shared UI between popup and sidepanel

Popup and sidepanel import the same React components from `src/shared/`. Only layout/width differs.

## shadcn/ui Setup

Components install to `src/components/ui/` via the CLI. Install iteratively per feature — don't pre-install.

```bash
bunx shadcn@latest init          # once
bunx shadcn@latest add [component]
```

## Risks / open questions

- **Claude.ai input insertion** — ProseMirror may require dispatching a custom transaction rather than relying on `execCommand`. Needs verification in Feature 6.
- **ChatGPT input** — DOM structure changes frequently; content script selector targeting is fragile.
- **Dropdown positioning** — inputs that resize dynamically need ResizeObserver to stay anchored correctly.
- **MV3 service worker lifecycle** — background script can be killed at any time; no persistent state lives there.
