# Demo

Records the demo video for the Chrome Web Store listing and README.

## Setup

Same Chrome session as the screenshots works fine. If starting fresh, import `store/demo-prompts.json` via Settings → Import in the side panel.

## Record (OBS Studio)

1. Create a scene with a Display Capture source at 1920×1080, 30 fps.
2. In Settings → Output, set format to MP4 and note the output folder.
3. Use FancyZones to snap Chrome into a side-by-side layout:
   - Side panel on the right
   - Claude.ai on the left
4. Click Start Recording and perform this sequence:
   - Click the Caret icon to open the side panel
   - Click New
   - Enter name `summarize`, label `claude`, body `Summarize this in three bullet points.`
   - Click Save
   - Click the `claude` pill to filter, then click it again to clear
   - Click into the Claude.ai chat input
   - Type `>` to open the dropdown
   - Type `sum` to filter
   - Press Enter to insert
5. Click Stop Recording. Aim for raw footage around 60–90 seconds.

## Edit (DaVinci Resolve)

6. Import the raw clip and trim dead time at the start and end.
7. Add a zoom-in on the side panel form while creating the prompt. The fields are small at full 1080p.
8. Add a zoom-in on the label pills when filtering.
9. Add a zoom-in on the chat input when the dropdown appears.
10. Add on-screen text labels (white, bottom-center, ~2 seconds each):
    - `"Click Caret icon"` when opening the side panel
    - `"Add prompt"` while filling in the form
    - `"Press Save"` after completing the form
    - `"Type > to invoke"` before typing in the chat input
    - `"Enter to insert"` on the keypress
11. Trim to 30–40 seconds total.

## Export

12. Export as `store/demo.mp4`.
13. Upload to YouTube.
14. Update the link in `README.md`.
