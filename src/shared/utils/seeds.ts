import type { Prompt } from '@/shared/types'

export const SEED_PROMPTS: Prompt[] = [
  {
    id: crypto.randomUUID(),
    name: 'chat-mode',
    body: 'Use the present_files tool when sharing files. Use the ask_user tool when asking questions.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: 'claude-edit',
    body: 'Write a Claude Code edit prompt using this format:\n```markdown\nFor each file, apply the following edits:\n`<relative/path/to/file>`\n- `<old>` → `<new>`\nEdit only the specified strings. Leave all other content untouched.\n```\nUse relative paths from repo root. List one change per line.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: 'code-search',
    body: 'Write a bash script that searches for <pattern> across the project.\n- Use `git grep` to respect `.gitignore`\n- Output format: filename on one line, matches indented below with line numbers\n- Hard-code the search targets as a multiline variable if the list is known upfront\n- No arrays, pipes only\n- Root defaults to `.`, overridable via `$1`',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: 'senior-mode',
    body: 'Respond with senior-level judgment. No edits, just discuss.\nAssess what is good and what is bad first. Then give a concise overview of what needs to change.\nMinimal and necessary only. No nice-to-haves, no overthinking, no padding.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: 'session-notes',
    body: 'Write session notes for this conversation using this format:\n```markdown\n# Session notes: <topic>\n## Decision: <title>\n<what was decided and why, 2-4 sentences>\n## Decision: <title>\n<what was decided and why>\n```\nOnly include decisions made in this session. Output only the markdown block, nothing else.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]
