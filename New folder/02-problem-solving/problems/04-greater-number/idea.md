# Ideas and Hints

## Hint

Ask one question: is `A < B`? If yes, print `B`; otherwise print `A`.

The `else` branch naturally handles both `A > B` and `A == B`.

## Traps

- Do not compare strings when the input is numeric.
- Do not accidentally print both values.
- Negative numbers still follow ordinary number order: `-4` is greater than
  `-9`.
- If the task asks for the greater value, do not print the position or a
  message unless explicitly requested.

## Alternative

`std::max(A, B)` can express the same idea after including `<algorithm>`, but
the `if`/`else` version is useful while learning conditions.
