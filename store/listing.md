# Chrome Web Store listing

Steps to complete the Caret listing. Developer account is registered and dashboard is accessible. Work through these in order; the API secrets must be in place before auto-publish works.

## What is permanent

Get these right before the first submission. They cannot change after the listing goes live.

- **Extension ID**: assigned when you upload the first zip. Fixed forever. Every credential and deep link will reference it.
- **Owner account**: the Google account that creates the listing owns it permanently. Use the right account from the start.
- **Permissions**: adding permissions after publish triggers re-review and can cause rejection. The manifest currently declares `sidePanel` and `storage`. Confirm this is correct before uploading.

Everything else is editable at any time without re-review: descriptions, privacy policy URL, category, screenshots, promo tile, and store icon. New extension zips (version updates) always go through review, but that is expected.

## Step 1: Produce store assets in Figma

Follow `store/figma-store-icon.md` to produce `store/icon.png`, `store/figma-icons.md` to produce the manifest icons, and `store/figma-promo-tile.md` to produce `store/promo-440x280.png`.

## Step 2: Produce the 1280×800 screenshot

1. Build the extension: `bun run build`.
2. Load the unpacked extension in Chrome: open `chrome://extensions/`, enable Developer mode, click "Load unpacked", select `dist/`.
3. Use FancyZones to snap the Chrome window to exactly 1280×800.
4. Open Claude.ai in a tab.
5. Click the Caret icon to open the side panel.
6. Click in the chat input and type `>` to open the dropdown.
7. Capture the window with OBS and save as `store/screenshot-1280x800.png`.

## Step 3: Record the demo

Best done in the same Chrome session as step 2, with the extension already loaded.

### Record (OBS Studio)

1. Create a scene with a Display Capture source at 1920×1080, 30 fps.
2. In Settings → Output, set format to MP4 and note the output folder.
3. Use FancyZones to snap Chrome into a side-by-side layout: side panel on the right, claude.ai on the left.
4. Click Start Recording and perform this sequence: click the Caret icon to open the side panel → click New → enter a name (e.g. `summarize`) and a short body → Save → click into the claude.ai chat input → type `>` → type `sum` to filter → press Enter to insert.
5. Click Stop Recording. Aim for raw footage around 60–90 seconds.

### Edit (DaVinci Resolve)

6. Import the raw clip and trim dead time at the start and end.
7. Add a zoom-in on the side panel form while creating the prompt. The fields are small at full 1080p.
8. Add a zoom-in on the chat input when the dropdown appears. This is the moment to make legible.
9. Add minimal on-screen text labels (white, bottom-center, ~2 seconds each): `"Click Caret icon"` when opening the panel, `"Type > to invoke"` before typing in the chat input, `"Enter to insert"` on the keypress.
10. Trim to 30–40 seconds total.

### Export

11. Export as `store/demo.mp4`.
12. Add it to `README.md` once the file exists.

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
- Screenshots: upload `store/screenshot-1280x800.png`
- Small promo tile: upload `store/promo-440x280.png`
- Category: Developer Tools
- Support URL: `https://github.com/erclx/caret/issues`

## Step 7: Fill in the Privacy tab

- Single purpose: copy from `store/privacy-single-purpose.txt`
- sidePanel justification: copy from `store/privacy-sidepanel-justification.txt`
- storage justification: copy from `store/privacy-storage-justification.txt`
- Host permission justification: copy from `store/privacy-host-permission-justification.txt`
- Remote code: select "No, I am not using remote code"
- Data usage: check none of the data categories; check all three certifications
- Privacy policy URL: `https://erclx.github.io/caret/privacy`

## Step 8: Add contact email and submit

1. Go to the Account tab, add your contact email, and complete the verification.
2. Confirm all fields are complete: descriptions, privacy policy URL, category, store icon, and screenshots.
3. Click "Submit for review". Chrome review typically takes one to three business days.

## Step 9: Get Chrome Web Store API credentials

The release workflow needs four secrets to publish automatically. To generate them:

1. Go to [Google Cloud Console](https://console.cloud.google.com) and create a new project (name it anything, e.g. `caret-cws`).
2. Go to APIs & Services → Library, search for "Chrome Web Store API", and enable it.
3. Go to APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID.
4. Set application type to "Desktop app" and click Create. Copy the client ID and client secret.
5. Open the following URL in a browser, replacing `CLIENT_ID` with your value:
   `https://accounts.google.com/o/oauth2/auth?client_id=CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://www.googleapis.com/auth/chromewebstore&response_type=code`
6. Sign in with the account that owns the developer dashboard. Copy the authorization code shown.
7. Exchange the code for a refresh token:
   ```bash
   curl -X POST https://oauth2.googleapis.com/token \
     -d client_id=CLIENT_ID \
     -d client_secret=CLIENT_SECRET \
     -d code=AUTHORIZATION_CODE \
     -d grant_type=authorization_code \
     -d redirect_uri=urn:ietf:wg:oauth:2.0:oob
   ```
   Copy the `refresh_token` value from the response.

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
