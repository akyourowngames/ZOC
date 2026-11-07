# Ideas and Hints

## Loop hint

Start `sum` at zero and add each value from `0` through `N`. Increase the
counter once per iteration.

## Faster formula

For non-negative `N`, the same answer is:

```text
N * (N + 1) / 2
```

## Traps

- Make sure the loop eventually stops.
- Decide whether the endpoint `N` is included.
- Use a wide enough type for the sum, not just for `N`.
- For very large `N`, the formula is faster but can still overflow.
