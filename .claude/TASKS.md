# Tasks

Track what is being built and why, at the level of features and outcomes. Not implementation steps or technical decisions. Those live in `ARCHITECTURE.md`. Update this doc whenever a task is started, completed, or scope changes.

What belongs:

- Task entries describing observable behavior: short bullet per item, one outcome per line
- A test strategy line per task: the type of test and a brief justification, not specific file or method names
- Inline notes on blockers or dependencies, attached to the relevant Up next entry

What does not belong:

- Class names, file paths, function names, or prop names in any entry or section title
- "In progress" or "Blocked" sections. Note these inline on the Up next entry instead.
- Code-level steps or implementation details (behavioral specifics are fine)

Title form by task type:

- Feature: outcome describing what the user can now do
- Fix: problem statement describing what is wrong
- Chore: imperative describing what is being done

One section only: Up next. Completed task blocks move to `.claude/TASKS-ARCHIVE.md`. When Up next has no real tasks, keep the `### Nothing queued` placeholder. Remove it when adding the first real task.

Task block format:

```markdown
### Title

- [ ] Outcome: what done looks like
- [ ] Outcome: what done looks like

> Test strategy: <unit | component | e2e | visual | manual>, what is being verified
```

## Up next

### Chore: add screenshot for filter zero-results state

- [ ] Screenshot script has no capture of the zero-results filter state. Light and dark captures of the "No prompts found." empty state exist when done

> Test strategy: visual, run the screenshot script and confirm the new captures appear

### Fix: GitHub options state and validation

- [ ] Connection status dot stays green when the user edits repo or PAT fields without saving. Reset to neutral on any field change
- [ ] Save is not blocked when owner/repo is empty and the field has never been touched. Block save until the field has a valid value
- [ ] Empty snippets path shows no warning before save. Add inline validation
- [ ] GitHub-synced prompts are visually identical to local ones in the list. Add a subtle indicator so users know which prompts are managed by sync and may be overwritten

> Test strategy: visual verification of each state transition and the sync indicator in the installed extension

### Chore: refresh the store demo

- [ ] The existing demo is outdated and does not reflect current features. Record, edit, and export a replacement following the demo brief
- [ ] Upload to YouTube and update the link in `README.md`

> Test strategy: visual verification
