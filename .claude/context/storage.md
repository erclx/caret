---
title: Storage and IO
description: chrome.storage.local shape, JSON export/import, dev seeding, and external data validation
---

# Storage and IO

Two keys are written to `chrome.storage.local`: `prompts` and `settings`. Whether the `prompts` key has ever been written determines the onboarding empty state. The wrapper in `src/shared/utils/storage.ts` exposes typed async getters, setters, and a subscription helper that fans storage events out to the React hooks.

## Storage shape

`prompts`: each entry stores a nanoid, a kebab-case slug name, body text, creation and update timestamps, an optional `source` flag, and an optional `label` string.

- `source` is `'github'` only on prompts pulled via GitHub sync. Locally created prompts omit it. The sync diff uses `source` to determine ownership.
- `label` is a free-form string that groups prompts for filtering. Not required, no restricted character set.

`settings`: per-hostname config (trigger symbol and enabled toggle) and an optional GitHub block covering credentials, repo details, last sync metadata, and connection health. Connection health is persisted after each save attempt. If absent, treat it as connected.

## Onboarding empty state

`PromptList` distinguishes a fresh install (never had prompts) from a deleted-all state using a key-existence check on `chrome.storage.local`: if the `prompts` key is absent, no write has ever occurred. Once any write happens the flag is permanently `true`. No schema change needed.

## JSON export / import

Export serializes `Prompt[]` to `caret-backup.json` via Blob download. Import validates the file against `PromptSchema` with Zod, then merges into storage using `(label ?? '', name)` composite key last-write-wins. Matching composite keys overwrite the existing body while preserving the existing `id`. New composite keys get a fresh `crypto.randomUUID()`.

Backups from before labels were introduced import cleanly. All entries land as unlabeled and merge on `('', name)`.

## External data validation

Schemas at external boundaries (`chrome.storage.local`, JSON import) use strict parsing. Unknown keys are rejected rather than passed through. This keeps storage shape intentional and prevents silent data pollution across schema versions.

## Dev seeding

On storage init, if `NODE_ENV === development` and the `prompts` key is empty, `seeds.ts` writes a set of sample prompts mirroring the real `.claude/snippets/` folder content. No-op in production. Prevents implementers from testing against an empty library.

## Risks

- GitHub PAT is stored in `chrome.storage.local`, not encrypted. Acceptable for personal use. The UI documents this risk explicitly.
