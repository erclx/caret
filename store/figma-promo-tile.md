# Figma steps: Caret promo tile

Produces the 440×280 small promo tile for the Chrome Web Store listing.

## Step 1: Create the frame

1. Press `F`, draw any rectangle on the canvas.
2. In the right panel set `W` = 440, `H` = 280.
3. Under Fill, set hex to `#18181b`, opacity 100%.
4. Remove any stroke.
5. Rename the layer "Promo Tile".

## Step 2: Place the logo

1. Copy the "Icon" frame from the `figma-icons.md` file in the same Figma document.
2. Paste it inside "Promo Tile".
3. In the right panel set `W` = 80, `H` = 80.
4. Rename the layer "Logo".

## Step 3: Add the name

1. Press `T` to activate the Text tool.
2. Click inside "Promo Tile" and type `Caret`.
3. In the right panel set font to `Geist`, size `48`, weight `Semibold`.
4. Set fill to `#ffffff`.
5. Rename the layer "Name".

## Step 4: Add the tagline

1. Press `T` to activate the Text tool.
2. Click inside "Promo Tile" and type `Prompt library for AI chat`.
3. In the right panel set font to `Geist`, size `16`, weight `Regular`.
4. Set fill to `#a1a1aa`.
5. Rename the layer "Tagline".

## Step 5: Arrange and align

1. Position "Logo" at the top, "Name" below it, "Tagline" below that.
2. Select all three layers.
3. In the right panel click `Align horizontal centers`.
4. Set vertical spacing between layers to `12`.
5. Group the three layers: `Ctrl+G`. Rename the group "Content".
6. Select "Content", then shift-click "Promo Tile".
7. Click `Align horizontal centers`, then `Align vertical centers`.

## Step 6: Export

1. Select the "Promo Tile" frame.
2. In the right panel under Export click `+`.
3. Configure the entry:

| Size | Format |
| ---- | ------ |
| 1x   | PNG    |

4. Click `Export Promo Tile`.
5. Save the exported file as `store/promo-440x280.png`.
