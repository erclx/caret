---
title: Trigger to insertion
description: What runs between the user typing the trigger symbol and the prompt landing in the chat input, drawn from trigger detection
category: Request flow
verified: cdf535c 2026-08-06
---

# Trigger to insertion

```mermaid
sequenceDiagram
  accTitle: The path from a typed trigger symbol to inserted prompt text
  accDescr: The user types a trigger into the site, the content script validates the caret position and reads storage, the dropdown opens at the cursor, and the chosen prompt is inserted back into the site.

  actor User
  participant Site as Target site DOM
  participant Content as Content script
  participant Storage as chrome.storage.local
  participant Dropdown as Dropdown UI

  User->>Site: types ">" plus query
  Site-->>Content: input event
  Content->>Content: validate position 0 or after whitespace
  Content->>Storage: read prompts and settings
  Storage-->>Content: prompt list
  Content->>Dropdown: open anchored at cursor
  User->>Dropdown: arrow keys, Enter
  Dropdown->>Site: execCommand insertText
  Dropdown-->>User: dismiss, focus returns to input
```

A prompt reaches the chat input through a sequence the content script drives from end to end. The user types the trigger symbol, the content script confirms the caret sits at position 0 or after whitespace, and only then does it read storage and open the dropdown.

The position check runs ahead of the storage read so a mid-word trigger character never costs a storage round trip. Insertion goes through `execCommand insertText` rather than assigning to the element's value, because the target sites run rich-text editors that discard a value set out from under them. Read `src/content/` for the per-site adapters and `.claude/context/trigger.md` for how each one detects its input element.
