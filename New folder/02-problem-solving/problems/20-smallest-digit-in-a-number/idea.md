# Ideas and Hints

- A decimal digit is at least `0` and at most `9`.
- Start `smallest` at `9`.
- Extract every digit with `% 10`.
- Replace `smallest` when a smaller digit is found.

## Traps

- Starting at `0` would incorrectly claim zero is smallest even when no zero
  appears.
- A number containing zero should immediately produce `0`.
- Handle `N = 0` explicitly if the constraints allow it.
- The solution changes `N`; save it first if you need the original later.
