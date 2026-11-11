# How to Think About It

## 1. Restate the task

You get one integer. Say whether it is even or odd, using the exact word the
problem requires, and nothing else.

## 2. Spot the pattern

Evenness is not about size, sign or digits; it is about divisibility by `2`.
Divisibility is a remainder question, and the remainder is either `0` or not.
Two outcomes from one test is exactly the shape of `if`/`else`.

## 3. Derive the algorithm

1. Read `N`.
2. Compute `N % 2`.
3. If the remainder is `0`, print `even`.
4. Otherwise (the remainder is `1` or `-1`), print `odd`.
5. Stop.

The `else` branch needs no condition because "integer that is not even" is
the definition of odd. Writing `else if (N % 2 == 1)` would be a subtle bug:
for negative odd numbers `N % 2` is `-1`, not `1`, and that input would print
nothing at all.

## 4. Dry run

Input `N = 8`:

| Step | Value |
| --- | --- |
| `N % 2` | `0` |
| `0 == 0` | `true` |
| branch | even |
| printed | `even` |

Input `N = 7`:

| Step | Value |
| --- | --- |
| `N % 2` | `1` |
| `1 == 0` | `false` |
| branch | else |
| printed | `odd` |

Input `N = -3`:

| Step | Value |
| --- | --- |
| `N % 2` | `-1` (sign follows the dividend) |
| `-1 == 0` | `false` |
| branch | else |
| printed | `odd` |

Input `N = 0`: `0 % 2` is `0`, so the even branch runs. Zero is even.

## Progressive hints

1. How would you check by hand whether `42` is even? You divide by `2` and
   look at what is left over. That leftover is `%`.
2. Write the condition as a question with a yes/no answer:
   "is the remainder zero?"
3. There are two possible answers, so you need two output lines in the code —
   one per branch.
4. Compare against the statement's exact word; copy it, do not retype it from
   memory.
5. Test `0`, a negative odd number, and the largest value you allow.

## Traps

- `N % 2 = 0` does not compile as a condition: `=` is assignment. It is the
  single most common typo in this exercise.
- `if (N % 2 == 1)` misses negative odds, because `-3 % 2 == -1`.
- Testing `N / 2` instead of `N % 2` throws away the information you need:
  `7 / 2` is `3`, an integer, just like `8 / 2`.
- Adding a period or a sentence (`N is even.`) changes the output.
- Putting a semicolon right after the condition (`if (x);`) leaves an empty
  body and prints nothing.
- Assuming `N` is positive if the statement never says so.

## Self-check

- What are the only two possible values of `N % 2` for positive `N`?
- Why does the same test still work for `N < 0`, and where would `== 1` fail?
- If the judge wants `EVEN`/`ODD`, what exactly do you change? (Only the
  string literals, not the condition.)
- Does your program print exactly one line for every input?
