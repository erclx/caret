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

### Fix: GitHub sync view has multiple feedback gaps

- [ ] RefreshCw icon does not spin during `applying` state, only during `fetching`
- [ ] Status line reads "Up to date · N snippets" after an apply, which implies a fresh check rather than a completed write
- [ ] The "local" badge on skipped diff entries is cryptic. Users without context cannot tell it means the local version was preserved.

> Test strategy: manual, verify spinner, status line, and diff labels across fetch → review → apply flow

### Chore: refresh the store demo

- [ ] The existing demo is outdated and does not reflect current features. Record, edit, and export a replacement following the demo brief
- [ ] Upload to YouTube and update the link in `README.md`

> Test strategy: visual verification
