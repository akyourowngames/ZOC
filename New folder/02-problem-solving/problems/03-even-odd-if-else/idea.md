# Ideas and Hints

## Hint

Divide the number by `2` and inspect the remainder. There are only two cases:
remainder `0`, or a non-zero remainder.

## Traps

- Write `N % 2 == 0`, not `N % 2 = 0`. One equals sign assigns; two compare.
- Do not check whether `N / 2` is an integer. `%` is clearer.
- Zero is even.
- Negative numbers can also be checked with `% 2`.
- Output spelling, capital letters, punctuation, and extra spaces may matter.

## Thinking habit

Before coding, list the cases:

| Condition | Result |
|---|---|
| `N % 2 == 0` | even |
| otherwise | odd |
