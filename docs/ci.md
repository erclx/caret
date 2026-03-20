# CI/CD

## Verify workflow

Runs on every pull request to `main` and on manual dispatch. Three jobs run in parallel: static checks (typecheck, lint, format, spell check, shell check), unit tests with coverage, and a production build. A PR must pass all three before merging.

## Release workflow

Push a `v*` tag to trigger a release. Use the release script rather than tagging manually:

```bash
bun run release
```

The script prompts for a bump type (patch, minor, or major), updates `package.json`, commits with `chore(release): vX.X.X`, tags, and pushes. The workflow fires automatically on the tag push.

### Job order

```plaintext
static-checks ─┐
unit-tests     ├─ e2e-tests ─ release ─ publish
build          ─┘
```

`static-checks`, `unit-tests`, and `build` run in parallel. `e2e-tests` gates on `build`. `release` gates on all three parallel jobs plus `e2e-tests`, creates the GitHub Release via `changelogithub`, and attaches the zip. `publish` gates on `release` and uploads to the Chrome Web Store.

The build produces `release/crx-caret-{version}.zip`, uploaded as a workflow artifact (7-day retention) and attached to the GitHub Release.

## Secrets

Add these to **Settings → Secrets and variables → Actions** before the first release.

- `CWS_EXTENSION_ID`: the extension ID in the Chrome Web Store URL, available after the first manual upload
- `CWS_CLIENT_ID`: from a Google Cloud OAuth 2.0 Desktop app client
- `CWS_CLIENT_SECRET`: from the same OAuth client
- `CWS_REFRESH_TOKEN`: run `bunx chrome-webstore-upload-cli login --client-id <id> --client-secret <secret>` locally, authorize in the browser, and copy the printed token

### Google Cloud setup

1. Create a project at [Google Cloud Console](https://console.cloud.google.com).
2. Enable the Chrome Web Store API.
3. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID**, set type to Desktop app, and download the credentials.
4. Run the login command above to obtain the refresh token.

## Chrome Web Store

The [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) is where extensions are managed. The first publish must be done manually to get the `CWS_EXTENSION_ID`. After that, `bun run release` handles the full publish cycle.
