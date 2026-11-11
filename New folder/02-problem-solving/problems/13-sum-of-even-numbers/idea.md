# How to Think About It

## 1. Restate the task

Add up the even numbers in `[2, N]`. Not the count — the sum. Not all numbers —
only even ones. `N` may be odd, in which case the last usable value is `N - 1`.

## 2. Spot the pattern

Two observations:

- Every even number is `2 * k` for some `k >= 1`, so the series is `2, 4, 6, ...`,
  a fixed step of `2`. A counter that jumps by `2` needs no `%` test.
- The series is an arithmetic progression, so its total has a closed form.

Both routes are valid. The loop is the clearer first implementation; the formula
is what you reach for when `N` can be huge.

## 3. Derive the algorithm

1. Read `N`.
2. `sum = 0` — the identity for addition.
3. `i = 2` — the first even positive integer.
4. While `i <= N`: add `i`, then `i += 2`.
5. Print `sum`.

The guard `i <= N` also handles odd `N`: after `i = N - 1` is added, `i` becomes
`N + 1`, which fails the test. No `if (N % 2 == 1)` branch is required.

## 4. Dry run

`N = 8`:

| iteration | `i` | `sum` before | `sum` after |
| --- | --- | --- | --- |
| 1 | 2 | 0 | 2 |
| 2 | 4 | 2 | 6 |
| 3 | 6 | 6 | 12 |
| 4 | 8 | 12 | 20 |
| exit | 10 | 20 | — |

`10 <= 8` is false, so `20` is printed.

`N = 9` runs exactly the same four iterations, because the counter only ever
holds even values. After adding `8` the sum is `20` and `i` becomes `10`; the
test `10 <= 9` fails, so the answer is still `20`. The value `9` never enters
the loop at all.

`N = 1`: first test `2 <= 1` fails, output `0`.

## Progressive hints

1. What is the difference between consecutive even numbers?
2. If you start at `2` and add that difference each time, do you ever land on an
   odd number?
3. Which comparison keeps the largest even number `<= N` and drops `N + 1`?
4. Count the terms by hand for `N = 8` and `N = 9`; notice that both give `4`.

## Traps

- Using `i++` with `if (i % 2 == 0)`: correct but twice the iterations and an
  easy place to forget the condition.
- Starting at `0` is harmless for the sum but misstates the series; if the
  problem later asks for the count of terms, the off-by-one matters.
- `i < N` instead of `i <= N` drops `N` when `N` is even: `N = 8` would give
  `12`.
- Assuming odd `N` needs a branch; the loop guard already handles it.
- `sum` as `int` fails at `N = 92682`; the total is quadratic in `N`.
- Publishing a formula without reducing first: `N * (N + 2) / 4` is correct for
  even `N`, but `92682 * 92684 ≈ 8.6 * 10^9` overflows `int` *before* the
  division. Divide first (`m = N / 2`) so the product stays `m * (m + 1)`.

## Self-check

- What does `N = 2` print? (`2`)
- What does `N = 3` print? (`2`)
- How many iterations for `N = 100`? (`50`)
- What is the closed form in terms of `m = N / 2`? (`m * (m + 1)`)
- At which `N` does the `int` answer break? (`92682`)

Extension: change the step to `3` and sum multiples of three. The structure is
identical; only the starting value, the step, and the last term change.
