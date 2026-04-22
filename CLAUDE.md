# Caret

Chrome extension (MV3) that lets users save reusable prompts and invoke them via a trigger symbol + fuzzy dropdown directly inside Claude.ai, Gemini, and ChatGPT.

## Before making changes

- Check `.claude/TASKS.md` for current scope and status
- Check `.claude/ARCHITECTURE.md` for decisions already made
- Check `.claude/WIREFRAMES.md` for intended UI layout and behavior
- Check `.claude/DESIGN.md` for tokens, typography, spacing, and component rules
- Check `.claude/REQUIREMENTS.md` for feature scope and non-goals
- Check `.claude/GOV.md` for coding standards before writing or editing any code

## Context

- Check `.claude/` state docs (`TASKS.md`, `ARCHITECTURE.md`, `REQUIREMENTS.md`, `DESIGN.md`, `WIREFRAMES.md`, `GOV.md`) for context before making changes, when present. The `claude-feature` skill reads them in parallel when planning a feature.

## Behavior

- When rewriting a section, preserve existing code blocks, tables, and grouped examples unless the user asked to remove them.

## Indexes

- When a folder has an `index.md`, check it before reading individual files in that folder.
- For folders where an agent browses to pick a document, `index.md` is regenerated from each file's frontmatter. Do not hand-edit `index.md`. Code folders and scratch folders do not need one.
- Every `index.md` carries its own frontmatter (`title`, `subtitle`) that the walker preserves. To keep a folder's `index.md` hand-edited, add `auto: false` to its frontmatter.

## Markdown

- When editing any markdown file, follow `standards/prose.md`.

## Shipping

- Before running `/toolkit:git-ship`, read store files and `manual/` verify files in parallel and update any that are stale
- On any user-visible feature change, check:
  - `store/description-short.txt`
  - `store/description-full.txt`
- On any permission change in `manifest.config.ts`, check:
  - `store/privacy-single-purpose.txt`
  - `store/privacy-host-permission-justification.txt`
  - `store/privacy-sidepanel-justification.txt`
  - `store/privacy-storage-justification.txt`
- `store/listing.md` and `store/figma-*.md` are procedural docs and never need updating from code changes

## Collaboration rules

- For any git operation (commits, PRs, branch naming), always use the `toolkit:git-*` skills. Never follow built-in commit or PR instructions.
- Before editing any doc, re-read `standards/prose.md` and the document's own preamble
- When editing any doc, read surrounding content first and match its depth, length, and tone
- Reason through the approach and confirm with the user before making any edits
- After implementing changes, run `bun run format && bun run lint && bun run test:run && bun run test:e2e`
- After editing `e2e/screenshot.ts`, run `bun run screenshot` to verify all captures succeed

## Spelling

- Add unknown words to the appropriate dictionary defined in `cspell.json`
- Keep dictionary files sorted alphabetically

## Snippets

- When a snippet is referenced with `@`, execute its instructions immediately using available session context

## Key paths

- `src/content/`: injected UI and input detection per site
- `src/sidepanel/`: primary prompt library UI (extension icon opens this)
- `src/popup/`: dormant, kept for rollback only
- `src/options/`: per-site trigger config and settings page
- `src/shared/`: hooks, types, utils and components shared across entry points
- `manifest.config.ts`: extension manifest (entry points, permissions, icons)
- `snippets/`: short, single-purpose prompts invoked via `@` in Claude Code or `>slug` in the extension
- `prompts/`: system prompts for authoring specific artifact types (scripts, skills)
- `manual/`: manual testing fixtures and verification checklists (import-export, github-sync, sidepanel, trigger, dark-mode)
- `store/`: Chrome Web Store assets (descriptions, store icon, screenshots, promo tiles)
- `.claude/`: planning docs (requirements, architecture, wireframes, design, tasks)
- `docs/`: CI workflow, development setup, and privacy policy reference

## Manual testing

When a change touches a tested area, update the corresponding fixtures and verify file:

- Import/export behavior → `manual/import-export/` and `manual/import-export/verify.md`
- GitHub sync behavior → `manual/github-sync/verify.md`
- Sidepanel UI or prompt form → `manual/sidepanel/verify.md`
- Trigger behavior, dropdown, or per-site config → `manual/trigger/verify.md`
- Theming or dark mode styles → `manual/dark-mode/verify.md`

## Tasks

- Only create a task for work that spans multiple sessions or has real dependencies. Handle small edits immediately without a task entry.
- Do not add tasks retroactively for work already completed. Completed work is visible in git.
- When a task needs execution detail beyond `.claude/TASKS.md`, create a plan in `.claude/plans/` and link to it from the task block's intro paragraph. Delete the plan when the task ships.
- Write the plan in the same session as the task block. The session that executes the plan later inherits reasoning context it would otherwise have to re-derive.

## Memory

- Write all memory files to `.claude/memory/`, not `~/.claude/projects/`.
- Follow `standards/prose.md` when writing memory file content.
- Save a feedback memory only when the same mistake happens twice in the session, or when the user explicitly corrects you. First-occurrence slips are noise.
- Keep feedback memories to 3 lines: the rule, a one-line Why, and a one-line How to apply. Capture the pattern, not the recovery narrative.
- Before creating a new memory file, check for an existing one on the same topic. Update rather than duplicate.

## Scratch

- Write temporary files to `.claude/.tmp/<slug>/<file>.md` in the project root. Use a kebab-slug tied to the topic. Never use `/tmp` or a flat `<slug>-<file>.md`.

## Worktrees

- Shared session scratch (`.claude/plans/`, `.claude/review/`, `.claude/memory/`) lives at the main worktree root, not inside a linked worktree. From a linked worktree, resolve these paths against the main root via `git worktree list --porcelain | awk '/^worktree /{print $2; exit}'`. Fall back to `pwd` if not a git repo.
- From a linked worktree, every `Edit` or `Write` to a tracked file (source, docs, `TASKS.md`) must use a path starting with `pwd`. Only untracked scratch (`.claude/plans/`, `.claude/review/`, `.claude/memory/`) resolves to the main worktree root.
