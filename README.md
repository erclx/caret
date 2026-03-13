# Caret

Reusable prompt library for Claude.ai, Gemini, and ChatGPT. Type a trigger symbol in any chat input to search and insert saved prompts without leaving the keyboard.

## Features

- Prompt library with create, edit, and delete support
- Trigger symbol with fuzzy search on prompt names
- Keyboard navigation: `↑↓` to move, `Enter` or `Tab` to insert, `Esc` to dismiss
- Per-site trigger symbol config to avoid conflicts with native commands
- Popup and side panel UI for managing prompts
- JSON export and import for backup and restore
- GitHub sync to pull snippets from a personal repo
- Data stays local, no accounts or sync

## Installation

Install from the [Chrome Web Store](https://chrome.google.com/webstore) or load unpacked from source — see [docs/dev.md](docs/dev.md).

## Usage

1. Click the extension icon to open the side panel and manage your prompts. You can create, edit, and delete prompts from this view.
2. In any supported chat input, type `>` followed by a prompt name to search.
3. Use `↑↓` to navigate, `Enter` or `Tab` to insert, `Esc` to dismiss.

Supported sites: Claude.ai, Gemini, ChatGPT.

## Support

Report issues on [GitHub Issues](../../issues).

## License

[MIT](LICENSE)
