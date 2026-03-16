# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- content: add trigger detection and command palette UI in chat inputs
- content: invoke prompts via fuzzy-search dropdown
- design-system: initialize shadcn/ui with zinc mono color scale
- fuzzy: add fuzzy matching for prompt search
- github-sync: add prompt synchronization
- icons: add extension icons
- options: add 'Settings saved' feedback
- options: add data import/export section
- options: add link to generate GitHub PAT
- options: add per-site settings page
- options: integrate GitHub sync configuration UI
- options: validate trigger symbols on settings page
- popup: prompt library UI with list, create, edit, and delete
- prompt-form: add kebab-case validation for prompt names
- prompt-form: implement two-anchor dirty discard confirmation
- prompt-form: implement dirty state warning
- prompt-library: add clear button to search input
- prompt-library: add tabbed view and search functionality
- prompt-library: integrate GitHub sync view
- prompts: insert selected prompt content into chat inputs
- prompts: sort by updated date and source
- sidepanel: prompt library UI with list, create, edit, and delete
- storage: dev seeding with sample prompts on first run
- storage: prompt and settings CRUD via chrome.storage.local
- ui: add tooltip and GitHub sync view components

### Changed

- content: improve prompt filtering within dropdown
- design-system: adjust dark mode background and accent colors
- design-system: button variants updated to outline and ghost for reduced visual weight
- design-system: dark mode background and surface colors softened from near-black to dark grey
- prompt-list: refine hover styles
- project: rename to Caret and refine description
- sidepanel: add base background color
- ui: adjust options page header and sidepanel background styles
- ui: migrate primary management interface to the sidepanel

### Fixed

- dropdown: dismiss on outside click and window resize
- ui: improve dropdown and options interactions
