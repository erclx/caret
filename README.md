# Chrome Extension Template

This project is a template for building Chrome Extensions. It uses a modern web development stack to simplify browser extension development, emphasizing developer experience, performance, and code quality.

## Features

- **Architecture**: Separate entry points for popup, side panel, and background service worker. Content scripts use Shadow DOM for style encapsulation.
- **Build System**: Vite 7 with CRXJS for automated manifest generation and HMR.
- **Styling**: Tailwind CSS v4 configured with a reusable `cn` utility.
- **Quality Control**:
  - **ESLint & Prettier**: Enforced linting and formatting.
  - **Git Hooks**: Husky pre-commit hooks run `lint-staged`, and pre-push hooks run full project verification.
  - **Commit Convention**: Commitlint enforces [Conventional Commits](https://www.conventionalcommits.org/).
  - **Spelling**: CSpell checks for typos in code and documentation.
- **Testing**:
  - **Unit**: Vitest with React Testing Library.
  - **E2E**: Playwright for full extension integration testing.

## Getting Started

Use `Bun` as the package manager. Ensure `Bun` is installed globally.

### Initial Setup

Clone the repository with your project name.

```bash
git clone [https://github.com/erclx/bun-crxjs-template](https://github.com/erclx/bun-crxjs-template) my-extension
cd my-extension
```

**Important:** Run the setup script immediately. This cleans the template history, updates project metadata (package.json, HTML titles), and initializes a fresh Git repository for your new extension. This script deletes itself after successful execution.

```bash
bun run reset
```

### Install Dependencies

```bash
bun run install
```

## Development

### Start Development Server

Run the development server with Hot Module Replacement (HMR).

```bash
bun run dev
```

To load the extension in Chrome:

1. Open `chrome://extensions/` in your browser.
2. Enable "Developer mode".
3. Click "Load unpacked" and select the `dist` directory from your project.

### Build for Production

Build the project for production. This compiles TypeScript, minifies assets, and generates a zip file in `release/`.

```bash
bun run build
```

### Preview Production Build

```bash
bun run preview
```

## Project Structure

A concise overview of the primary directories within `src/`:

```text
src/
├── background/      # Background service worker scripts
│   └── index.ts
├── content/         # Content scripts that interact with web pages
│   ├── main.tsx
│   └── views/       # React components for content scripts
│       └── app.tsx
├── popup/           # React UI for the extension popup
│   ├── app.tsx
│   ├── index.html
│   └── main.tsx
├── shared/          # Reusable components, hooks, types, and utilities
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── utils/
│       └── cn.ts
├── sidepanel/       # React UI for the extension side panel
│   ├── app.tsx
│   ├── index.html
│   └── main.tsx
└── test/            # Test setup and smoke tests
    ├── setup.ts
    └── smoke.test.ts
```

## Development Commands

- `bun run dev`: Starts the development server.
- `bun run build`: Builds the project for production.
- `bun run preview`: Previews the production build locally.
- `bun run check`: **Recommended** - Runs Format, Typecheck, Lint, Format Check, Spellcheck, Unit Test, Snapshot, and Build verification.
- `bun run check:full`: Runs `check` plus End-to-End tests.
- `bun run format`: Formats code using Prettier.
- `bun run lint`: Lints code using ESLint.
- `bun run test`: Runs unit/integration tests using Vitest.
- `bun run test:e2e`: Runs end-to-end tests using Playwright.
- `bun run snapshot`: Generates a project snapshot in `.claude/PROJECT.md`.
- `bun run clean`: Removes `node_modules` and other temporary files.
- `bun run update`: Interactively updates dependencies and performs a full project verification.

## Commit Standards

This project uses **Conventional Commits**. Please refer to [docs/commit.md](docs/commit.md) for detailed guidelines on message formatting, types, and scopes.

## Documentation

- [React Documentation](https://reactjs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [CRXJS Documentation](https://crxjs.dev/vite-plugin)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)

## Support

Report issues on [GitHub Issues](../../issues).

## License

[MIT](LICENSE)
