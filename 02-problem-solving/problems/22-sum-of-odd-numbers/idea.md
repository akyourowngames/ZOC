# How to Think About It

## 1. Restate the task

Sum every odd number in `[1, N]`. `N = 7` -> `1 + 3 + 5 + 7 = 16`. `N = 8` -> `16` again,
because `8` is not odd.

## 2. Spot the pattern

A **bounded accumulation** has three parts:

1. an identity (`sum = 0`),
2. a range (`i = 1 .. N`),
3. a filter and a fold (`if odd: sum += i`).

The same shape covers "sum of even numbers", "sum of multiples of `K`", "count of numbers
satisfying P", and "sum of squares". Change the filter, keep the skeleton.

The parity filter itself has two spellings:

| Spelling | Iterations | Notes |
| --- | --- | --- |
| `for (i = 1; i <= N; i++) if (i % 2) sum += i;` | `N` | tests every integer; needs the `if` |
| `for (i = 1; i <= N; i += 2) sum += i;` | `ceil(N/2)` | no test at all; starts odd, steps by 2 |

The second is strictly better: same answer, half the work, no branch. The active code uses
a third spelling — `continue` instead of an enclosing `if` — which is the same as the first
with a flatter body.

## 3. Derive the algorithm

1. Read `N`.
2. `sum = 0`.
3. `for (int i = 1; i <= N; i++)`:
   - if `i % 2 == 0`, `continue` (skip the rest of the body),
   - `sum += i`.
4. Print `sum`.

Then ask the optimisation question: which numbers do you actually touch? Only the odd
ones, so `i += 2` visits exactly the needed terms. And the closed form removes the loop
entirely: the `k`-th odd number is `2k - 1`, and the sum of the first `k` odds is `k^2`,
where `k = (N + 1) / 2` using integer division (`N = 7` -> `k = 4` -> `16`; `N = 8` ->
`k = 4` -> `16`).

## 4. Dry run

`N = 7`

| `i` | `i % 2 == 0`? | action | `sum` |
| --- | --- | --- | --- |
| 1 | no | `+= 1` | 1 |
| 2 | yes | `continue` | 1 |
| 3 | no | `+= 3` | 4 |
| 4 | yes | `continue` | 4 |
| 5 | no | `+= 5` | 9 |
| 6 | yes | `continue` | 9 |
| 7 | no | `+= 7` | 16 |
| 8 | - | loop ends (`8 > 7`) | 16 |

Output `16`. Cross-check with the closed form: `k = (7 + 1) / 2 = 4`, `4^2 = 16`. Correct.

`N = 8`

| `i` | action | `sum` |
| --- | --- | --- |
| 1..7 | as above | 16 |
| 8 | `continue` | 16 |

Output `16`. The `continue` at `i = 8` is the whole difference from `N = 7`.

`N = 0`: the loop condition `1 <= 0` fails immediately, `sum = 0`. Output `0`, which is
the empty sum and the right answer.

## Progressive hints

1. How do you test whether an integer is odd? (`i % 2 != 0`, or `i % 2` as a boolean)
2. Where should the accumulator start? (`0` — additive identity)
3. How can you skip even numbers without an `if`? (`i += 2`)
4. How many odd numbers are there in `[1, N]`? (`(N + 1) / 2`)
5. If the sum of the first `k` odds is `k^2`, what is the answer in one expression? (`k*k`)
6. Which is safer for `N = 10^9`, the loop or the formula, and why? (formula: O(1) time;
   the loop would need `5e8` iterations)

## Traps

- `continue` in a `while` loop without an increment first — infinite loop. `for` is safe
  because `continue` still runs the increment.
- Counting the odd numbers instead of summing them (`N = 7` -> count `4`, sum `16`).
- Starting at `0` and stepping by `2` — that sums the evens.
- Writing `if (i % 2 == 0) continue;` and then also `else sum += i;` — harmless but
  redundant; `continue` already ended the iteration.
- `int` overflow: the sum is quadratic in `N`, so it overflows at `N >= 92681`.
- Forgetting that `N` may be `0`; the loop handles it, but a `do`/`while` would not.
- `i % 2 == 1` fails for negative `i` in C++ (`-3 % 2 == -1`); use `i % 2 != 0` if the
  range can go negative.

## Self-check

- Compute the answer for `N = 9` both by loop and by `k^2`. (`25`)
- Explain why `N = 7` and `N = 8` give the same result.
- Rewrite the loop using `i += 2` and confirm identical output.
- Rewrite it as `k * k` and state the precondition (`N >= 0`, integer division).
- Find the largest `N` for which an `int` accumulator is safe. (`92680`)
- State the loop invariant: at the top of iteration `i`, `sum` is the sum of all odd
  integers below `i`.
