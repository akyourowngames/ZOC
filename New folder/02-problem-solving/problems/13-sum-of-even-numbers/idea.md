# Ideas and Hints

## Hint

Start at `2` and increase by `2` each time. This avoids checking odd numbers.

## Traps

- If `N` is odd, stop at the largest even number below it.
- If `N < 2`, the sum is `0`.
- Do not accidentally start at `0` if the problem asks for positive even
  numbers, although adding zero does not change the numerical sum.
- Use a wide enough type when `N` can be large.
