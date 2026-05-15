---
title: Release and CI
description: Tag-driven release flow, parallel CI jobs, and the reasoning behind e2e-only-on-release
---

# Release and CI

Files: `scripts/release.sh`, `.github/workflows/release.yml`, `.github/workflows/verify.yml`, `package.json` scripts.

## Parallel jobs, gate only on data dependency

Static checks, unit tests, and build run in parallel on every PR. `needs` is reserved for jobs that require an artifact from a prior job or that are prohibitively expensive relative to their gate. `e2e-tests` gates on `build` because it requires the built extension. `release` gates on all three parallel jobs plus `e2e-tests` because it should not publish until everything passes.

## E2e tests run in release workflow only, not on PRs

Running Playwright on every PR adds 3–5 minutes per run and requires Chrome installation. The pre-push hook already runs `bun run check` locally. E2e is reserved for the release gate where correctness is critical before a publish.

## `changelogithub` generates all release notes, no CHANGELOG.md

`changelogithub` auto-generates release notes from conventional commits and writes them to the GitHub Release. There is no `CHANGELOG.md`. The GitHub Release is the changelog. This works because commits follow Conventional Commits and PRs are well-scoped, so the generated notes are the authoritative record.

## `npm version --no-git-tag-version` keeps version and tag in sync

`package.json` version is the source of truth for the zip filename (`crx-caret-{version}.zip`). The release script bumps the version with `npm version --no-git-tag-version`, then commits and tags manually using a conventional commit message. This keeps the commit message format consistent with the rest of the project rather than using npm's default format.

## Resumable releases

The release script detects an in-progress release branch and resumes from the last successful step. Branch push, tag push, and PR creation are each idempotent. Re-running after a flaky pre-push hook picks up where the previous run stopped.
