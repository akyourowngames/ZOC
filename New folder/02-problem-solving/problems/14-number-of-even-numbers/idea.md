# Ideas and Hints

## Hint 1: count with a loop

Visit each number from `1` to `N`. If `i % 2 == 0`, increase the counter.

## Hint 2: use a formula

For positive `N`, the number of even values from `1` to `N` is:

```text
N / 2
```

Integer division automatically drops the fraction.

## Traps

- Count even numbers; do not add their values.
- Do not count `0` unless the problem range explicitly starts at `0`.
- For `N = 1`, the answer is `0`.
- The current `else { num = num; }` does nothing and can be removed.
