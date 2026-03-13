# Caret

Reusable prompt library for Claude.ai, Gemini, and ChatGPT. Type a trigger symbol in any chat input to search and insert saved prompts without leaving the keyboard.

## Features

- Prompt library with tabbed view (your prompts and GitHub snippets) and search
- Prompt form with simplified 'Name' field
- Trigger symbol with fuzzy search on prompt names
- Keyboard navigation: `↑↓` to move, `Enter` or `Tab` to insert, `Esc` to dismiss
- Per-site trigger symbol config to avoid conflicts with native commands
- Popup and side panel UI for managing prompts
- Quick access to settings from the prompt library
- JSON export and import for backup and restore
- Data stays local, no accounts or sync

## Installation

Install from the [Chrome Web Store](https://chrome.google.com/webstore) or load unpacked from source — see [docs/dev.md](docs/dev.md).

## Usage

1. Click the extension icon or open the side panel. Here you can manage your prompts, view GitHub snippets, and access settings.
2. In the 'Prompts' tab, use the search bar to find prompts or the 'New' button to create one.
3. To backup or restore your prompts, navigate to the settings page (right-click the extension icon and select 'Options') and use the export/import options.
4. In any supported chat input, type `>` followed by a prompt name to search.
5. Use `↑↓` to navigate, `Enter` or `Tab` to insert, `Esc` to dismiss.

Supported sites: Claude.ai, Gemini, ChatGPT.

## Support

Report issues on [GitHub Issues](../../issues).

## License

[MIT](LICENSE)
