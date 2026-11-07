# Ideas and Hints

- Take the last digit with `N % 10`.
- Add it to `sum`.
- Remove it with `N = N / 10`.
- Repeat until no digits remain.

## Traps

- Start `sum` at `0`, not `1`.
- A zero digit must still be processed, even though adding it changes nothing.
- For `N = 0`, the answer is usually `0`, but the loop may need a special
  case depending on the exact code.
- If negative values are allowed, decide whether the problem wants the sign
  ignored.
