---
title: In-chat dropdown
description: Command palette that appears above the chat input on supported sites when the user types the trigger symbol.
---

# In-chat dropdown

Appears above the chat input when user types the trigger symbol (default `>`).

```plaintext
┌─────────────────────────────────────────┐
│   summarize...                          │  ← no search input, filter is typed
├─────────────────────────────────────────┤  directly in chat input after trigger
│ ▶ claude · summarize  Summarize the f.. │  ← selected, label shown for labeled prompts
│   claude · fix-code   Fix and explain.. │
│   fix-grammar         Fix grammar an... │  ← unlabeled prompt, no label prefix
│   bullet-points       Convert this i... │
│   eli5                Explain this l... │
│   writing · draft     Draft an email... │
├─────────────────────────────────────────┤
│ ↑↓ navigate · Enter/Tab insert · Esc close  │
└─────────────────────────────────────────┘
        ▲ anchored above input
┌─────────────────────────────────────────┐
│ > summarize█                            │  ← chat input, typing here filters above
└─────────────────────────────────────────┘
```

Behavior:

- Labeled prompts render as `label · name` in the name line. Unlabeled prompts show name only.

**Trigger**

- User types `>` (configurable per site)
- Fires only at position 0 or immediately after whitespace. Mid-word does not trigger (e.g. `word>` must not open dropdown)
- Filters in real time as user types after the trigger symbol in the chat input. No separate search field inside the dropdown (intentional design decision)

**Keyboard**

- ↑↓, Ctrl+J / Cmd+J (down), Ctrl+P / Cmd+P (up) to navigate · Enter or Tab to insert · Esc to dismiss
- Ctrl+K and Ctrl+N are intentionally excluded. Ctrl+K conflicts with Claude.ai's native formatting shortcut

**States**

- Empty library: "No prompts yet. Click the extension icon to add one." (directs to sidepanel, not the sidepanel's own "+ New" button)
- No results: "No results." shown when the library has prompts but none match the current query
- Keyboard hint footer is hidden in both empty states. There is nothing to navigate.

**Layout**

- Max 6 rows visible before scroll
- Width matches input element exactly
- Anchored above input. Repositions when the input resizes

**Insertion**

- Removes trigger + query text, inserts prompt body at cursor position
- Dropdown dismisses and focus returns to chat input

## Appearance

- Width matches the input element exactly. Max height 280px (about 6 rows), then scrollable
- Each row shows the prompt name and a one-line truncated preview
- Labeled prompts render the `label · name` line with label and separator in `--muted-foreground` and name in `--foreground`. Unlabeled prompts show name only
- Selected row uses accent background only, no border or left bar
- Keyboard hint footer uses muted hint text. It hides when the filtered list is empty, since showing it with nothing to select is misleading
