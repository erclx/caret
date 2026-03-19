# Architecture

Describe the system shape and the decisions behind it. Not a tutorial, setup guide, or implementation walkthrough. Update this doc when a new decision is made or a risk is resolved, not after the fact.

What belongs:

- A high-level overview of how the system is structured and why
- A file tree with brief inline annotations, enough to orient a new developer
- Key technical decisions as named H3 entries: what was chosen and why this over the alternatives, including stack and library choices
- Risks and open questions still unresolved

What does not belong:

- Setup commands or install instructions; those live in README
- How individual functions work line by line; that belongs in code comments
- Full type definitions; those live in code. Reference the shape conceptually if needed.

Name each decision clearly. Give the reasoning, especially for non-obvious choices. Skip entries where the rationale is self-evident.

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
│   ├── app.tsx               # Page shell — loading gate and section composition
│   ├── app.test.tsx
│   ├── data-section.tsx      # Export / import prompts
│   ├── github-section.tsx    # GitHub credentials, connection test, save
│   ├── site-config-section.tsx # Per-site trigger symbol config
│   ├── index.html
│   └── main.tsx
├── test/
│   └── setup.ts
├── index.css
└── shared/
    ├── components/
    │   ├── github-view.tsx   # GitHub tab UI: status, diff, sync controls
    │   ├── prompt-form.tsx
    │   ├── prompt-form.test.tsx
    │   ├── prompt-library.tsx
    │   ├── prompt-library.test.tsx
    │   ├── prompt-list.tsx
    │   ├── prompt-list.test.tsx
    │   └── ui/               # shadcn/ui primitives (button, input, label, textarea, tooltip)
    ├── hooks/
    │   ├── use-github-sync.ts # Sync state machine: idle → fetching → reviewing → applying
    │   ├── use-github-sync.test.ts
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
        ├── github.ts         # fetchSnippets, testConnection, computeDiff (pure)
        ├── github.test.ts
        ├── io.ts             # Export (JSON download) and import (parse + merge) logic
        ├── io.test.ts
        ├── storage.ts        # chrome.storage.local wrapper (typed, async)
        ├── storage.test.ts
        └── seeds.ts          # Dev-only sample prompts; seeded on first run in development
e2e/
├── fixtures.ts
├── screenshot.ts
└── ui.test.ts                ← Playwright e2e — sidepanel load, prompt insertion per site
```

## Key technical decisions

### Trigger symbol default: `>`

Claude.ai natively intercepts `/` for its own command menu. Using `>` by default avoids DOM race conditions. Users can override per site in options.

`/` is not blocked as a trigger value. If a user saves `/` for `claude.ai` or `chatgpt.com`, `site-config-section.tsx` shows an amber warning immediately on load and while the value is active. The warning is non-blocking: the user can still save. Gemini has no native slash command, so no warning is shown there.

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
// "prompts" → Prompt[]   (key absent = never written = fresh install)
// "settings" → Settings

type Prompt = {
  id: string // nanoid
  name: string // slug used for filtering e.g. "summarize"
  body: string // text inserted into chat
  createdAt: number
  updatedAt: number
  source?: 'github' // present only on prompts pulled via GitHub sync; absent on locally created prompts
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
    lastSyncedAt?: number // timestamp of last sync (applied or up-to-date)
    lastSyncedCount?: number // number of snippets in last sync
    connectionHealth?: 'connected' | 'error' // persisted after each save attempt; absent means treat as connected
  }
}
```

### Onboarding empty state

`PromptList` distinguishes a fresh install (never had prompts) from a deleted-all state using a key-existence check on `chrome.storage.local`: if the `prompts` key is absent, no write has ever occurred. Once any write happens the flag is permanently `true`. No schema change needed.

### JSON export / import

Export serializes `Prompt[]` to `caret-backup.json` via Blob download. Import validates the file against `PromptSchema` with Zod, then merges into storage using name-based last-write-wins — duplicate names overwrite the existing body while preserving the existing `id`; new prompts get a fresh `crypto.randomUUID()`.

## Filtering strategy

Prompts filter on `name` only. Results sort by `scoreMatch`: prefix = 2, substring = 1, fuzzy-only = 0.

### Dev seeding

On storage init, if `NODE_ENV === development` and the `prompts` key is empty, `seeds.ts` writes a set of sample prompts mirroring the real `snippets/` folder content. No-op in production. Prevents implementers from testing against an empty library.

### GitHub sync (read-only, GitHub is source of truth)

Extension pulls from GitHub; it never pushes back. Sync is manual, triggered by the user via a sync button in the sidepanel GitHub view.

Flow: fetch directory listing from GitHub Contents API → fetch each `.md` file → strip `.md` from filename to derive slug → compute diff against existing `source === 'github'` prompts → if no changes, skip review and update `lastSyncedAt`/`lastSyncedCount` directly → otherwise show diff view → on confirm, apply changes surgically.

Apply uses the diff, not a full replace. Added snippets get `source: 'github'` and a fresh `id`. Updated prompts patch `body` and `updatedAt`, preserving `id` and `createdAt`. Removed prompts are deleted. Locally created prompts (`source` absent) are invisible to the diff and untouched by apply.

PAT is optional for public repos; required for private.

Connection errors surface the specific cause (bad token, no access, not found) rather than a generic failure message.

If the GitHub config changes while a diff is under review, the review is automatically discarded — the diff is only valid against the config it was fetched with.

Sync state is lifted into `PromptLibrary` so it survives tab switches.

### External data validation

Schemas at external boundaries (`chrome.storage.local`, JSON import) use strict parsing — unknown keys are rejected rather than passed through. This keeps storage shape intentional and prevents silent data pollution across schema versions.

### GitHub API timeouts

All GitHub fetch calls have an explicit timeout. A hung request would freeze the sync UI indefinitely with no recovery path, so calls that exceed the limit are aborted and surfaced as a connection error.

### Options page: single `useSettings` instance

`useSettings` is called once in `app.tsx`; `settings`, `updateSettings`, and `updateSiteSettings` are passed as props to child sections. Each child calling the hook independently creates a separate async load, so local `useState` initializers run before data arrives and fields reset to defaults. Owning the single call in the loading-gate parent guarantees children mount with fully-loaded data.

### Sidepanel-primary: popup dormant

The extension icon opens the sidepanel via `chrome.action.onClicked` → `chrome.sidePanel.open()`. The popup entry point (`src/popup/`) is kept dormant for rollback but is not wired into the manifest's `action.default_popup`.

### Shared UI between popup and sidepanel

Popup and sidepanel import the same React components from `src/shared/`. Only layout/width differs.

## shadcn/ui constraints

Components in `src/components/ui/` are source of truth. Never modify them directly. Override via `className` props at the usage site only.

## Risks / open questions

- **Claude.ai input insertion** — ProseMirror may require dispatching a custom transaction rather than relying on `execCommand`. Needs verification in Feature 6.
- **ChatGPT input** — DOM structure changes frequently; content script selector targeting is fragile.
- **Dropdown positioning** — inputs that resize dynamically need ResizeObserver to stay anchored correctly.
- **MV3 service worker lifecycle** — background script can be killed at any time; no persistent state lives there.
- **GitHub PAT storage** — stored in `chrome.storage.local`, not encrypted. Acceptable for personal use; document the risk clearly in the UI.
- **GitHub API rate limits** — unauthenticated: 60 req/hour. Authenticated: 5000 req/hour. Each sync fetches N+1 requests (1 directory listing + 1 per snippet). Fine for personal use either way.
