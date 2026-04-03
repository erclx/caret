# Chrome Web Store listing

Steps to complete the Caret listing. Developer account is registered and dashboard is accessible. Work through these in order; the API secrets must be in place before auto-publish works.

## What is permanent

Get these right before the first submission. They cannot change after the listing goes live.

- Extension ID: assigned when you upload the first zip. Fixed forever. Every credential and deep link will reference it.
- Owner account: the Google account that creates the listing owns it permanently. Use the right account from the start.
- Permissions: adding permissions after publish triggers re-review and can cause rejection. The manifest currently declares `sidePanel` and `storage`. Confirm this is correct before uploading.

Everything else is editable at any time without re-review: descriptions, privacy policy URL, category, screenshots, promo tile, and store icon. New extension zips (version updates) always go through review, but that is expected.

## Step 1: Produce store assets in Figma

- Follow `store/figma-store-icon.md` to produce `store/icon.png`
- Follow `store/figma-icons.md` to produce the manifest icons
- Follow `store/figma-promo-tile.md` to produce `store/promo-440x280.png`

## Step 2: Produce screenshots

Follow `store/screenshots.md` to produce the 1280×800 screenshots.

## Step 3: Record the demo

Follow `store/demo.md` to record, edit, and export `store/demo.mp4`.

## Step 4: Enable GitHub Pages for the privacy policy

1. Go to the repo on GitHub → Settings → Pages.
2. Under "Source", select "Deploy from a branch".
3. Set branch to `main`, folder to `/docs`.
4. Save. GitHub assigns a URL in the form `https://erclx.github.io/caret`.
5. The privacy policy URL becomes `https://erclx.github.io/caret/privacy`. Use this in the listing form.

## Step 5: Upload the package

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) and click "New item".
2. Upload the zip from `release/`. The dashboard assigns an extension ID. Save it.

## Step 6: Fill in the Store listing tab

- Full description: copy from `store/description-full.txt`
- Short description: copy from `store/description-short.txt`
- Store icon: upload `store/icon.png`
- Screenshots:
  - `store/screenshot-1280x800.png`
  - `store/screenshot-github-1280x800.png`
- Small promo tile: upload `store/promo-440x280.png`
- Category: Developer Tools
- Support URL: `https://github.com/erclx/caret/issues`

## Step 7: Fill in the Privacy tab

- Single purpose: copy from `store/privacy-single-purpose.txt`
- sidePanel justification: copy from `store/privacy-sidepanel-justification.txt`
- storage justification: copy from `store/privacy-storage-justification.txt`
- Host permission justification: copy from `store/privacy-host-permission-justification.txt`
- Remote code: select "No, I am not using remote code"
- Data usage:
  - Check none of the data categories
  - Check all three certifications
- Privacy policy URL: `https://erclx.github.io/caret/privacy`

## Step 8: Add contact email and submit

1. Go to the Account tab, add your contact email, and complete the verification.
2. Confirm all fields are complete:
   - Descriptions
   - Privacy policy URL
   - Category
   - Store icon
   - Screenshots
3. Click "Submit for review". Chrome review typically takes one to three business days.

## Step 9: Get Chrome Web Store API credentials

The release workflow needs four secrets to publish automatically. To generate them:

1. Go to [Google Cloud Console](https://console.cloud.google.com) and create a new project (name it anything, e.g. `caret-cws`).
2. Go to APIs & Services → Library:
   - Search for "Chrome Web Store API"
   - Enable it
3. Go to APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID.
4. Set application type to "Desktop app" and click Create:
   - Copy the client ID
   - Copy the client secret
5. Add to `.env.local`:
   - `CWS_CLIENT_ID`
   - `CWS_CLIENT_SECRET`
   - `CWS_AUTH_CODE` (leave blank for now)
6. Run `bash scripts/cws-token.sh`. With no auth code set, it prints the OAuth URL with your client ID already filled in:
   - Open that URL
   - Sign in with the account that owns the developer dashboard
   - Copy the authorization code shown
7. Set `CWS_AUTH_CODE` in `.env.local` and re-run `bash scripts/cws-token.sh`. It prints the `refresh_token` value.

## Step 10: Add secrets to the GitHub repo

Go to the repo → Settings → Secrets and variables → Actions → New repository secret. Add all four:

| Name                | Value       |
| ------------------- | ----------- |
| `CWS_EXTENSION_ID`  | from step 5 |
| `CWS_CLIENT_ID`     | from step 9 |
| `CWS_CLIENT_SECRET` | from step 9 |
| `CWS_REFRESH_TOKEN` | from step 9 |

## Step 11: Update the README store link

Replace the placeholder in `README.md` with the real URL once the listing is live:

```markdown
Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/caret/YOUR_EXTENSION_ID)
```

## Step 12: Cut a release tag

Once the listing is approved, run:

```bash
bun run release
```

This bumps the version, commits, tags, and pushes. The CI pipeline runs all checks, builds the extension, creates a GitHub Release, and calls `chrome-webstore-upload-cli` to upload the zip automatically. All subsequent releases follow the same path with no manual steps.
