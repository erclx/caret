# Wireframes

> ASCII wireframes for planning purposes. Not final design — structure and layout only.

## 1. In-Chat Dropdown (Command Palette)

Appears above the chat input when user types the trigger symbol (default `>`).

```
┌─────────────────────────────────────────┐
│ 🔍 summarize...                         │
├─────────────────────────────────────────┤
│ ▶ summarize        Summarize the fol... │  ← selected
│   fix-grammar      Fix grammar and s... │
│   explain-code     Explain this code... │
│   bullet-points    Convert this into... │
│   eli5             Explain this like... │
│   translate-en     Translate the fol... │
├─────────────────────────────────────────┤
│ ↑↓ navigate · Enter insert · Esc close  │
└─────────────────────────────────────────┘
        ▲ anchored above input
┌─────────────────────────────────────────┐
│ > summarize█                            │  ← chat input
└─────────────────────────────────────────┘
```

**Behavior:**

- Trigger: user types `>` (configurable per site)
- Filters in real time as user types after trigger
- Max 6 rows visible before scroll
- Keyboard: ↑↓, Ctrl+J/K, Ctrl+N/P to navigate · Enter to insert · Esc to dismiss
- Empty state: "No prompts yet — click the extension icon to add one"

## 2. Popup

Appears when user clicks the extension icon. Compact.

```
┌──────────────────────────┐
│ ⚡ Caret       ⚙️  │
├──────────────────────────┤
│ 🔍 Search prompts...     │
├──────────────────────────┤
│ summarize                │
│ fix-grammar              │
│ explain-code             │
│ bullet-points            │
│ eli5                     │
├──────────────────────────┤
│ + New prompt             │
└──────────────────────────┘
```

**Behavior:**

- ⚙️ opens Options page in new tab
- Click any prompt to edit
- \+ New prompt opens inline form

## 3. Sidepanel

Wider than popup. Persistent alongside the chat. Inline editing — no new tab.

### List View

```
┌────────────────────────────────┐
│ ⚡ Caret            ⚙️   │
├────────────────────────────────┤
│ 🔍 Search prompts...           │
├────────────────────────────────┤
│ summarize                  ✏️  │
│ Summarize the following...     │
├────────────────────────────────┤
│ fix-grammar                ✏️  │
│ Fix grammar and spelling...    │
├────────────────────────────────┤
│ explain-code               ✏️  │
│ Explain this code in simp...   │
├────────────────────────────────┤
│ + New prompt                   │
└────────────────────────────────┘
```

### Edit View (click ✏️ — transitions in-place, no new tab)

```
┌────────────────────────────────┐
│ ← Back                         │
├────────────────────────────────┤
│ Name                           │
│ ┌──────────────────────────┐   │
│ │ summarize                │   │
│ └──────────────────────────┘   │
│                                │
│ Prompt body                    │
│ ┌──────────────────────────┐   │
│ │ Summarize the following  │   │
│ │ text in 3 bullet points: │   │
│ │                          │   │
│ └──────────────────────────┘   │
│                                │
│ [Save]          [Delete 🗑️]    │
└────────────────────────────────┘
```

**Behavior:**

- ← Back returns to list, discards unsaved changes
- Save updates prompt in storage immediately
- Delete shows confirmation before removing

## 4. Options Page

Opens in a new tab. Full settings surface.

```
┌─────────────────────────────────────────────┐
│ ⚡ Caret — Settings                   │
├─────────────────────────────────────────────┤
│ TRIGGER SYMBOLS                             │
│                                             │
│ claude.ai       [ > ] ✏️    [✅ enabled]    │
│ gemini.google   [ > ] ✏️    [✅ enabled]    │
│ chatgpt.com     [ > ] ✏️    [✅ enabled]    │
│                                             │
├─────────────────────────────────────────────┤
│ DATA                                        │
│                                             │
│ [⬇️ Export prompts as JSON]                 │
│ [⬆️ Import prompts from JSON]               │
│                                             │
└─────────────────────────────────────────────┘
```

**Behavior:**

- Trigger symbol is editable per site inline
- Toggle enable/disable per site without losing its trigger config
- Export downloads `caret-backup.json`
- Import validates JSON with Zod before writing to storage
