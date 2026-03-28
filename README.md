# Caret

Reusable prompt library for Claude.ai, Gemini, and ChatGPT. Type a trigger symbol in any supported chat input to search and insert saved prompts without leaving the keyboard.

## Demo

[Watch the demo on YouTube](https://youtu.be/p6Gc-wPjgO4)

## Installation

Available on the [Chrome Web Store](https://chromewebstore.google.com/detail/caret/bpmdbibldelkpncegllkeegdpblgehgk).

## Features

- Prompt library with create, edit, and delete
- Labels to group prompts; filter by label in the side panel
- Trigger symbol and type-to-search dropdown in any supported chat input
- Keyboard navigation: ↑↓ or Ctrl+J/Ctrl+P to move, Enter or Tab to insert, Escape to dismiss
- Per-site trigger config: set a different symbol per site to avoid conflicts with native shortcuts
- GitHub sync: pulls prompts from a repository read-only. Subdirectories map to labels, and local prompts are preserved when a remote prompt shares the same name and label.
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
