# Dark mode verification

Set your OS or browser to dark mode before starting. Run `bun run dev` and load the extension.

## Sidepanel

- [ ] Open the side panel → background, text, and borders render in dark theme with no light patches.
- [ ] Open the prompt form → all fields, labels, and buttons use dark theme colors.
- [ ] Trigger the discard confirmation row → destructive styling is visible against the dark background.

## Options page

- [ ] Open the Options page → all sections (per-site config, data, GitHub sync) render correctly in dark theme.
- [ ] Hover over buttons → hover states are visible and distinct from the resting state.
- [ ] Trigger an import error → red error text is legible against the dark background.
- [ ] Trigger a save confirmation ("Saved ✓") → confirmation text is legible.

## Dropdown

- [ ] Trigger the dropdown on a supported site → dropdown background and text render in dark theme.
- [ ] Hover and arrow-key through items → active item highlight is visible.

## Switch mid-session

- [ ] Toggle OS/browser between light and dark while the side panel is open → theme updates without a reload.
