# Menu List 2 Route Hardening Design

## Goal

Prevent the sidebar menu from producing broken navigation targets while company context is loading or when a parent menu only works as a submenu container.

## Approach

Add a final normalization pass in `lib/menu-list-2.tsx` after role and module filtering.

- Empty href values are invalid.
- Any href containing `undefined` is invalid.
- Only submenus with valid hrefs remain.
- Container menus without a direct route inherit the first valid submenu route.
- Leaf menus without a valid route are removed from the final menu tree.

## Expected Outcome

- The sidebar does not render `href=""`.
- Company-scoped links do not render with `undefined` in the path.
- Empty groups disappear automatically after normalization.
