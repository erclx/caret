# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- assets: add updated extension icons and store assets
- docs: add comprehensive guide for Chrome Web Store listing
- store: add full and short descriptions for Chrome Web Store listing
- snippets: add step-by-step generator and refine Figma prompt
- docs: add privacy policy

### Changed

- ci: update Chrome Web Store section to reference listing guide
- store: refine Chrome Web Store listing steps and privacy section
- prompts: replace seed prompts with general-purpose examples
- readme: overhaul content for clarity and store readiness
- extension: update extension name to 'Caret' and remove 'contentSettings' permission

### Added

- prompt library: add screen reader only heading
- options: add screen reader only heading
- ui: add SVG logo component and integrate into UI
- options: enhance UI and add PAT link
- prompts: add onboarding empty state for new users
- github: add connection health, disconnect, and UX improvements
- github-sync: auto-cancel on config change
- github: config validation and connection testing
- content: add trigger detection and command palette UI in chat inputs
- content: invoke prompts via fuzzy-search dropdown
- design-system: initialize shadcn/ui with zinc mono color scale
- fuzzy: add fuzzy matching for prompt search
- icons: add extension icons
- options: add 'Settings saved' feedback
- options: add per-site settings page
- options: display detailed import feedback
- options: integrate GitHub sync configuration UI
- options: validate trigger symbols on settings page
- popup: prompt library UI with list, create, edit, and delete
- prompt-form: add kebab-case validation for prompt names
- prompt-library: integrate GitHub sync view
- prompts: sort by updated date and source
- sidepanel: prompt library UI with list, create, edit, and delete
- storage: dev seeding with sample prompts on first run
- storage: prompt and settings CRUD via chrome.storage.local
- ui: add tooltip and GitHub sync view components
- prompt-form: add duplicate name validation
- github-sync: add visual feedback for apply
- github-sync: add disconnect and connection health persistence
- prompt-form: add discard confirmation for unsaved changes
- github-sync: add github prompt synchronization and tooltips
- data-io: add prompt import/export and search clear button
- prompt-library: implement tabbed view and search, update prompt form
- prompts: enable insertion and improve filtering

### Changed

- options: enhance UI for settings page
- content: improve prompt filtering within dropdown
- design-system: adjust dark mode background and accent colors
- design-system: button variants updated to outline and ghost for reduced visual weight
- design-system: dark mode background and surface colors softened from near-black to dark grey
- prompt-list: refine hover styles
- project: rename to Caret and refine description
- sidepanel: add base background color
- ui: adjust options page header and sidepanel background styles
- github-sync: refine connection status logic
- sidepanel: migrate primary interface from popup

### Fixed

- github-sync: preserve local prompts on name collision with remote snippets
- github-sync: show sync review screen when only skipped changes are detected
- logo: adjust polyline points for visual accuracy
- prompt-form: handle Esc key to cancel edit or dismiss discard
- options: polish UI layout and styling for options page
- options: guard saved feedback and validate trigger input
- dropdown: dismiss on outside click and window resize
- ui: improve dropdown and options interactions
- prompt-form: correct duplicate name validation for editing
- github-sync: add guard for missing github config
- github: handle missing github config during sync
- options: refine options page and error copy
- github: clear sync feedback timer on unmount
- options: pass settings through props from single hook
- options: display slash conflict warning for sensitive sites
- ui: reduce focus ring thickness and prevent clipping
- input: normalize trailing space after prompt insertion
