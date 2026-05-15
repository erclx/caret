# Diagrams

Diagrams drawn from `.claude/ARCHITECTURE.md`, the per-domain entries under `.claude/context/`, and `.claude/REQUIREMENTS.md`. Update each section when its source prose changes shape, not after every refactor.

## Components

How the Chrome extension's four entry points share `src/shared/` and connect to Chrome APIs, target sites, and the GitHub API.

```mermaid
flowchart TB
  subgraph Hosts["Target sites"]
    Claude["Claude.ai"]
    Gemini["Gemini"]
    ChatGPT["ChatGPT"]
  end

  subgraph Extension["Chrome extension MV3"]
    Bg["Background worker<br/>src/background"]
    Content["Content script<br/>src/content"]
    Sidepanel["Sidepanel<br/>src/sidepanel"]
    Options["Options page<br/>src/options"]
    Popup["Popup<br/>dormant"]

    subgraph SharedLayer["src/shared"]
      Comp["components"]
      Hooks["hooks"]
      Utils["utils"]
      Types["types"]
    end
  end

  subgraph ChromeAPIs["Chrome APIs"]
    Storage["chrome.storage.local"]
    SidePanelAPI["chrome.sidePanel"]
    Action["chrome.action"]
  end

  subgraph External["External"]
    GitHub["GitHub Contents API"]
  end

  Claude --> Content
  Gemini --> Content
  ChatGPT --> Content
  Action --> Bg
  Bg --> SidePanelAPI
  SidePanelAPI --> Sidepanel
  Content --> SharedLayer
  Sidepanel --> SharedLayer
  Options --> SharedLayer
  Popup -.-> SharedLayer
  SharedLayer --> Storage
  Utils --> GitHub
```

## Trigger and insertion

What happens between the user typing the trigger symbol and the chosen prompt landing in the chat input.

```mermaid
sequenceDiagram
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

## GitHub sync pipeline

Read-only pull from a GitHub repo into the extension, with a manual diff review before changes land in storage.

```mermaid
flowchart TB
  Start["User clicks Sync now"]
  Fetch["Fetch directory listing<br/>github.fetchSnippets"]
  Recurse["Recurse subdirectories<br/>label equals folder name"]
  Compute["Compute diff against<br/>existing GitHub-sourced prompts"]
  Has{"Any changes?"}
  NoChange["Update lastSyncedAt only"]
  Review["Show diff view in sidepanel"]
  Decide{"User accepts diff?"}
  Apply["Apply surgical merge:<br/>add, update, remove"]
  Cancel["Discard fetched diff"]
  Done["Update lastSyncedAt and count"]

  Start --> Fetch
  Fetch --> Recurse
  Recurse --> Compute
  Compute --> Has
  Has -- no --> NoChange --> Done
  Has -- yes --> Review --> Decide
  Decide -- apply --> Apply --> Done
  Decide -- cancel --> Cancel
```

## Release and deploy

Tag-driven release flow from the local script through GitHub Actions to the Chrome Web Store.

```mermaid
flowchart TB
  Dev["Developer runs<br/>bun run release"]
  Script["scripts/release.sh<br/>bump version, commit, tag, push"]
  Tag["Git tag v*<br/>pushed to origin"]
  Workflow["GitHub Actions<br/>.github/workflows/release.yml"]
  Static["Static checks<br/>typecheck, lint, format, cspell"]
  Tests["Unit tests<br/>vitest"]
  Build["Production build<br/>vite plus crxjs"]
  E2e["End-to-end tests<br/>Playwright"]
  Release["Create GitHub Release<br/>changelogithub auto-notes"]
  Publish["Publish to Chrome Web Store<br/>chrome-webstore-upload-cli"]
  Live["Live on Chrome Web Store"]

  Dev --> Script
  Script --> Tag
  Tag --> Workflow
  Workflow --> Static
  Workflow --> Tests
  Workflow --> Build
  Build --> E2e
  Static --> Release
  Tests --> Release
  E2e --> Release
  Release --> Publish
  Publish --> Live
```
