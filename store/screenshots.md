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

### Shot 2: GitHub tab

1. Open the options page to the GitHub section. Scroll the page to the top so the Data and Per-site configuration sections are visible.
2. Open the side panel and click the GitHub tab. The repo name, green connected dot, last synced timestamp, and snippet count should all be visible.
3. Capture the window and save as `store/screenshot-github-1280x800.png`.
