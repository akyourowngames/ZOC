# How to Think About It

## 1. Restate the task

Given `N >= 0`, report how many decimal digits it has. `5072` has four, `10` has
two, `0` has one. Leading zeros do not exist in an integer, so `007` is simply
`7` and has one digit.

## 2. Spot the pattern

Watch what division by `10` does:

```text
5072 / 10 = 507
 507 / 10 = 50
  50 / 10 = 5
   5 / 10 = 0
```

Each step shortens the decimal representation by exactly one digit. The value
hits zero precisely when every digit has been removed. So "count the digits" is
the same as "count the divisions until zero".

This is the same `% 10` / `/ 10` machinery used to extract digits, except here
you throw the digit away and keep only the step count.

## 3. Derive the algorithm

1. Read `N`.
2. `count = 0`.
3. While `N > 0`:
   - `count = count + 1` — one digit accounted for;
   - `N = N / 10` — remove it.
4. Print `count`.

Two structural details matter:

- The update `N = N / 10` must be inside the loop; without it the condition
  never changes and the loop hangs.
- The guard `N > 0` fails for `N = 0`, even though `0` is one digit. Fix it with
  `if (N == 0) count = 1;`, or use a `do...while` loop that always runs once.

## 4. Dry run

`N = 5072`:

| iteration | `N` before | `count` after | `N` after `/10` |
| --- | --- | --- | --- |
| 1 | 5072 | 1 | 507 |
| 2 | 507 | 2 | 50 |
| 3 | 50 | 3 | 5 |
| 4 | 5 | 4 | 0 |
| exit | 0 | 4 | — |

Output `4`.

`N = 10`: `10 -> 1 -> 0`, two iterations, output `2`. The zero digit costs an
iteration even though it contributes no value.

`N = 0`: the first test `0 > 0` is false, so the body never runs and `0` is
printed — the known defect. A `do...while` version would print `1`.

`N = 2147483647`: ten iterations (the value is `2^31 - 1`, the largest `int`),
output `10`.

## Progressive hints

1. Which arithmetic operation shortens a number by one decimal position?
2. What is the smallest value at which "no digits left" is true?
3. What should you count — the divisions, or the remainders? (Either, but the
   divisions are simpler here.)
4. Try `N = 0` on paper. Does your loop run at all?

## Traps

- Forgetting `N = N / 10`, which produces an infinite loop.
- Using `N >= 0` as the condition: `0 / 10 == 0` keeps it true forever.
- Treating `0` as zero digits; by convention it has one.
- Negative input with `N > 0`: the loop is skipped and `0` is printed, hiding the
  sign issue entirely.
- Expecting `log10` to be exact: `log10(1000)` can be `2.9999999999999996`, and
  truncating gives `2`. Floating point is a poor digit counter.
- Dividing with `%` by mistake: `N % 10` keeps the last digit forever, so the
  loop never reaches zero.

## Self-check

- What is the answer for `N = 9`? (`1`)
- What is the answer for `N = 1000`? (`4`)
- How many iterations for `N = 999999999`? (`9`)
- Why does `10` count as two digits when its last digit is zero?
- What is the largest digit count possible for a 32-bit signed `int`? (`10`)

Extension: write the same loop but accumulate `sum` instead of `count` — that is
exactly the next folder, `16-sum-of-digits-of-a-number`.
