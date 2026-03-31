# Tasks

Track what is being built and why, at the level of features and outcomes. Not implementation steps or technical decisions. Those live in `ARCHITECTURE.md`. Update this doc whenever a task is started, completed, or scope changes.

What belongs:

- Task entries describing what and why: short bullet per item, one outcome per line
- A test strategy line per task: the type of test and a brief justification, not specific file or method names
- Inline notes on blockers or dependencies, attached to the relevant Up next entry

What does not belong:

- Class names, file paths, function names, or prop names in any entry or section title
- "In progress" or "Blocked" sections. Note these inline on the Up next entry instead.
- How something will be implemented

One section only: Up next. Completed task blocks move to `.claude/TASKS-ARCHIVE.md`. When Up next has no real tasks, keep the `### Nothing queued` placeholder. Remove it when adding the first real task.

Task block format:

```markdown
### Title

- [ ] Outcome: what done looks like
- [ ] Outcome: what done looks like

> Test strategy: type and brief justification
```

## Up next

### Fix: label UI affordance and popover focus

- [ ] Label combobox has no visual or semantic signal that it opens a dropdown. Make it recognizable as a combobox
- [ ] Filter popover opens with focus on the second checkbox instead of the first

> Test strategy: keyboard navigation smoke test in the installed extension, visual verification of the combobox in light and dark modes

### Polish + Feature: GitHub options and prompt indicator

- [ ] Connection status dot stays green when the user edits repo or PAT fields without saving. Reset to neutral on any field change
- [ ] Save is not blocked when owner/repo is empty and the field has never been touched. Block save until the field has a valid value
- [ ] Empty snippets path shows no warning before save. Add inline validation
- [ ] GitHub-synced prompts are visually identical to local ones in the list. Add a subtle indicator so users know which prompts are managed by sync and may be overwritten

> Test strategy: visual verification of each state transition and the sync indicator in the installed extension

### Chore: re-record demo for labels

- [ ] Record, edit, and export a new demo following `store/demo.md`. The existing demo predates labels and does not show filter pills or `label · name` display
- [ ] Upload to YouTube and update the link in `README.md`

> Test strategy: visual verification
