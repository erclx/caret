# Import/export verification

Run `bun run dev`, load the extension, open the Options page, and go to the Data section.

## Export

- [ ] Click "Export prompts as JSON" → browser downloads `caret-backup.json`.
- [ ] Open the file. Confirm it is a valid JSON array where each object has `id`, `name`, `body`, `createdAt`, and `updatedAt` fields.
- [ ] Add a prompt with a `label`, export again → confirm `label` appears in the file.

## Import error states

- [ ] Import `invalid.json` → red error: `Select a valid JSON file.`
- [ ] Import `empty.json` → red error: `Select a file with at least one prompt.`

## Single prompt

- [ ] Import `single.json` → `Added 1: summarize.`
- [ ] Import `single.json` again (body unchanged) → `All prompts are already up to date.`
- [ ] Edit the `summarize` prompt body locally, then import `single.json` again → `Updated 1: summarize.`

## Multiple prompts

- [ ] Import `multi.json` → `Added 3: summarize, explain, refactor.` (all three names shown, no truncation)

## Overflow (truncation)

- [ ] Delete all prompts, then import `overflow.json` → `Added 5: summarize, explain, refactor and 2 more.`
- [ ] Import `overflow.json` again immediately → `All prompts are already up to date.`
- [ ] Edit two of the five prompt bodies locally, then import `overflow.json` again → `Updated 2: <name>, <name>.`

## Auto-dismiss

- [ ] After any successful import, wait ~3 seconds → feedback disappears without interaction.

## Round-trip

- [ ] Export, delete all prompts, import the exported file → all prompts restored with original names, labels, and bodies.
