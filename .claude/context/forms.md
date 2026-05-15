---
title: Forms
description: Validation timing pattern, post-save navigation, and the single-`useSettings` parent gate
---

# Forms

A pattern, not a single file. The same validation and save-feedback shape repeats in `src/shared/components/prompt-form.tsx`, `src/options/site-config-section.tsx`, and `src/options/github-section.tsx`.

## Validation timing: blur-first, then live

All form fields validate on blur first, then re-validate on every subsequent change once touched. Errors never appear before a field has been blurred. After first blur, errors update immediately as the user types, so fixes register without a second tab-away.

Each field carries an explicit `isTouched` boolean rather than inferring touched state from error presence or empty-value guards. The implicit pattern (suppressing errors when the value is empty) was a pre-existing violation that relied on coincidental behavior. Explicit flags make the intent clear and prevent regression.

This applies to the prompt form (name and body) and to the GitHub section (repo, branch, snippets path), which already used the same pattern before this decision was recorded.

## Post-save navigation: form-owned with feedback delay

After a successful save, the form shows a brief confirmation before navigating back to the list. The parent component is responsible only for persistence. Navigation timing belongs to the form so it controls the feedback window. If the parent navigated immediately on save, the form would unmount before feedback could render.

## Options page: single `useSettings` instance

`useSettings` is called once in `src/options/app.tsx`. `settings`, `updateSettings`, and `updateSiteSettings` are passed as props to child sections. Each child calling the hook independently creates a separate async load, so local `useState` initializers run before data arrives and fields reset to defaults. Owning the single call in the loading-gate parent guarantees children mount with fully-loaded data.
