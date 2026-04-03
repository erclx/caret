# Demo

Records the demo video for the Chrome Web Store listing and README.

## Setup

Open the side panel, click the gear icon, and import `store/demo-prompts.json` via Import prompts from JSON before recording.

## Record (OBS Studio)

1. Create a scene with a Display Capture source at 1920×1080, 30 fps.
2. In Settings → Output, set format to MP4 and note the output folder.
3. Use FancyZones to snap Chrome into a side-by-side layout:
   - Side panel on the right
   - Claude.ai on the left
4. Click Start Recording and perform this sequence:
   - Click the Caret icon to open the side panel (library visible with imported prompts)
   - Click New
   - Enter name `reply`, label `claude`, body `Write a professional reply to this.`
   - Click Save
   - Click into the Claude.ai chat input
   - Type `>` to open the dropdown
   - Type `rep` to filter
   - Press Enter to insert
5. Click Stop Recording. Aim for raw footage around 45–60 seconds.

## Edit (DaVinci Resolve)

6. Import the raw clip and trim dead time at the start and end.
7. Add a zoom-in on the side panel form while creating the prompt. The fields are small at full 1080p.
8. Add a zoom-in on the chat input when the dropdown appears.
9. Add on-screen text labels (Inter Regular 18pt, size 48, white, center-bottom, ~2 seconds each):
   - `"Click Caret icon"` when opening the side panel
   - `"Add prompt"` while filling in the form
   - `"Press Save"` after completing the form
   - `"Type > to invoke"` before typing in the chat input
   - `"Enter to insert"` on the keypress
     Apply a Cross Dissolve transition (~0.5 s) to the in and out points of each text clip so labels fade in and fade out against the video.
10. Trim to 30–40 seconds total.

## Export

11. Export as `store/demo.mp4`.

## Upload (YouTube)

12. Upload `store/demo.mp4` and fill in the following:
    - Title: `Caret: save and invoke prompts in AI chat`
    - Description: `Save reusable prompts and invoke them via a trigger symbol inside Claude.ai, Gemini, and ChatGPT.` followed by a blank line and the Chrome Web Store URL
    - Thumbnail: use the auto-generated thumbnail
    - Audience: not made for kids
    - Category: Science and Technology
    - Visibility: public
13. Update the link in `README.md`.
