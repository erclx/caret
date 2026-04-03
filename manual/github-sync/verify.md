# GitHub sync verification

Run `bun run dev`, load the extension, open the Options page, and go to the GitHub Sync section.

This repo's own `snippets/` folder is the fixture set. Configure the extension to point at it and verify the sync outcomes below.

## Setup

1. Create a GitHub Personal Access Token with `repo` (or `contents:read`) scope.
2. In the GitHub Sync section, enter:
   - Owner: `erclx`
   - Repo: `caret`
   - Branch: `main`
   - Snippets path: `snippets`
3. Paste the token and click Save.

## Initial sync

- [ ] Click Sync → all prompts from `snippets/` appear in the prompt list with `source: "github"`.
- [ ] Confirm each prompt name matches its filename (without extension).
- [ ] Confirm no duplicates exist if you sync a second time immediately.

## Disconnect

- [ ] Clear the token and save → subsequent syncs fail gracefully with an auth error message.
- [ ] Confirm previously synced prompts remain in the list after disconnecting.

## Options page validation

- [ ] Fill in valid config and save → dot turns green. Edit PAT, repo, branch, or snippets path without saving → dot resets to neutral gray and error message clears.
- [ ] Open Options with no prior GitHub config → Save button is disabled before touching any field.
- [ ] Enter a valid PAT and branch but leave Repository empty → Save stays disabled.
- [ ] Clear the Snippets path field and tab away → "Enter a snippets path" error appears below the field, Save is disabled.
- [ ] Re-enter a snippets path → error clears, Save re-enables (if other fields are also valid).

## Sidepanel GitHub tab

Open the side panel and click the GitHub tab.

### Unconfigured state

- [ ] Open the GitHub tab before completing Options setup → "Set up in Options →" link is shown.
- [ ] Click the link → Options page opens.

### Configured state

- [ ] After setup, open the GitHub tab → connection health dot is green, repo name shows as `erclx/caret`, status line shows last sync time and snippet count.
- [ ] Click "Sync now" → button label stays "Sync now" with a spinning icon while fetching. Label does not change.

### Diff review

- [ ] After fetching completes with changes → diff list appears with added (`+`), updated (`~`), and removed (`-`) entries. Apply and Cancel buttons appear.
- [ ] Locally-edited synced prompts appear as skipped (`·`) with a "local" label.
- [ ] Click Cancel → diff dismissed, no changes applied, status line unchanged.
- [ ] Click "Apply N changes" → changes applied, "Applied ✓" confirmation appears briefly, status line updates.

### Up to date

- [ ] Sync when nothing has changed → status line shows "Up to date · N snippets" and "Up to date ✓" appears briefly below the button then fades.

### Error state

- [ ] Revoke the token, then sync → red error message appears below the status line.
