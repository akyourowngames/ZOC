# Sum of Multiples of K up to N
**Pattern:** Accumulation loop with a multiplicative step (`i += K`) | **Prerequisites:** `for` loops, integer division, divisibility, overflow, degenerate step sizes

## Problem statement

Read two integers `N` and `K`, then print the sum of all positive multiples of `K` that
are less than or equal to `N`, i.e. `K + 2K + 3K + ... + tK` where `t = floor(N / K)`.

The loop does not test divisibility. It jumps directly from one multiple to the next with
`i += K`, visiting exactly `t` values instead of all `N`. That is the reusable idea: when
the candidate set is an arithmetic progression, step along the progression rather than
filtering a full range.

## Input and output

- Input: two integers on one line, `N` then `K` (`cin >> N >> K`), separated by whitespace.
- Output: one bare integer, the sum. Current code uses `cout << sum;` — no label, no
  newline.

## Examples

### Example 1
```text
Input:
10 3
Output:
18
```
**Why:** the multiples of `3` not exceeding `10` are `3, 6, 9`; the loop tests `3`, `6`,
`9`, then stops at `12`. `3 + 6 + 9 = 18`.

### Example 2
```text
Input:
10 4
Output:
12
```
**Why:** `4, 8, 12 -> 12 > 10`, so the terms are `4 + 8 = 12`. Exactly two iterations.
`t = floor(10 / 4) = 2`, and `4 * (2 * 3 / 2) = 12`.

### Example 3
```text
Input:
5 7
Output:
0
```
**Why:** no positive multiple of `7` is `<= 5`. The loop condition fails on the first
test, so `sum` stays at the additive identity `0` — the empty sum.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:
- `N >= 0` and `K >= 1`; both fit in `int`.
- "Multiples" means positive multiples, so `0` is excluded (the loop starts at `K`).
- Multiples may repeat `N` itself: `N = 10, K = 5` includes `10`.

Three preconditions the code does not enforce, and which are worth stating because they
are the classic failure points:
- `K >= 1` (with `K = 0` the step is zero and the loop never terminates),
- `K` positive (`K < 0` makes `i` decrease forever while still `<= N`),
- the sum fits the chosen type: `sum = K * t * (t + 1) / 2` with `t = N / K`. For `K = 1`
  this exceeds `INT_MAX` at `N = 65536`.

## Approach at a glance

1. Read `N`, `K`.
2. `sum = 0`.
3. `for (int i = K; i <= N; i += K) sum += i;`
4. Print `sum`.

Start at the smallest positive multiple (`K`), advance by one multiple per step, stop when
the multiple passes `N`. Closed form: `K * t * (t + 1) / 2` with `t = N / K`, O(1) and
overflow-safer if you compute it in `long long`.

| Time | Space |
| --- | --- |
| O(N / K) iterations (= floor(N/K)) | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches

- Choose the iteration domain, not just the loop body: stepping by `K` eliminates the
  divisibility test entirely.
- `t = N / K` (integer division) counts the terms in one operation and is the key to the
  closed form.
- Loop counters can overflow *and* underflow, and a zero or negative step turns a
  terminating loop into a non-terminating one.
- Arithmetic-progression sums are a standard O(1) upgrade: `a + (a+d) + ... = t*(first +
  last)/2`.
- Empty ranges are normal: `K > N` must yield `0`, not an error.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
