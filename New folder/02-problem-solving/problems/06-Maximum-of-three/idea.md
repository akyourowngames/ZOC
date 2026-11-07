# Ideas and Hints

## Hint 1: direct cases

Check whether `A` is at least as large as both other values. If not, check
`B`. Otherwise `C` is the maximum.

## Hint 2: running maximum

Start with `maximum = A`. Then compare `B` and `C` one at a time:

```cpp
maximum = max(maximum, B);
maximum = max(maximum, C);
```

## Traps

- With strict comparisons such as `A > B && A > C`, ties may fall into the
  final `else` branch incorrectly.
- Test `A == B`, `B == C`, and `A == C`.
- All values being negative is valid; do not start with `0` unless the
  constraints guarantee non-negative input.
- The maximum is a value, not an index or a count.
