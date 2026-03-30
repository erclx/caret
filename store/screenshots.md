# Screenshots

Produces the 1280×800 screenshots for the Chrome Web Store listing.

## Setup

1. Run `bun run build`.
2. Open `chrome://extensions/`:
   - Enable Developer mode
   - Click "Load unpacked"
   - Select `dist/`
3. Use FancyZones to snap the Chrome window to exactly 1280×800.
4. Open Claude.ai in a tab:
   - Open the side panel
   - Go to Settings → Import
   - Import `store/demo-prompts.json`

## Mandatory

### Shot 1: Dropdown open

1. Click the Caret icon to open the side panel.
2. Click in the chat input and type `>` to open the dropdown. All three prompts should be visible with `label · name` rows.
3. Capture the window with OBS and save as `store/screenshot-1280x800.png`.

## Future shots

Add these when the listing needs more coverage. Each is 1280×800 and uses the same setup above.

### Prompt form

1. Click "New" in the side panel to open the prompt form.
2. Fill in all fields:
   - Name: `summarize`
   - Label: `claude`
   - Body: `Summarize this in three bullet points.`
3. Capture the window and save as `store/screenshot-form-1280x800.png`.

### Options page

1. Open `chrome://extensions/`, find Caret, and click "Details" → "Extension options".
2. Configure at least two sites with different trigger symbols so the list is populated.
3. Capture the window and save as `store/screenshot-options-1280x800.png`.
