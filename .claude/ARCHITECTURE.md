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
│   ├── hooks/
│   │   └── use-input-detection.ts
│   ├── input/
│   │   ├── adapters.ts       # Input adapter per site (contenteditable / textarea)
│   │   ├── detector.ts       # Trigger symbol detection + ResizeObserver
│   │   ├── detector.test.ts
│   │   └── site-observer.ts  # MutationObserver — finds chat input per site
│   └── views/
│       ├── app.tsx           # Root content script component
│       └── dropdown/
│           ├── dropdown.tsx  # Command palette dropdown
│           ├── dropdown.test.tsx
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
│   ├── app.tsx               # Per-site trigger config + advanced settings + GitHub config
│   ├── app.test.tsx
│   ├── index.html
│   └── main.tsx
├── test/
│   └── setup.ts
├── index.css
└── shared/
    ├── components/
    │   ├── prompt-form.tsx
    │   ├── prompt-form.test.tsx
    │   ├── prompt-library.tsx
    │   ├── prompt-library.test.tsx
    │   ├── prompt-list.tsx
    │   ├── prompt-list.test.tsx
    │   └── ui/               # shadcn/ui primitives (button, input, label, textarea)
    ├── hooks/
    │   ├── use-prompts.ts    # CRUD over chrome.storage.local
    │   ├── use-prompts.test.ts
    │   ├── use-settings.ts   # Trigger symbol config per site
    │   └── use-settings.test.ts
    ├── types/
    │   └── index.ts          # Prompt, Settings schemas (Zod)
    └── utils/
        ├── cn.ts
        ├── fuzzy.ts          # Fuzzy match util
        ├── fuzzy.test.ts
        ├── storage.ts        # chrome.storage.local wrapper (typed, async)
        ├── storage.test.ts
        └── seeds.ts          # Dev-only sample prompts; seeded on first run in development
e2e/
├── fixtures.ts
├── screenshot.ts
└── smoke.test.ts             # Playwright e2e — overwrite with insertion tests in Feature 6
```

## Key technical decisions

### Trigger symbol default: `>`

Claude.ai natively intercepts `/` for its own command menu. Using `>` by default avoids DOM race conditions. Users can override per site in options.

### Trigger detection: word boundary rule

The trigger symbol only fires when it appears at position 0 in the input, or is immediately preceded by whitespace. Typing a symbol mid-word (e.g. `word>`) must not open the dropdown. Detection checks the character at `cursorPosition - 1` before activating.

### UI: shadcn/ui + Tailwind v4 + lucide-react

shadcn is headless and Tailwind-native — ships only what's used, no bloat. lucide-react is already in deps. No additional icon or component library needed. See `DESIGN.md` for theme, token, and typography decisions.

### Dropdown: command palette style, above input

Rendered as a React root injected adjacent to the detected input element. Positioned absolutely via `getBoundingClientRect`, anchored above the input. ResizeObserver watches for input resize to reposition. 6 rows visible, scrollable. Each row: prompt name + truncated body preview.

### Keyboard navigation

↑↓ arrows, Ctrl+J (down), Ctrl+P (up) — all move selection. Enter or Tab inserts. Escape dismisses. Ctrl+K and Ctrl+N are intentionally excluded — Ctrl+K conflicts with Claude.ai's native formatting shortcut. Handled via keydown listener on window (capture phase) to intercept before host page handlers fire.

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
  github?: {
    pat: string // personal access token, stored in chrome.storage.local
    owner: string // repo owner
    repo: string // repo name
    branch: string // default "main"
    snippetsPath: string // path to snippets folder, default "snippets"
  }
}
```

### Dev seeding

On storage init, if `NODE_ENV === development` and the `prompts` key is empty, `seeds.ts` writes a set of sample prompts mirroring the real `snippets/` folder content. No-op in production. Prevents implementers from testing against an empty library.

### GitHub sync (read-only, GitHub is source of truth)

Extension pulls from GitHub; it never pushes back. Sync is manual — triggered by the user via a sync button in the sidepanel GitHub view. Flow: fetch directory listing from GitHub Contents API → fetch each `.md` file → strip `.md` from filename to derive slug → use file content as prompt body → full replace of prompts in storage. Post-sync shows a summary of adds/updates/removes. A diff view lets the user review changes before confirming. PAT is optional for public repos; required for private.

### Shared UI between popup and sidepanel

Popup and sidepanel import the same React components from `src/shared/`. Only layout/width differs.

## shadcn/ui constraints

Components in `src/components/ui/` are source of truth. Never modify them directly. Override via `className` props at the usage site only.

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
- **GitHub PAT storage** — stored in `chrome.storage.local`, not encrypted. Acceptable for personal use; document the risk clearly in the UI.
- **GitHub API rate limits** — unauthenticated: 60 req/hour. Authenticated: 5000 req/hour. Each sync fetches N+1 requests (1 directory listing + 1 per snippet). Fine for personal use either way.
