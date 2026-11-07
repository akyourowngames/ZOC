# Ideas and Hints

- A digit can only be between `0` and `9`.
- Start `largest` at `0`.
- Compare every extracted digit with `largest`.
- Update it when the digit is greater.

## Traps

- Starting at `0` is safe for ordinary decimal digits, but starting at `-1`
  is also a clear general pattern.
- Do not compare the whole remaining number; compare the extracted digit.
- Handle `N = 0` explicitly if zero is allowed.
- Negative input needs an absolute-value decision.
