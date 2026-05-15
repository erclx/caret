---
title: GitHub sync
description: Read-only sync flow with three-way diff, state machine, and the options page credentials surface
---

# GitHub sync

Read-only. GitHub is the source of truth, and the extension never writes back. Sync is always user-initiated from the sync button in the sidepanel GitHub view.

Files: `src/shared/utils/github.ts` (pure: fetch, testConnection, computeDiff), `src/shared/hooks/use-github-sync.ts` (state machine), `src/shared/components/github-view.tsx` (sidepanel UI), `src/options/github-section.tsx` (credentials form).

## Flow

Fetch directory listing from GitHub Contents API → for each subdirectory entry recurse one level to fetch its `.md` files (label = directory name) → fetch root-level `.md` files with no label → strip `.md` from filename to derive slug → compute diff against existing `source === 'github'` prompts → if no changes, skip review and update `lastSyncedAt`/`lastSyncedCount` directly → otherwise show diff view → on confirm, apply changes surgically.

## Diff

- Identity key is `(label ?? '', name)`. A file moved between GitHub subdirectories (label change, same name) appears in the diff as a remove at the old composite key and an add at the new one.
- Subdirectory recursion adds one API request per subdirectory on top of the root listing and per-file fetches. This stays within rate limits for personal use.
- When a snippet's composite key matches a local prompt's composite key, the diff compares bodies. Matching bodies route to `unchanged` (no review shown). Differing bodies route to `skipped`: the local prompt is preserved, the GitHub version is not imported, and the entry appears in the diff review UI with a neutral indicator.

## Apply

Uses the diff, not a full replace.

- Added snippets get `source: 'github'`, a fresh `id`, and the folder-derived `label`
- Updated prompts patch `body`, `label`, and `updatedAt`, preserving `id` and `createdAt`
- Removed prompts are deleted
- Locally created prompts (`source` absent) are invisible to the diff and untouched by apply

## Edge cases

- PAT is optional for public repos and required for private ones
- Connection errors surface the specific cause (bad token, no access, not found) rather than a generic failure message
- If the GitHub config changes while a diff is under review, the review is treated as stale: the diff view is replaced by the idle sync button. Clicking "Sync now" at that point clears the stale diff and runs a fresh fetch immediately rather than silently no-oping.
- Sync state is lifted into `PromptLibrary` so it survives tab switches.

## API timeouts

All GitHub fetch calls have an explicit timeout. A hung request would freeze the sync UI indefinitely with no recovery path, so calls that exceed the limit are aborted and surfaced as a connection error.

## Risks

- Unauthenticated rate limit: 60 req/hour. Authenticated: 5000 req/hour. Each sync fetches N+1 requests (1 directory listing + 1 per snippet). Fine for personal use either way.
