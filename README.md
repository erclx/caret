# Caret

Reusable prompt library for Claude.ai, Gemini, and ChatGPT. Type a trigger symbol in any supported chat input to search and insert saved prompts without leaving the keyboard.

## Installation

Available on the [Chrome Web Store](#) (link available after listing goes live).

## Features

- Prompt library with create, edit, and delete
- Trigger symbol and type-to-search dropdown in any supported chat input
- Keyboard navigation: ↑↓ or Ctrl+J/Ctrl+P to move, Enter or Tab to insert, Escape to dismiss
- Per-site trigger config: set a different symbol per site to avoid conflicts with native shortcuts
- GitHub sync: pull prompts from a repository, read-only and manual
- JSON export and import for backup and restore
- All data stays in your browser with nothing sent to any server

## Usage

Click the Caret icon in the Chrome toolbar to open the side panel. Create and manage prompts from there. To invoke a prompt in a supported chat input, type your trigger symbol (default: `>`) at the start of a line or after a space. A dropdown opens. Type to filter, navigate with keys, and press Enter or Tab to insert.

To configure GitHub sync or per-site trigger symbols, open the options page from the side panel.

## Supported sites

- [Claude.ai](https://claude.ai)
- [Gemini](https://gemini.google.com)
- [ChatGPT](https://chatgpt.com)

## Privacy

Caret does not collect or transmit any personal data. See [docs/privacy.md](docs/privacy.md).

## Support

Report issues on [GitHub Issues](../../issues).

## License

[MIT](LICENSE)
