# Architecture

Describe the system shape and the decisions behind it. Not a tutorial, setup guide, or implementation walkthrough. Update this doc when a new decision is made or a risk is resolved, not after the fact.

What belongs:

- A high-level overview of how the system is structured and why
- A file tree with brief inline annotations, enough to orient a new developer
- Key technical decisions as named H3 entries: what was chosen and why this over the alternatives, including stack and library choices
- Risks and open questions still unresolved

What does not belong:

- Setup commands or install instructions. Those live in README.
- How individual functions work line by line. That belongs in code comments.
- Full type definitions. Those live in code. Reference the shape conceptually if needed.

Name each decision clearly. Give the reasoning, especially for non-obvious choices. Skip entries where the rationale is self-evident.

## Overview

Chrome extension (MV3) with four entry points: background service worker, content scripts (injected per target site), popup, and side panel. Prompt data lives in chrome.storage.local and is accessed by all entry points via a shared storage utility.

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

## Key technical decisions

### Trigger symbol default: `>`

Claude.ai natively intercepts `/` for its own command menu. Using `>` by default avoids DOM race conditions. Users can override per site in options.

`/` is not blocked as a trigger value. If a user saves `/` for `claude.ai` or `chatgpt.com`, `site-config-section.tsx` shows an amber warning immediately on load and while the value is active. The warning is non-blocking: the user can still save. Gemini has no native slash command, so no warning is shown there.

### Trigger detection: word boundary rule

The trigger symbol only fires when it appears at position 0 in the input, or is immediately preceded by whitespace. Typing a symbol mid-word (e.g. `word>`) must not open the dropdown. Detection checks the character at `cursorPosition - 1` before activating.

### UI: shadcn/ui + Tailwind v4 + lucide-react

shadcn is headless and Tailwind-native. Ships only what's used, no bloat. lucide-react is already in deps. No additional icon or component library needed. See `DESIGN.md` for theme, token, and typography decisions.

### Dropdown: command palette style, above input

Rendered as a React root injected adjacent to the detected input element. Positioned `fixed` using coordinates from `range.getBoundingClientRect()` on the active cursor range, with left and width from the input element's bounding rect. Anchoring to the cursor line (not the element top or bottom) keeps the dropdown just above where the user is typing regardless of input height. `translateY(-100%)` lifts the dropdown above that line. ResizeObserver watches for resize to reposition. 6 rows visible, scrollable. Each row: prompt name + truncated body preview.

When the caret rect has zero height (collapsed range on an empty line), the adapter falls back to the cursor's containing element rect before falling back to the full input element rect. This keeps the dropdown near the cursor line in expanded inputs rather than snapping to the input's top edge.

### Keyboard navigation

- ↑↓, Ctrl+J / Cmd+J (down), Ctrl+P / Cmd+P (up) navigate. Both `ctrlKey` and `metaKey` are accepted so Mac users can use the native modifier.
- Enter or Tab inserts. Escape dismisses.
- Ctrl+K and Ctrl+N are intentionally excluded. Ctrl+K conflicts with Claude.ai's native formatting shortcut.
- Handled via keydown listener on window (capture phase) to intercept before host page handlers fire.

### Content script input detection

Each target site renders its chat input differently:

- Claude.ai: contenteditable div (ProseMirror)
- Gemini: contenteditable div
- ChatGPT: contenteditable div (also ProseMirror-based)

Insertion uses `document.execCommand('insertText')` which triggers framework synthetic events on all three. Abstracted behind an input adapter per site.

The contenteditable adapter maintains two text representations. Cursor position uses raw text content offsets so the insertion path can map positions back to DOM nodes. Text-before-cursor uses rendered range text so trigger validation sees newlines at block boundaries. Browsers omit the trailing newline when a range ends at the start of a block element, so the adapter detects block boundaries and injects the missing newline.

### Storage shape

Two keys in `chrome.storage.local`: `prompts` and `settings`. Key absence (never written) means fresh install. The presence check drives the onboarding empty state.

`prompts`: each entry stores a nanoid, a kebab-case slug name, body text, creation and update timestamps, an optional `source` flag, and an optional `label` string.

- `source` is `'github'` only on prompts pulled via GitHub sync. Locally created prompts omit it. The sync diff uses `source` to determine ownership.
- `label` is a free-form string that groups prompts for filtering. Not required, no restricted character set.

`settings`: per-hostname config (trigger symbol and enabled toggle) and an optional GitHub block covering credentials, repo details, last sync metadata, and connection health. Connection health is persisted after each save attempt. If absent, treat it as connected.

### Onboarding empty state

`PromptList` distinguishes a fresh install (never had prompts) from a deleted-all state using a key-existence check on `chrome.storage.local`: if the `prompts` key is absent, no write has ever occurred. Once any write happens the flag is permanently `true`. No schema change needed.

### JSON export / import

Export serializes `Prompt[]` to `caret-backup.json` via Blob download. Import validates the file against `PromptSchema` with Zod, then merges into storage using `(label ?? '', name)` composite key last-write-wins. Matching composite keys overwrite the existing body while preserving the existing `id`. New composite keys get a fresh `crypto.randomUUID()`. Backups from before labels were introduced import cleanly. All entries land as unlabeled and merge on `('' , name)`.

### Filtering strategy

The trigger dropdown filters on `name` only across all prompts, regardless of label. Results sort by `scoreMatch`: prefix = 2, substring = 1, fuzzy-only = 0.

The sidepanel list has two independent filter dimensions:

- Text search on `name`
- Label filter popover (multi-select, opened from a button at the right of the search row)

Both apply with AND logic when set. When label filters are active, unlabeled prompts are hidden. Label filter state is session-only and resets to all on close.

The filter-aware empty state fires only when unfiltered prompts exist. If a query is active but all prompts have been deleted, the standard empty state shows instead of the filter-aware one. Without this guard, deleting the last prompt while a search is active produces a misleading "no results" message rather than the correct "no prompts" state.

### Dev seeding

On storage init, if `NODE_ENV === development` and the `prompts` key is empty, `seeds.ts` writes a set of sample prompts mirroring the real `snippets/` folder content. No-op in production. Prevents implementers from testing against an empty library.

### GitHub sync (read-only, GitHub is source of truth)

Extension pulls from GitHub. It never pushes back. Sync is manual, triggered by the user via a sync button in the sidepanel GitHub view.

**Flow**

Fetch directory listing from GitHub Contents API → for each subdirectory entry recurse one level to fetch its `.md` files (label = directory name) → fetch root-level `.md` files with no label → strip `.md` from filename to derive slug → compute diff against existing `source === 'github'` prompts → if no changes, skip review and update `lastSyncedAt`/`lastSyncedCount` directly → otherwise show diff view → on confirm, apply changes surgically.

**Diff**

- Identity key is `(label ?? '', name)`. A file moved between GitHub subdirectories (label change, same name) appears in the diff as a remove at the old composite key and an add at the new one.
- Subdirectory recursion adds one API request per subdirectory on top of the root listing and per-file fetches. This stays within rate limits for personal use.
- When a snippet's composite key matches a local prompt's composite key, the diff compares bodies. Matching bodies route to `unchanged` (no review shown). Differing bodies route to `skipped`: the local prompt is preserved, the GitHub version is not imported, and the entry appears in the diff review UI with a neutral indicator.

**Apply**

Uses the diff, not a full replace.

- Added snippets get `source: 'github'`, a fresh `id`, and the folder-derived `label`
- Updated prompts patch `body`, `label`, and `updatedAt`, preserving `id` and `createdAt`
- Removed prompts are deleted
- Locally created prompts (`source` absent) are invisible to the diff and untouched by apply

**Edge cases**

- PAT is optional for public repos and required for private ones
- Connection errors surface the specific cause (bad token, no access, not found) rather than a generic failure message
- If the GitHub config changes while a diff is under review, the review is treated as stale: the diff view is replaced by the idle sync button. Clicking "Sync now" at that point clears the stale diff and runs a fresh fetch immediately rather than silently no-oping.
- Sync state is lifted into `PromptLibrary` so it survives tab switches

### External data validation

Schemas at external boundaries (`chrome.storage.local`, JSON import) use strict parsing. Unknown keys are rejected rather than passed through. This keeps storage shape intentional and prevents silent data pollution across schema versions.

### GitHub API timeouts

All GitHub fetch calls have an explicit timeout. A hung request would freeze the sync UI indefinitely with no recovery path, so calls that exceed the limit are aborted and surfaced as a connection error.

### Options page: single `useSettings` instance

`useSettings` is called once in `app.tsx`. `settings`, `updateSettings`, and `updateSiteSettings` are passed as props to child sections. Each child calling the hook independently creates a separate async load, so local `useState` initializers run before data arrives and fields reset to defaults. Owning the single call in the loading-gate parent guarantees children mount with fully-loaded data.

### Sidepanel-primary: popup dormant

The extension icon opens the sidepanel via `chrome.action.onClicked` → `chrome.sidePanel.open()`. The popup entry point (`src/popup/`) is kept dormant for rollback but is not wired into the manifest's `action.default_popup`.

### Shared UI between popup and sidepanel

Popup and sidepanel import the same React components from `src/shared/`. Only layout/width differs.

### shadcn/ui constraints

Components in `src/components/ui/` are source of truth. Project-wide baseline defaults (such as focus ring width) may be modified directly in the primitive. Override per-component appearance via `className` props at the usage site.

### CI: parallel jobs, gate only on data dependency

Static checks, unit tests, and build run in parallel on every PR. `needs` is reserved for jobs that require an artifact from a prior job or that are prohibitively expensive relative to their gate. `e2e-tests` gates on `build` because it requires the built extension. `release` gates on all three parallel jobs plus `e2e-tests` because it should not publish until everything passes.

### Release: `changelogithub` generates all release notes, no CHANGELOG.md

`changelogithub` auto-generates release notes from conventional commits and writes them to the GitHub Release. There is no `CHANGELOG.md`. The GitHub Release is the changelog. This works because commits follow Conventional Commits and PRs are well-scoped, so the generated notes are the authoritative record.

### Release: e2e tests run in release workflow only, not on PRs

Running Playwright on every PR adds 3–5 minutes per run and requires Chrome installation. The pre-push hook already runs `bun run check` locally. E2e is reserved for the release gate where correctness is critical before a publish.

### Release: `npm version --no-git-tag-version` to keep version and tag in sync

`package.json` version is the source of truth for the zip filename (`crx-caret-{version}.zip`). The release script bumps the version with `npm version --no-git-tag-version`, then commits and tags manually using a conventional commit message. This keeps the commit message format consistent with the rest of the project rather than using npm's default format.

### Post-save navigation: form-owned with feedback delay

After a successful save, the form shows a brief confirmation before navigating back to the list. The parent component is responsible only for persistence. Navigation timing belongs to the form so it controls the feedback window. If the parent navigated immediately on save, the form would unmount before feedback could render.

### Form validation timing: blur-first, then live

All form fields validate on blur first, then re-validate on every subsequent change once touched. Errors never appear before a field has been blurred. After first blur, errors update immediately as the user types, so fixes register without a second tab-away.

Each field carries an explicit `isTouched` boolean rather than inferring touched state from error presence or empty-value guards. The implicit pattern (suppressing errors when the value is empty) was a pre-existing violation that relied on coincidental behavior. Explicit flags make the intent clear and prevent regression.

This applies to the prompt form (name and body) and to the GitHub section (repo, branch, snippets path), which already used the same pattern before this decision was recorded.

## Risks / open questions

- Claude.ai input insertion: ProseMirror may require dispatching a custom transaction rather than relying on `execCommand`. Needs verification in Feature 6.
- ChatGPT input: DOM structure changes frequently. Content script selector targeting is fragile.
- MV3 service worker lifecycle: background script can be killed at any time. No persistent state lives there.
- GitHub PAT storage: stored in `chrome.storage.local`, not encrypted. Acceptable for personal use. Document the risk clearly in the UI.
- GitHub API rate limits: unauthenticated 60 req/hour, authenticated 5000 req/hour. Each sync fetches N+1 requests (1 directory listing + 1 per snippet). Fine for personal use either way.
