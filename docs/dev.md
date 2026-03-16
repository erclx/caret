# Development

## Requirements

- [Bun](https://bun.sh) installed globally

## Setup

```bash
bun install
```

## Running locally

```bash
bun run dev
```

To load the extension in Chrome:

1. Open `chrome://extensions/`.
2. Enable "Developer mode".
3. Click "Load unpacked" and select the `dist` directory.

## Build

```bash
bun run build
```

Generates a production build and a zip in `release/`.

## Commands

- `bun run dev` — start development server with HMR
- `bun run build` — build for production
- `bun run build:dev` — build for development (includes dev env vars, e.g. GitHub seeding)
- `bun run format` — format with Prettier
- `bun run lint` — lint with ESLint
- `bun run lint:fix` — lint with auto-fix
- `bun run typecheck` — type check without building
- `bun run check:spell` — spellcheck
- `bun run test` — unit tests in watch mode
- `bun run test:run` — unit tests, single run
- `bun run test:ui` — unit tests with Vitest browser UI
- `bun run test:coverage` — unit tests with coverage report
- `bun run test:e2e` — end-to-end tests with Playwright
- `bun run test:e2e:ui` — end-to-end tests with Playwright UI
- `bun run test:e2e:report` — show last Playwright report
- `bun run check` — format, typecheck, lint, spellcheck, unit tests, and build verification
- `bun run check:full` — `check` plus end-to-end tests
- `bun run snapshot` — generate project snapshot in `.claude/.tmp/SNAPSHOT.md`
- `bun run screenshot` — generate extension screenshots
- `bun run clean` — remove `node_modules` and temporary files
- `bun run update` — update dependencies and run full verification

## Project structure

```text
src/
├── background/      # Background service worker
│   └── index.ts
├── content/         # Content scripts injected into target sites
│   ├── main.tsx
│   ├── hooks/       # React hooks for content scripts
│   ├── input/       # Input detection and adapters
│   └── views/       # Dropdown command palette
│       ├── app.tsx
│       └── dropdown/
├── options/         # Settings page — trigger config, data, GitHub sync
│   ├── app.tsx      # Loading gate and section composition
│   ├── data-section.tsx
│   ├── github-section.tsx
│   ├── site-config-section.tsx
│   ├── index.html
│   └── main.tsx
├── popup/           # Prompt library UI (extension icon)
│   ├── app.tsx
│   ├── index.html
│   └── main.tsx
├── sidepanel/       # Prompt library UI (side panel)
│   ├── app.tsx
│   ├── index.html
│   └── main.tsx
└── shared/          # Hooks, types, components, utilities
    ├── components/  # Reusable React components
    │   └── ui/      # UI primitives (button, input, etc.)
    ├── hooks/
    ├── types/
    └── utils/
```

## Commit standards

See [standards/commit.md](../standards/commit.md). This project follows [Conventional Commits](https://www.conventionalcommits.org/).
