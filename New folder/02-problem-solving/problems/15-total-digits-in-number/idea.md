# Ideas and Hints

- Start `count` at `0`.
- While the number is not zero, divide it by `10` and increase `count`.
- Check `N = 1`, `N = 10`, and `N = 1000`.

## Traps

- `0` has one digit.
- If negative numbers are allowed, work with the absolute value.
- Do not use `N / 10` without updating `N`; that creates an infinite loop.
- The loop changes `N`, so save the original first if you need it later.
