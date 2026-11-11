# Sum of Odd Numbers from 1 to N
**Pattern:** Bounded accumulation loop with `continue` as a filter | **Prerequisites:** `for` loops, `%` divisibility, `continue`, closed-form sums, overflow

## Problem statement

Read one integer `N` and print the sum of every odd integer from `1` through `N`
inclusive. The program walks `i = 1..N` and uses `continue` to skip the even values, so
the loop body demonstrates filtering without restructuring the loop.

The loop is a *bounded accumulator*: a counter that neither reads input nor stops early,
plus an aggregate that is updated only for accepted values.

## Input and output

- Input: one integer `N` (`cin >> N`), a single value.
- Output: one bare integer, the sum. Current code uses `cout << sum;` — no label, no
  newline.

## Examples

### Example 1
```text
Input:
7
Output:
16
```
**Why:** `1 + 3 + 5 + 7 = 16`, which is also `4^2`. There are `ceil(7/2) = 4` odd numbers
up to `7`, and the sum of the first `k` odd numbers is `k^2`.

### Example 2
```text
Input:
8
Output:
16
```
**Why:** `8` is even, so it is skipped; the terms are the same as for `N = 7`. Adding the
upper bound only matters when it is odd.

### Example 3
```text
Input:
1
Output:
1
```
**Why:** the single odd term is `1`. The loop runs once, `1 % 2 == 1` so it is added.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:
- `N` fits in `int` and `N >= 0`.
- The sum is over positive odd integers only.

Overflow is the real constraint here. The sum equals `k^2` with `k = (N + 1) / 2`, so it
stays inside a signed 32-bit `int` only while `k^2 <= 2147483647`, i.e. `k <= 46340`, i.e.
`N <= 92680`. For `N = 92681` the true sum is `2147488281`, which overflows. If the judge
allows `N` up to `10^9`, the answer needs `long long` (`k^2 <= 2.5e17`, which fits) and the
loop itself becomes too slow — use the closed form.

## Approach at a glance

1. `sum = 0`.
2. `for (i = 1; i <= N; i++)`: if `i % 2 == 0`, `continue`; otherwise `sum += i`.
3. Print `sum`.

`continue` jumps to the loop's increment step, skipping the rest of the body. It is a
readable way to express "ignore the rest of this case", but the same result comes from
`for (i = 1; i <= N; i += 2)` with no filter at all.

| Time | Space |
| --- | --- |
| O(N) as written; O(1) with the closed form | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches

- Filtering with `continue` keeps one loop and one exit point, unlike deep nesting.
- Skipping work is cheaper than doing work and discarding it; `i += 2` halves the
  iterations.
- Closed forms (`1 + 3 + ... + (2k-1) = k^2`) turn an O(N) loop into O(1) arithmetic — the
  natural follow-up when `N` grows past a few million.
- Accumulators need a width chosen from the *worst-case sum*, not from the input type.
- `N` even and `N` odd give the same answer, a symmetry worth predicting before coding.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
