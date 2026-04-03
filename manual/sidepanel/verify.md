# Sidepanel verification

Run `bun run dev`, load the extension, and open the side panel by clicking the extension icon.

## Empty state

- [ ] Open the panel with no prompts → "No prompts yet." message and a New button are visible.

## Create

- [ ] Click New → form opens with Name, Label, and Prompt body fields.
- [ ] Submit with Name and Prompt body empty → Save button stays disabled.
- [ ] Fill in a name and body, then clear the body and tab away → error: `Enter the prompt content` appears below the body field.
- [ ] Enter an invalid name (e.g. `My Prompt`), then tab away → error: `Use lowercase letters, numbers, and hyphens (e.g. my-prompt)`.
- [ ] With an invalid name error showing, type a valid name → error clears immediately on each keystroke.
- [ ] Enter a valid name and body, leave Label blank → prompt saves and appears in the list without a label.
- [ ] Create a second prompt with the same name and no label, then tab away from the Name field → error: `A prompt with this name and label already exists`.
- [ ] Create a prompt with a label (e.g. `writing`) → prompt saves and a "Label" filter button appears in the search row.

## Label combobox in the form

- [ ] Open the form → a help icon (?) sits next to the Label field label. Hover it → tooltip reads "Labels are case-sensitive". No inline hint text is shown.
- [ ] Type a label with leading or trailing spaces (e.g. `  writing  `), then tab away → input trims to `writing`.
- [ ] Open the form with at least one existing label → focus the Label field → a dropdown of existing labels appears.
- [ ] Type partial text in the Label field → dropdown narrows to matching labels only.
- [ ] Click a label from the dropdown → it fills the Label field and the dropdown closes.
- [ ] Press ArrowDown to highlight an option, then Enter to select it → label fills and dropdown closes.
- [ ] Press Tab while the dropdown is open → dropdown closes and focus moves to the Prompt body field.
- [ ] Press Escape while the dropdown is open → dropdown closes, no discard confirmation appears.
- [ ] With a label value present, click the × inside the label field → field clears and focus returns to the label input.
- [ ] Type a label not in the list → it is accepted as free text and saved normally.

## Edit

- [ ] Click a prompt in the list → form opens pre-filled with its name, label, and body.
- [ ] Change the body and click Save → "Saved ✓" replaces the Cancel/Save row briefly, then the list view returns automatically.
- [ ] Change the name to one that already exists under the same label, then tab away → error appears below the Name field, Save stays disabled. Continue typing to fix the name → error clears immediately.
- [ ] Change the label to one that creates a duplicate pair with the current name → error appears below the Label field, not the Name field.
- [ ] Trigger a save failure (e.g. disconnect storage) and click Save → "Could not save. Try again." appears above the Cancel/Save row in destructive red. Edit any field → error clears immediately.

## Discard confirmation

- [ ] Open the form, make no changes, press Esc → returns to list with no confirmation.
- [ ] Open the form, type in any field, press Esc → "Discard changes?" row appears with a neutral background and muted label text. Only the Discard button is red.
- [ ] Click "Keep editing" → row dismisses, edits preserved.
- [ ] Click "Discard" → returns to list, changes lost.
- [ ] Same flow using the Cancel button instead of Esc.
- [ ] Same flow using the ← Back button instead of Esc.

## Delete

- [ ] Click the trash icon on a prompt → "Delete?" confirm row appears with a neutral background and muted label text. Only the Confirm button is red.
- [ ] Click the trash icon on any prompt, then press Escape → confirm row dismisses, prompt row restores, no deletion occurs.
- [ ] Click Confirm → prompt is removed from the list.
- [ ] Delete the only prompt with a given label → that label no longer appears in the "Label" filter popover.

## Search and filter

- [ ] Type part of a prompt name in the search box → list filters in real time.
- [ ] Clear the search with the × button → full list restored and search box focused.
- [ ] Click the "Label" button → popover opens with a checkbox list of existing labels.
- [ ] Click the padding area of a label row (not the checkbox itself) → filter toggles correctly.
- [ ] Check a label in the popover → list shows only prompts with that label. Button shows a badge count (e.g. "1").
- [ ] Check multiple labels → list shows prompts matching any checked label. Badge updates.
- [ ] Uncheck all labels → full list restored and badge disappears.
- [ ] With prompts that have no label, check "Unlabeled" in the popover → only unlabeled prompts shown.
- [ ] Combine search text with a label filter → both constraints apply simultaneously.
- [ ] Type a query that matches no prompts → "No prompts match your search." appears centered in the list, with "Clear filter to see all" below it in smaller text.
- [ ] Click "Clear filter to see all" → search clears, all prompts reappear.
- [ ] Activate a label filter with no matching prompts → same empty state and clear button appear. Click the button → label filter resets.
- [ ] Close the sidepanel and reopen → label filters reset to none.

## GitHub sync indicator

- [ ] Sync prompts from GitHub → synced prompts show a small GitHub icon after the name in the list row.
- [ ] Hover over the icon → tooltip reads "Managed by GitHub sync".
- [ ] Locally created prompts → no icon shown.
- [ ] Click a synced prompt to open the edit form → a muted banner "Synced from GitHub. Local edits will be lost on next sync." appears below the Back button.
- [ ] Click a locally created prompt to open the edit form → no warning banner appears.
