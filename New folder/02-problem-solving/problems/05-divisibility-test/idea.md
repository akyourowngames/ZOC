# Ideas and Hints

## Hint

Use the remainder after dividing `N` by `K`. A zero remainder means that `K`
fits into `N` with no leftover.

## Traps

- The order matters: test `N % K`, not `K % N`.
- Never calculate `N % 0`.
- Do not use floating-point division for an exact divisibility test.
- Print exactly `YES` or `NO` if that is the required format.
- If negative values are allowed, the zero-remainder rule still works.

## Quick tests

Try a number divisible by itself, a number smaller than `K`, and a number that
leaves remainder `1`.
