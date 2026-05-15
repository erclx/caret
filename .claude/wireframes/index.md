---
title: Wireframes
subtitle: Per-surface ASCII layouts loaded on demand
auto: false
---

# Wireframes

ASCII wireframes for planning purposes. Structure and layout only, not final design. Update an entry when a new surface is designed or a layout decision changes.

What belongs:

- ASCII diagrams showing layout, hierarchy, and component placement
- A context sentence per section describing when and where it appears
- All meaningful states: empty, loading, error, and any variant where the layout changes significantly
- Exact UI copy strings: labels, empty states, confirmation text, hints
- Interaction rules: what triggers what, navigation flow, confirmation behavior
- Intentional omissions with a brief reason, so they are not re-added later

What does not belong:

- Implementation details (event listeners, API call counts, storage keys). Those live in ARCHITECTURE.md.
- Visual decisions (colors, spacing, typography). Those live in DESIGN.md.
- Pixel values or final measurements. Verify those in the browser.

Use `←` for inline annotations inside diagrams. Use sentence case for all text labels. Document state variants as separate subsections when the layout changes. Keep behavior bullets to UX only: what the user sees and does, not how the code handles it.

- [In-chat dropdown](dropdown.md): Command palette that appears above the chat input on supported sites.
- [Sidepanel](sidepanel.md): Prompt library UI opened by the extension icon. Houses all prompt management and GitHub sync state.
- [Options page](options.md): Per-site trigger config, data import/export, and GitHub sync credentials.
