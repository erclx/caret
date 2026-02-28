# Project Context: Chrome Extension Template

## 1. Technical Stack

- **Runtime & Package Manager:** Bun (Strictly enforced)
- **Framework:** React 19
- **Language:** TypeScript (Strict mode)
- **Build Tool:** Vite 7 + CRXJS
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest (Unit), Playwright (E2E)

## 2. Development Conventions

### File & Directory Naming

- **Enforcement:** `eslint-plugin-check-file`
- **Rule:** All source files (`.ts`, `.tsx`) and directories within `src/` must use **kebab-case**.
  - Correct: `src/components/user-card.tsx`
  - Incorrect: `src/components/UserCard.tsx`
- **Exception:** Special configuration files at the root level.

### Coding Style

- **Formatter:** Prettier (Enforced via `lint-staged`).
  - Semicolons: **False**
  - Quotes: **Single**
  - JSX Quotes: **Single**
  - Trailing Commas: **ES5**
- **Imports:** Automatically sorted using `eslint-plugin-simple-import-sort`.
- **CSS:** Use Tailwind utility classes. For conditional classes, strictly use the `cn()` utility located at `@/shared/utils/cn`.

### Git Standards

- **Commit Messages:** Must adhere to **Conventional Commits** (e.g., `feat:`, `fix:`, `chore:`, `docs:`).
- **Hooks:**
  - `pre-commit`: Runs `lint-staged` (ESLint + Prettier).
  - `commit-msg`: Validates commit message format.
  - `pre-push`: Runs `./scripts/verify.sh` (Typecheck, Lint, Spellcheck, Test, Build).

## 3. Architecture Overview

### Entry Points

- **Popup:** `src/popup/` - Standard extension popup UI.
- **Side Panel:** `src/sidepanel/` - Chrome Side Panel API UI.
- **Content Scripts:** `src/content/`
  - `main.tsx`: Entry point for injection logic.
  - `views/`: React roots/components for injected content.
- **Background:** `src/background/` - Service worker logic.

### Shared Logic

- Place reusable code in `src/shared/` (`components`, `hooks`, `types`, `utils`).
- Always use the `@/` path alias to reference `src/`.

## 4. Testing Protocols

- **Unit Tests (Vitest):**
  - Run: `bun run test`
  - Scope: Utility functions, hooks, and isolated React components.
  - Environment: `jsdom`.
- **E2E Tests (Playwright):**
  - Run: `bun run test:e2e`
  - Scope: Full extension workflows, popup interactions, and smoke tests.

## 5. Key Scripts

- `bun run dev`: Start HMR dev server.
- `bun run build`: Production build (outputs to `dist/`).
- `bun run check`: Full integrity check (Types, Lint, Format, Spell, Unit Test, Build).
- `bun run reset`: **Warning** - Resets the project identity (only for initial template setup).
