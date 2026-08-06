---
title: Release and deploy
description: Tag-driven path from the local release script through CI to the Chrome Web Store, drawn from the release flow
category: Deployment
verified: cdf535c 2026-08-06
---

# Release and deploy

```mermaid
flowchart TB
  accTitle: How a version reaches the Chrome Web Store
  accDescr: A local script tags and pushes, the tag triggers a workflow whose static checks, tests, and build run in parallel, and all of them must pass before a release is created and published.

  Dev["Developer runs<br/>bun run release"]
  Script["scripts/release.sh<br/>bump version, commit, tag, push"]
  Tag["Git tag v*<br/>pushed to origin"]
  Workflow["GitHub Actions<br/>.github/workflows/release.yml"]
  Static["Static checks<br/>typecheck, lint, format, cspell"]
  Tests["Unit tests<br/>vitest"]
  Build["Production build<br/>vite plus crxjs"]
  E2e["End-to-end tests<br/>Playwright"]
  Release["Create GitHub Release<br/>changelogithub auto-notes"]
  Publish["Publish to Chrome Web Store<br/>chrome-webstore-upload-cli"]
  Live["Live on Chrome Web Store"]

  Dev --> Script
  Script --> Tag
  Tag --> Workflow
  Workflow --> Static
  Workflow --> Tests
  Workflow --> Build
  Build --> E2e
  Static --> Release
  Tests --> Release
  E2e --> Release
  Release --> Publish
  Publish --> Live
```

A release starts on a developer machine and finishes on the Chrome Web Store with no manual step in between. The local script bumps the version, commits, tags, and pushes, and the tag is what triggers the workflow. Pushing to a branch runs nothing here.

Static checks, unit tests, and the production build start together because none of them consumes another's output. End-to-end tests are the one job that waits, since Playwright drives the built extension and needs the build to finish first. All four feed the release step, so a red check stops the publish rather than shipping behind it. Read `scripts/release.sh` for the local half and `.github/workflows/release.yml` for the CI half.
