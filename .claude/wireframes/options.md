---
title: Options page
description: Per-site trigger config, data import/export, and GitHub sync credentials.
---

# Options page

Section order: Data → Per-site configuration → GitHub sync.

## Data section

```plaintext
┌─────────────────────────────────────────────┐
│ Data                                        │
│ Export your prompts as a backup or restore  │
│ from a previous export.                     │
├─────────────────────────────────────────────┤
│ [↓ Export prompts as JSON            ]      │
│ [↑ Import prompts from JSON          ]      │
│                                             │
│ Exported ✓                                  │  ← export feedback, fades after 2.5s
│ Nothing to export.                          │  ← shown instead when library is empty
│ Updated 2: baz, qux. Added 1: foo.          │  ← import feedback, single line
│ Added 5: a, b, c and 2 more.                │  ← truncates after 3 names
│ All prompts are already up to date.         │  ← when import produces no changes
└─────────────────────────────────────────────┘
```

## Per-site configuration section

```plaintext
┌─────────────────────────────────────────────┐
│ Per-site configuration                      │
│ Configure the trigger symbol and toggle     │
│ Caret integration for supported platforms.  │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ claude.ai                               │ │
│ │ [✓] Enable Caret on this site           │ │
│ │                              Trigger    │ │
│ │                              [ > ]      │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ gemini.google.com                       │ │
│ │ [✓] Enable Caret on this site           │ │
│ │                              Trigger    │ │
│ │                              [ > ]      │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ chatgpt.com                             │ │
│ │ [✓] Enable Caret on this site           │ │
│ │                              Trigger    │ │
│ │                              [ > ]      │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ [💾 Save]                       Saved ✓      │  ← Save left-aligned, "Saved ✓" ml-auto, fades after 2.5s
└─────────────────────────────────────────────┘
```

Notes on per-site rows:

- On `sm+` screens the trigger input floats right. On mobile it goes full-width below
- Invalid trigger (non-symbol or empty): red `"Enter a single non-letter symbol"` below input, shown only after blur
- `/` on claude.ai or chatgpt.com: amber `"/ conflicts with this site's native slash menu"` below input
- Save button disabled while any enabled site has an invalid trigger

## GitHub sync section

```plaintext
┌─────────────────────────────────────────────┐
│ GitHub sync                                 │
│ Pull prompts from a GitHub repository.      │
│ Read-only. GitHub is the source of truth.   │
├─────────────────────────────────────────────┤
│ Personal access token ?                     │
│ ┌─────────────────────────────────────┐     │
│ │ ghp_••••••••••••••••••••••••••••••  │     │
│ └─────────────────────────────────────┘     │
│ Create a token on GitHub →                  │
│                                             │
│ Repository ?        Branch ?                │
│ ┌──────────────┐    ┌──────────────┐        │
│ │ owner/repo   │    │ main         │        │
│ └──────────────┘    └──────────────┘        │
│                                             │
│ Snippets path ?                             │
│ ┌─────────────────────────────────────┐     │
│ │ snippets                            │     │
│ └─────────────────────────────────────┘     │
├─────────────────────────────────────────────┤
│ [💾 Save]  ● Connected   Saved ✓  [Disconnect] │  ← Save left, Saved ✓ + Disconnect ml-auto right
│                                               │    Disconnect shown only when GitHub configured
│ connection error message (if any)             │    Hint on Disconnect shown as tooltip on hover
└───────────────────────────────────────────────┘
```

Behavior:

**Data**

- Export downloads `caret-backup.json`. Shows "Exported ✓" (muted color) inline right of the button, fades after 2.5s. Shows "Nothing to export." in destructive color instead when the library is empty
- Import validates JSON with Zod before writing to storage. Shows error on invalid file
- Import merge conflict (duplicate name): last-write-wins

**Per-site**

- Trigger symbol editable per site. Toggle enable/disable per site without losing trigger config

**GitHub sync**

- PAT: full width, masked, displayed masked after save, not encrypted (documented risk). No inline validation on format. Errors surface only after a failed save attempt.
- Repository and Branch: side by side, equal width
- Snippets path: full width. "Enter a snippets path" inline error below the field on blur when empty.
- `?` icon on each field label opens a tooltip with usage hint, no arrow on tooltip
- `●` connection dot: green = connected, red = error, gray = not configured or dirty (any field edited since last save). Resets to gray on any field change. Updates on save.
- Save is blocked when repository is empty or snippets path is empty, even before the user touches those fields
- "Saved ✓" appears inline right of Save button, fades after 2.5s
- Disconnect shown only when GitHub is configured. No confirmation dialog
- Constrained max width, centered

## Appearance

- Max width 640px, centered. Sections stack vertically with a consistent footer row
- Section headers use full-contrast foreground text to create hierarchy against the muted description text below
- Save button is left-aligned in every section footer. Feedback text is pushed to the far right
- Destructive actions sit in the same footer row as Save. Supplementary hints show as a tooltip on hover, not inline
- "Saved ✓" and "No changes" are visually identical in placement and style. The copy difference is the only signal of whether a write occurred
