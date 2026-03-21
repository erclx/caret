# Privacy policy

Caret does not collect, transmit, or share any personal data.

## What is stored

All data is stored locally in your browser using `chrome.storage.local`. Two keys are written:

- `prompts`: the prompt library you create and manage
- `settings`: per-site trigger symbol config and optional GitHub sync credentials

No data leaves your device except as described below.

## GitHub sync

If you configure GitHub sync, Caret sends requests to the GitHub API to fetch prompt files from the repository you specify. Your GitHub Personal Access Token is stored in `chrome.storage.local` and is sent only to `api.github.com`. It is not encrypted at rest; treat it like any other browser credential.

GitHub sync is read-only. Caret never writes to your repository. If a prompt from GitHub has the same name as one of your local prompts, the local version is preserved and the GitHub version is not imported.

## Permissions

Caret requests the following permissions:

- `storage`: read and write prompt library and settings data locally
- `sidePanel`: open the side panel when the extension icon is clicked

No permission is used to collect browsing history, track activity, or access data unrelated to prompt management.

## Contact

If you have questions about this policy, open an issue at the project repository.
