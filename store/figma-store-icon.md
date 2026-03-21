# Figma steps: Caret store icon

Produces the Chrome Web Store icon. Artwork is 96x96 centered in a 128x128 transparent canvas with 16px padding on each side. Export the 128px size only and upload via the store dashboard.

## Step 1: Create the outer frame

1. Press `F`, draw any rectangle on the canvas.
2. In the right panel set `W` = 128, `H` = 128.
3. Set Fill to none.
4. Remove any stroke.
5. Rename the layer "Icon Store".

## Step 2: Create the container

1. Press `R`, draw a rectangle inside the "Icon Store" frame.
2. In the right panel set `W` = 96, `H` = 96, `X` = 16, `Y` = 16.
3. Set corner radius to 4.
4. Under Fill, set hex to `#18181b`, opacity 100%.
5. Remove any stroke.
6. Enable `Clip content`.
7. Rename the layer "Container".

## Step 3: Draw the caret glyph

1. Double-click "Container" to enter it.
2. Press `P` to activate the Pen tool.
3. Click to place point 1 at `x=24, y=27` (top-left).
4. Click to place point 2 at `x=63, y=48` (right apex, vertically centered).
5. Click to place point 3 at `x=24, y=69` (bottom-left).
6. Press `Escape`. Leave the path open (do not close it).
7. In the right panel, set Fill to none.
8. Add a stroke: color `#ffffff`, weight `12`, cap `None`, join `Miter`.
9. Rename the layer "Glyph".

## Step 4: Align

1. Select "Glyph", then shift-click "Container".
2. In the top toolbar click `Align horizontal centers`, then `Align vertical centers`.

## Step 5: Export

1. Select the "Icon Store" frame.
2. In the right panel under Export click `+`.
3. Configure the entry:

| Size | Format |
| ---- | ------ |
| 128w | PNG    |

4. Click `Export Icon Store`. Figma exports one file.
5. Rename `Icon Store.png` to `icon.png` and move it to `store/icon.png`.
6. Upload `store/icon.png` via the Chrome Web Store developer dashboard store icon field.
