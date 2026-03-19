# Caret

Reusable prompt library for Claude.ai, Gemini, and ChatGPT. Type a trigger symbol in any chat input to search and insert saved prompts without leaving the keyboard.

## Features

- GitHub sync: pull prompts from a repository
- Tooltips for clearer explanations in settings
- Prompt library with tabbed view (your prompts and GitHub snippets) and search
- Prompts sorted with local prompts first, then by last updated
- Prompt names must be unique and kebab-case (e.g., `my-prompt`)
- Trigger symbol with fuzzy search on prompt names
- Keyboard navigation: `↑↓` to move, `Enter` or `Tab` to insert, `Esc` to dismiss (or discard unsaved changes in prompt forms)
- Per-site trigger symbol config to avoid conflicts with native commands. The extension warns if the `/` symbol is used on `claude.ai` or `chatgpt.com` due to native slash menu conflicts.
- Popup and side panel UI for managing prompts
- Quick access to settings from the prompt library
- JSON export and import for backup and restore
- Prompt editing includes unsaved changes warning
- Data stays local, no accounts or sync

## Installation

Install from the [Chrome Web Store](https://chrome.google.com/webstore) or load unpacked from source — see [docs/dev.md](docs/dev.md).

## Usage

1. Click the extension icon or open the side panel. Here you can manage your prompts, view GitHub snippets, and access settings.
2. In the 'Prompts' tab, use the search bar to find prompts or the 'New' button to create one.
3. To configure GitHub sync, navigate to the settings page (right-click the extension icon and select 'Options'). In the 'GitHub sync' section, enter your Personal Access Token (a direct link is available to create one on GitHub), repository details (e.g., `owner/repo`), and snippets path (a folder of .md files relative to the repo root; filenames become snippet names and non-.md files are skipped). The extension now provides real-time validation for the repository format and displays real-time connection health. You can now also disconnect your GitHub integration.
4. Once configured, switch to the 'GitHub' tab in the prompt library to view and sync prompts from your repository. The sync status will now show "Up to date" when no changes are pending, and a confirmation message "Applied ✓" will appear after applying changes.
5. To backup or restore your prompts, navigate to the settings page and use the export/import options.
6. In any supported chat input, type `>` followed by a prompt name to search.
7. Use `↑↓` to navigate, `Enter` or `Tab` to insert, `Esc` to dismiss (or discard unsaved changes in prompt forms).

Supported sites: Claude.ai, Gemini, ChatGPT.

## Support

Report issues on [GitHub Issues](../../issues).

## License

[MIT](LICENSE)
