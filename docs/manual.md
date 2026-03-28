# Manual testing

The `manual/` folder holds fixtures and step-by-step verification checklists for features that automated tests do not cover end-to-end. Each feature area has its own subfolder with a `verify.md` and any fixture files it needs.

## Import/export

`manual/import-export/` covers the full data round-trip: exporting prompts to `caret-backup.json`, importing from JSON fixtures, feedback message accuracy, and auto-dismiss timing.

Fixtures:

- `single.json`: one prompt, used to verify single-item feedback and idempotent re-import
- `multi.json`: three prompts, used to verify multi-item feedback without truncation
- `overflow.json`: five prompts, used to verify truncated feedback ("and N more")
- `empty.json`: empty array, triggers the "at least one prompt" error
- `invalid.json`: malformed JSON, triggers the parse error

See [manual/import-export/verify.md](../manual/import-export/verify.md) for the full checklist.

## GitHub sync

`manual/github-sync/` covers syncing prompts from a remote GitHub repository and the sidepanel GitHub tab. No extra fixture files are needed. This repo's own `snippets/` folder is the fixture set. Configure the extension to point at it and follow the checklist.

See [manual/github-sync/verify.md](../manual/github-sync/verify.md) for the full checklist.

## Sidepanel

`manual/sidepanel/` covers the prompt library UI: creating and editing prompts, label chips in the form and filter bar, search, delete, and the discard confirmation flow. The e2e tests mock these interactions; this checklist verifies them in a real browser with the actual extension.

See [manual/sidepanel/verify.md](../manual/sidepanel/verify.md) for the full checklist.

## Trigger and dropdown

`manual/trigger/` covers the content script injection on real sites. The e2e tests run against mocked pages with simplified DOM; this checklist verifies behavior on live Claude.ai, Gemini, and ChatGPT tabs. It also covers the per-site trigger configuration in Options: enabling and disabling sites, changing trigger symbols, and the slash conflict warning.

See [manual/trigger/verify.md](../manual/trigger/verify.md) for the full checklist.

## Dark mode

`manual/dark-mode/` covers dark theme rendering across all surfaces: side panel, options page, and the dropdown. It also verifies that the theme switches without a reload when the OS or browser setting changes mid-session.

See [manual/dark-mode/verify.md](../manual/dark-mode/verify.md) for the full checklist.
