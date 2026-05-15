---
title: Dropdown
description: Command palette positioning, anchoring, and the shared filtering strategy
---

# Dropdown

The in-chat command palette. Implementation in `src/content/views/dropdown/`. Filtering uses the shared `src/shared/utils/fuzzy.ts` utility, which is also consumed by the sidepanel list.

## Command palette style, above input

Rendered as a React root injected adjacent to the detected input element. Positioned `fixed` using coordinates from `range.getBoundingClientRect()` on the active cursor range, with left and width from the input element's bounding rect. Anchoring to the cursor line (not the element top or bottom) keeps the dropdown just above where the user is typing regardless of input height. `translateY(-100%)` lifts the dropdown above that line. ResizeObserver watches for resize to reposition. 6 rows visible, scrollable. Each row: prompt name + truncated body preview.

When the caret rect has zero height (collapsed range on an empty line), the adapter falls back to the cursor's containing element rect before falling back to the full input element rect. This keeps the dropdown near the cursor line in expanded inputs rather than snapping to the input's top edge.

## Filtering strategy

The trigger dropdown filters on `name` only across all prompts, regardless of label. Results sort by `scoreMatch`: prefix = 2, substring = 1, fuzzy-only = 0.

The sidepanel list reuses the same `fuzzy.ts` module but adds a second dimension:

- Text search on `name`
- Label filter popover (multi-select, opened from a button at the right of the search row)

Both apply with AND logic when set. When label filters are active, unlabeled prompts are hidden. Label filter state is session-only and resets to all on close.

The filter-aware empty state fires only when unfiltered prompts exist. If a query is active but all prompts have been deleted, the standard empty state shows instead of the filter-aware one. Without this guard, deleting the last prompt while a search is active produces a misleading "no results" message rather than the correct "no prompts" state.
