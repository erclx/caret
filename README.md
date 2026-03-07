# SlashPrompt

Reusable prompt library for Claude.ai, Gemini, and ChatGPT. Type a trigger symbol in any chat input to search and insert saved prompts without leaving the keyboard.

## Features

- Prompt library with create, edit, and delete support
- Trigger symbol detection with fuzzy search dropdown, rendered above the chat input
- Keyboard navigation: `↑↓`, `Ctrl+J/K`, `Ctrl+N/P` to move, `Enter` to insert, `Esc` to dismiss
- Per-site trigger symbol config to avoid conflicts with native commands
- Popup and side panel UI for managing prompts
- JSON export and import for backup and restore
- Data stays local, no accounts or sync

## Getting Started

Use `Bun` as the package manager. Ensure `Bun` is installed globally.

### Install Dependencies

```bash
bun install
```

## Development

### Start Development Server

```bash
bun run dev
```

To load the extension in Chrome:

1. Open `chrome://extensions/`.
2. Enable "Developer mode".
3. Click "Load unpacked" and select the `dist` directory.

### Build for Production

```bash
bun run build
```

## Project Structure

```text
src/
├── background/      # Background service worker
│   └── index.ts
├── content/         # Content scripts injected into target sites
│   ├── main.tsx
│   └── views/       # Dropdown command palette
│       └── app.tsx
├── popup/           # Prompt library UI (extension icon)
│   ├── app.tsx
│   ├── index.html
│   └── main.tsx
├── sidepanel/       # Prompt library UI (side panel)
│   ├── app.tsx
│   ├── index.html
│   └── main.tsx
├── options/         # Per-site trigger config and settings
│   ├── app.tsx
│   ├── index.html
│   └── main.tsx
└── shared/          # Hooks, types, components, utilities
    ├── components/
    ├── hooks/
    ├── types/
    └── utils/
```

## Development Commands

- `bun run dev`: Starts the development server with HMR.
- `bun run build`: Builds for production and generates a zip in `release/`.
- `bun run check`: Runs format, typecheck, lint, spellcheck, unit tests, and build verification.
- `bun run check:full`: Runs `check` plus end-to-end tests.
- `bun run test`: Runs unit tests with Vitest.
- `bun run test:e2e`: Runs end-to-end tests with Playwright.
- `bun run format`: Formats code with Prettier.
- `bun run lint`: Lints code with ESLint.
- `bun run snapshot`: Generates a project snapshot in `.claude/.tmp/SNAPSHOT.md`.
- `bun run clean`: Removes `node_modules` and temporary files.
- `bun run update`: Updates dependencies and runs full verification.

## Commit Standards

This project follows [Conventional Commits](https://www.conventionalcommits.org/). See [standards/commit.md](standards/commit.md) for guidelines.

## Support

Report issues on [GitHub Issues](../../issues).

## License

[MIT](LICENSE)
