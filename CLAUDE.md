# Caret

Chrome extension (MV3) that lets users save reusable prompts and invoke them via a trigger symbol + fuzzy dropdown directly inside Claude.ai, Gemini, and ChatGPT.

## Before making changes

- Check `.claude/TASKS.md` for current scope and status
- Check `.claude/ARCHITECTURE.md` for decisions already made
- Check `.claude/wireframes/` for intended UI layout and behavior, indexed via `.claude/wireframes/index.md`
- Check `.claude/DESIGN.md` for tokens, typography, spacing, and component rules
- Check `.claude/REQUIREMENTS.md` for feature scope and non-goals
- Check `.claude/rules/` for coding standards before writing or editing any code

## Context

The project uses a three-tier context model. Know which tier holds what before reading or writing:

- Always loaded: root `CLAUDE.md`, `.claude/REQUIREMENTS.md`, `.claude/ARCHITECTURE.md`, and `.claude/context/index.md`. Project-wide invariants, product scope, and the discovery anchor for domain context.
- Path-scoped lazy: `.claude/rules/*.md` with `paths:` frontmatter. Coding standards that load only when files matching the glob are touched. Always-on rules apply every session.
- On-demand lookup: `.claude/context/<domain>.md` entries. Per-domain narrative (how a domain is structured, decisions made, gotchas). Use the always-loaded `.claude/context/index.md` to pick which entries to read. Entries are populated by `claude-docs` at ship time.

@.claude/context/index.md

## Behavior

- Flag concerns or alternatives when a proposed change has tradeoffs worth discussing.
- When facing a judgment call with 2-3 reasonable options mid-flow, pick one and state the tradeoff in one sentence. Enumerate options only when the user's preference is the deciding factor.
- Match edit scope to the request. Ship minimal v1 and queue extensions as follow-ups.
- On simplification requests, edit only what the user named.
- Do not add features the user did not ask for.
- When rewriting a section, preserve existing code blocks, tables, and grouped examples unless the user asked to remove them.
- When planning an edit to `CLAUDE.md`, show the proposed change as a fenced `diff` block in chat first, then wait for approval before calling `Edit`

## Indexes

- When a folder has an `index.md`, check it before reading individual files in that folder.
- For folders where an agent browses to pick a document, `index.md` is regenerated from each file's frontmatter. Do not hand-edit `index.md`. Code folders and scratch folders do not need one.
- Every `index.md` carries its own frontmatter (`title`, `subtitle`) that the walker preserves. To keep a folder's `index.md` hand-edited, add `auto: false` to its frontmatter.

## Markdown

- When editing any markdown file, follow `standards/prose.md`.
- When writing or updating `.claude/context/<domain>.md`, also follow `standards/context.md`.

## Commands

- Run `bun run check` before committing. Full script reference in `.claude/context/development.md`.

## Output

- After creating or modifying a file, include its path on its own line so terminal emulators can make it clickable. Do not paraphrase paths into prose ("the seeds folder", "your CLAUDE.md").
- Use the path the user's editor can resolve. The editor is rooted at the main project root.
- In the main worktree: relative from `pwd` works because `pwd` equals the editor root.
- In a linked worktree (under `.claude/worktrees/<name>/`): use absolute paths. Relative paths from worktree `pwd` would not resolve against the editor's project root.
- When the response covers multiple files, group paths under headers: `**Created:**`, `**Modified:**`, `**Deleted:**`. For single-file changes, the path on its own line is enough.

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

- When cspell flags a word, rewrite typos. Add real terms to the appropriate dictionary in `cspell.json`.
- Keep dictionary files sorted alphabetically.

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

- `.claude/TASKS.md` is gitignored local session scratch. Edit freely. No staging or revert before commits.
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

- Implementation work runs in a linked worktree. From the main worktree, enter one with `/claude-worktree` before editing tracked files for a feature.
- Shared session scratch (`.claude/plans/`, `.claude/review/`, `.claude/memory/`, `.claude/briefs/`, `.claude/TASKS.md`) lives at the main worktree root, not inside a linked worktree. From a linked worktree, resolve these paths against the main root via `git worktree list --porcelain | grep -m 1 '^worktree ' | cut -d' ' -f2-`. Fall back to `pwd` if not a git repo.
- From a linked worktree, every `Edit` or `Write` to a tracked file (source, docs) must use a path starting with `pwd`. Only shared session scratch (`.claude/plans/`, `.claude/review/`, `.claude/memory/`, `.claude/briefs/`, `.claude/TASKS.md`) resolves to the main worktree root.
