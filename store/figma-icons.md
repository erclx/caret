# Figma steps: Caret icon

Produces full-bleed icons for the extension manifest. Export all four sizes from a single 128x128 frame.

## Step 1: Create the frame

1. Press `F`, draw any rectangle on the canvas.
2. In the right panel set `W` = 128, `H` = 128.
3. Set corner radius to 4.
4. Under Fill, set hex to `#18181b`, opacity 100%.
5. Remove any stroke.
6. Enable `Clip content`.
7. Rename the layer "Icon".

## Step 2: Draw the caret glyph

1. Double-click "Icon" to enter it.
2. Press `P` to activate the Pen tool.
3. Click to place point 1 at `x=31, y=36` (top-left).
4. Click to place point 2 at `x=84, y=64` (right apex, vertically centered).
5. Click to place point 3 at `x=31, y=92` (bottom-left).
6. Press `Escape`. Leave the path open (do not close it).
7. In the right panel, set Fill to none.
8. Add a stroke: color `#ffffff`, weight `16`, cap `None`, join `Miter`.
9. Rename the layer "Glyph".

## Step 3: Align

1. Select "Glyph", then shift-click "Icon".
2. In the top toolbar click `Align horizontal centers`, then `Align vertical centers`.

## Step 4: Export

1. Select the "Icon" frame.
2. In the right panel under Export click `+` four times to add four export entries.
3. Configure each entry:

| Size | Suffix | Format |
| ---- | ------ | ------ |
| 16w  | `-16`  | PNG    |
| 32w  | `-32`  | PNG    |
| 48w  | `-48`  | PNG    |
| 128w | `-128` | PNG    |

4. Click `Export Icon`. Figma exports four files.
5. Rename and move each file:

| Exported file  | Save as                |
| -------------- | ---------------------- |
| `Icon-16.png`  | `public/icons/16.png`  |
| `Icon-32.png`  | `public/icons/32.png`  |
| `Icon-48.png`  | `public/icons/48.png`  |
| `Icon-128.png` | `public/icons/128.png` |
