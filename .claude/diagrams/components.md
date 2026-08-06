---
title: Extension components
description: How the four MV3 entry points share one module and reach Chrome APIs, drawn from the architecture record
category: Components
verified: cdf535c 2026-08-06
---

# Extension components

```mermaid
flowchart TB
  accTitle: The parts of the extension and what each one talks to
  accDescr: Three chat hosts feed a content script, four entry points sit inside the extension and all read through a shared layer, and that layer is the only path to Chrome storage and the GitHub API.

  Hosts["Target sites<br/>Claude.ai, Gemini, ChatGPT"]
  Action["chrome.action"]

  subgraph Extension["Chrome extension MV3"]
    Content["Content script<br/>src/content"]
    Bg["Background worker<br/>src/background"]
    Panel["Sidepanel<br/>src/sidepanel"]
    Options["Options page<br/>src/options"]
    Shared["Shared layer<br/>src/shared"]
  end

  Storage["chrome.storage.local"]
  GitHub["GitHub Contents API"]

  Hosts --> Content
  Action --> Bg
  Bg --> Panel
  Content --> Shared
  Panel --> Shared
  Options --> Shared
  Shared --> Storage
  Shared --> GitHub
```

The extension runs four entry points inside one MV3 package. Each of them reads and writes prompts through `src/shared/`, which is the only module that reaches `chrome.storage.local`. The content script is the sole component injected into a target site, so the three chat hosts connect to it and to nothing else inside the extension.

Routing every storage access through one shared layer is what keeps the entry points agreeing with each other when a prompt changes in any of them. Letting each entry point own its own storage calls was rejected, because the sidepanel and the content script can sit open at the same time and would drift apart. The dotted edge marks the popup as dormant and kept for rollback. Open `src/shared/hooks` for the read path and `src/content/` for the injection side.
