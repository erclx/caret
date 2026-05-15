# Architecture

Describe the system shape and the decisions behind it. Not a tutorial, setup guide, or implementation walkthrough. Update this doc when a new decision is made or a risk is resolved, not after the fact.

What belongs:

- A high-level overview of how the system is structured and why
- A file tree with brief inline annotations, enough to orient a new developer
- Cross-cutting risks and open questions

What does not belong:

- Setup commands or install instructions. Those live in `.claude/context/development.md` or the README.
- Per-domain decisions and patterns. Those live in `.claude/context/<domain>.md`, discoverable via the always-loaded `.claude/context/index.md`.
- How individual functions work line by line. That belongs in code comments.
- Full type definitions. Those live in code. Reference the shape conceptually if needed.

## Overview

Chrome extension (MV3) with four entry points: background service worker, content scripts (injected per target site), popup, and side panel. Prompt data lives in `chrome.storage.local` and is accessed by all entry points via a shared storage utility.

Top-level technology choices:

- React 19 + TypeScript 5 with Vite via `@crxjs/vite-plugin`
- Tailwind v4 + shadcn/ui primitives for surface UI
- lucide-react for iconography (no custom icons)
- Zod for schema validation at external boundaries

shadcn is headless and Tailwind-native, ships only what is used, and pairs with lucide-react which is already in deps. No additional icon or component library is needed.

## Structure

```text
src/
├── background/
│   └── index.ts              ← Service worker, storage message relay if needed
├── content/
│   ├── main.tsx              ← Entry per site (Claude, Gemini, ChatGPT)
│   ├── hooks/
│   │   └── use-input-detection.ts
│   ├── input/
│   │   ├── adapters.ts       ← Input adapter per site (contenteditable / textarea)
│   │   ├── detector.ts       ← Trigger symbol detection + ResizeObserver
│   │   ├── detector.test.ts
│   │   └── site-observer.ts  ← MutationObserver, finds chat input per site
│   └── views/
│       ├── app.tsx           ← Root content script component
│       └── dropdown/
│           ├── dropdown.tsx  ← Command palette dropdown
│           ├── dropdown.test.tsx
│           └── use-dropdown.ts
├── popup/
│   ├── app.tsx               ← Prompt library management UI
│   ├── index.html
│   └── main.tsx
├── sidepanel/
│   ├── app.tsx               ← Same UI as popup, wider layout
│   ├── index.html
│   └── main.tsx
├── options/
│   ├── app.tsx               ← Page shell, loading gate and section composition
│   ├── app.test.tsx
│   ├── data-section.tsx      ← Export / import prompts
│   ├── github-section.tsx    ← GitHub credentials, connection test, save
│   ├── site-config-section.tsx ← Per-site trigger symbol config
│   ├── index.html
│   └── main.tsx
├── test/
│   └── setup.ts
├── index.css
└── shared/
    ├── components/
    │   ├── github-view.tsx   ← GitHub tab UI: status, diff, sync controls
    │   ├── logo.tsx          ← Inline SVG logo mark, currentColor, no container
    │   ├── prompt-form.tsx
    │   ├── prompt-form.test.tsx
    │   ├── prompt-library.tsx
    │   ├── prompt-library.test.tsx
    │   ├── prompt-list.tsx
    │   ├── prompt-list.test.tsx
    │   └── ui/               ← shadcn/ui primitives (button, input, label, textarea, tooltip)
    ├── hooks/
    │   ├── use-github-sync.ts ← Sync state machine: idle → fetching → reviewing → applying
    │   ├── use-github-sync.test.ts
    │   ├── use-prompts.ts    ← CRUD over chrome.storage.local
    │   ├── use-prompts.test.ts
    │   ├── use-settings.ts   ← Trigger symbol config per site
    │   └── use-settings.test.ts
    ├── types/
    │   └── index.ts          ← Prompt, Settings schemas (Zod)
    └── utils/
        ├── cn.ts
        ├── fuzzy.ts          ← Fuzzy match util
        ├── fuzzy.test.ts
        ├── github.ts         ← fetchSnippets, testConnection, computeDiff (pure)
        ├── github.test.ts
        ├── io.ts             ← Export (JSON download) and import (parse + merge) logic
        ├── io.test.ts
        ├── storage.ts        ← chrome.storage.local wrapper (typed, async)
        ├── storage.test.ts
        └── seeds.ts          ← Dev-only sample prompts, seeded on first run in development
e2e/
├── fixtures.ts
├── screenshot.ts
└── ui.test.ts                ← Playwright e2e: sidepanel load, prompt insertion per site
```

## Cross-cutting risks

- MV3 service worker lifecycle: the background script can be killed at any time. No persistent state lives there.
- Content script DOM targeting: Claude.ai, Gemini, and ChatGPT evolve their input DOM frequently. Per-site adapters in `src/content/input/` absorb most of those differences, but the site-observer selectors remain the fragile boundary that a host release can break silently.
- Claude.ai input insertion: ProseMirror may require dispatching a custom transaction rather than relying on `execCommand`. The current path works on all three sites today.
- GitHub PAT storage: stored in `chrome.storage.local`, not encrypted. Acceptable for personal use. The UI documents this risk explicitly.
- GitHub API rate limits: unauthenticated 60 req/hour, authenticated 5000 req/hour. Each sync fetches N+1 requests (1 directory listing + 1 per snippet). Fine for personal use either way.
