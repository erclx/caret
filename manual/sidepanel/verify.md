# Sidepanel verification

Run `bun run dev`, load the extension, and open the side panel by clicking the extension icon.

## Empty state

- [ ] Open the panel with no prompts → "No prompts yet." message and a New button are visible.

## Create

- [ ] Click New → form opens with Name, Label, and Prompt body fields.
- [ ] Submit with Name and Prompt body empty → Save button stays disabled.
- [ ] Enter an invalid name (e.g. `My Prompt`) → error: `Use lowercase letters, numbers, and hyphens (e.g. my-prompt)`.
- [ ] Enter a valid name and body, leave Label blank → prompt saves and appears in the list without a label.
- [ ] Create a second prompt with the same name and no label → error: `A prompt with this name and label already exists`.
- [ ] Create a prompt with a label (e.g. `writing`) → prompt saves and the `writing` label chip appears in the filter bar.

## Label chips in the form

- [ ] Open the form with at least one existing label → existing label chips appear below the Label field.
- [ ] Click a label chip → it fills the Label field and the chip shows an active state.
- [ ] Click the active chip again → label is cleared.

## Edit

- [ ] Click a prompt in the list → form opens pre-filled with its name, label, and body.
- [ ] Change the body and click Save → list reflects the update.
- [ ] Change the name to one that already exists under the same label → error shown, Save stays disabled.

## Discard confirmation

- [ ] Open the form, make no changes, press Esc → returns to list with no confirmation.
- [ ] Open the form, type in any field, press Esc → "Discard changes?" row appears.
- [ ] Click "Keep editing" → row dismisses, edits preserved.
- [ ] Click "Discard" → returns to list, changes lost.
- [ ] Same flow using the Cancel button instead of Esc.
- [ ] Same flow using the ← Back button instead of Esc.

## Delete

- [ ] Delete a prompt → it is removed from the list.
- [ ] Delete the only prompt with a given label → that label chip disappears from the filter bar.

## Search and filter

- [ ] Type part of a prompt name in the search box → list filters in real time.
- [ ] Clear the search with the × button → full list restored and search box focused.
- [ ] Click a label chip in the filter bar → list shows only prompts with that label.
- [ ] Click "All" → filter clears.
- [ ] With prompts that have no label, click "Unlabeled" → only unlabeled prompts shown.
- [ ] Combine search text with a label filter → both constraints apply simultaneously.
