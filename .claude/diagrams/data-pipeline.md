---
title: GitHub sync pipeline
description: Read-only pull from a GitHub repository into storage behind a manual diff gate, drawn from the sync flow
category: Data pipeline
verified: cdf535c 2026-08-06
---

# GitHub sync pipeline

```mermaid
flowchart TB
  accTitle: How a GitHub sync reaches local storage
  accDescr: A sync fetches a directory listing, recurses subdirectories, and computes a diff, then either updates only the timestamp or routes through a user review before applying changes.

  Start["User clicks Sync now"]
  Fetch["Fetch directory listing<br/>github.fetchSnippets"]
  Recurse["Recurse subdirectories<br/>label equals folder name"]
  Compute["Compute diff against<br/>existing GitHub-sourced prompts"]
  Has{"Any changes?"}
  NoChange["Update lastSyncedAt only"]
  Review["Show diff view in sidepanel"]
  Decide{"User accepts diff?"}
  Apply["Apply surgical merge:<br/>add, update, remove"]
  Cancel["Discard fetched diff"]
  Done["Update lastSyncedAt and count"]

  Start --> Fetch
  Fetch --> Recurse
  Recurse --> Compute
  Compute --> Has
  Has -- no --> NoChange --> Done
  Has -- yes --> Review --> Decide
  Decide -- apply --> Apply --> Done
  Decide -- cancel --> Cancel
```

Sync pulls a directory listing from GitHub, walks any subdirectories it finds, and computes a diff against the prompts already marked as GitHub-sourced. Nothing is written to storage until the user has read that diff and accepted it.

The manual gate exists because the merge can remove prompts, and a silent apply would delete entries a user still wanted. A run that finds no changes skips the review and updates the timestamp on its own, which keeps a no-op sync from asking a question that has one answer. Sync never writes back to GitHub, so the remote stays the source of truth. Read `src/shared/utils` for the fetch path and `.claude/context/github-sync.md` for the three-way diff.
