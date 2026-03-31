# Trigger and dropdown verification

Run `bun run dev`, load the extension, and create at least two prompts in the side panel before starting. Test each supported site in a real browser tab (not a mock).

## Setup

Open the Options page and confirm all three sites are enabled with their default trigger symbol (`>`).

## Trigger fires the dropdown

- [ ] Go to `claude.ai`, focus the composer, type `>` → dropdown appears.
- [ ] Go to `gemini.google.com`, focus the composer, type `>` → dropdown appears.
- [ ] Go to `chatgpt.com`, focus the composer, type `>` → dropdown appears.

## Fuzzy filtering

- [ ] Type `>` followed by part of a prompt name → list narrows to matching prompts.
- [ ] Continue typing until one result remains → only that prompt is shown.
- [ ] Type `>` followed by text that matches no prompts → "No results." message appears and the keyboard hint footer is hidden.
- [ ] Delete back to `>` → full prompt list restored.

## Empty state

- [ ] Remove all prompts from the library, then type `>` in any chat input → "No prompts yet. Click the extension icon to add one." appears and the keyboard hint footer is hidden.

## Selection and insertion

- [ ] Press Enter to select the highlighted prompt → prompt body is inserted and the trigger character is removed.
- [ ] Click a prompt in the dropdown → same result.
- [ ] Use arrow keys to move between items, then press Enter → correct prompt inserted.

## Dismiss

- [ ] Open the dropdown, press Esc → dropdown closes, typed text remains.

## Disable a site

- [ ] In Options, uncheck `claude.ai` and save.
- [ ] Go to `claude.ai`, type `>` → no dropdown appears.
- [ ] Re-enable `claude.ai`, save, reload the tab → dropdown fires again.

## Change trigger symbol

- [ ] In Options, change the trigger for `chatgpt.com` to `#` and save.
- [ ] Go to `chatgpt.com`, type `>` → no dropdown.
- [ ] Type `#` → dropdown appears.
- [ ] Restore `>`, save, and verify it works again.

## Slash conflict warning

- [ ] In Options, set the trigger for `claude.ai` to `/` → amber warning: `/ conflicts with this site's native slash menu`.
- [ ] Save and confirm the dropdown still fires on `claude.ai` when `/` is typed (conflict is advisory only).

## Invalid trigger validation

- [ ] In Options, clear the trigger symbol for any enabled site and tab away → red error: `Enter a single non-letter symbol`. Save button is disabled.
