---
title: Trigger detection
description: Per-site input adapters, trigger-symbol activation, and keyboard navigation in the content script
---

# Trigger detection

The content script watches each target site's chat input for the configured trigger symbol and opens the dropdown when activation conditions match. Files live under `src/content/input/` (detector, adapters, site-observer) and `src/content/hooks/use-input-detection.ts`.

## Default symbol: `>`

Claude.ai natively intercepts `/` for its own command menu. Using `>` by default avoids DOM race conditions. Users can override per site in options.

`/` is not blocked as a trigger value. If a user saves `/` for `claude.ai` or `chatgpt.com`, `site-config-section.tsx` shows an amber warning immediately on load and while the value is active. The warning is non-blocking: the user can still save. Gemini has no native slash command, so no warning is shown there.

## Word boundary rule

The trigger symbol only fires when it appears at position 0 in the input, or is immediately preceded by whitespace. Typing a symbol mid-word (e.g. `word>`) must not open the dropdown. Detection checks the character at `cursorPosition - 1` before activating.

## Per-site input adapters

Each target site renders its chat input differently:

- Claude.ai: contenteditable div (ProseMirror)
- Gemini: contenteditable div
- ChatGPT: contenteditable div (also ProseMirror-based)

Insertion uses `document.execCommand('insertText')` which triggers framework synthetic events on all three. Abstracted behind an input adapter per site (`adapters.ts`).

The contenteditable adapter maintains two text representations. Cursor position uses raw text content offsets so the insertion path can map positions back to DOM nodes. Text-before-cursor uses rendered range text so trigger validation sees newlines at block boundaries. Browsers omit the trailing newline when a range ends at the start of a block element, so the adapter detects block boundaries and injects the missing newline.

## Keyboard navigation

- ↑↓, Ctrl+J / Cmd+J (down), Ctrl+P / Cmd+P (up) navigate. Both `ctrlKey` and `metaKey` are accepted so Mac users can use the native modifier.
- Enter or Tab inserts. Escape dismisses.
- Ctrl+K and Ctrl+N are intentionally excluded. Ctrl+K conflicts with Claude.ai's native formatting shortcut.
- Handled via keydown listener on window (capture phase) to intercept before host page handlers fire.

## Risks

- Claude.ai uses ProseMirror. `execCommand` still triggers its synthetic events today, but a future ProseMirror release could break that path and force the adapter to dispatch a custom transaction instead.
- ChatGPT DOM structure changes frequently. Content script selector targeting is fragile and lives in `site-observer.ts`.
