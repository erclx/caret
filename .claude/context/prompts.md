---
title: Prompt library
description: CRUD hook, library coordinator, list/form composition, and the onboarding empty state
---

# Prompt library

The browsable, editable side of the extension. Files: `src/shared/hooks/use-prompts.ts`, `src/shared/components/prompt-library.tsx`, `src/shared/components/prompt-list.tsx`, `src/shared/components/prompt-form.tsx`. See [forms](forms.md) for validation behavior and [storage](storage.md) for the underlying schema.

## `usePrompts` hook

State + mutations: `addPrompt`, `updatePrompt`, `deletePrompt`, `importPrompts`. Subscribes to `chrome.storage.local` changes so updates from any surface (sidepanel, options, GitHub sync) propagate without re-reading.

## `PromptLibrary` as coordinator

`prompt-library.tsx` is the parent gate that owns `usePrompts`, `useGithubSync`, and `useSettings` for the surface. It manages the form/list view toggle, computes filtered results, aggregates labels for the filter popover, and routes mutations through the single hook instance. Both sidepanel and (dormant) popup mount this component.

## List and form composition

- `prompt-list.tsx`: scrollable list, inline delete confirmation row, opens edit form on row click.
- `prompt-form.tsx`: name / label / body fields. Edit and new share the same component. The form infers its mode from whether a prompt prop is passed in.

The edit form replaces the list inline rather than opening as a modal. This keeps the sidepanel's narrow width usable without an overlay.

## Onboarding empty state

See [storage](storage.md) for the key-absence check. The list renders the "fresh install" copy when the prompts key has never been written, and the "deleted-all" copy after any write has occurred. The flag is durable: once the prompts key exists, the fresh-install state never returns.
