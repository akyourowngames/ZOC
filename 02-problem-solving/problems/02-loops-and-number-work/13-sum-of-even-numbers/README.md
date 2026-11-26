# Sum of Even Numbers up to N
**Pattern:** stride-2 loop over an arithmetic progression | **Prerequisites:** `while`, `+=` with step `2`, even/odd parity, arithmetic series, overflow

## Problem statement

Read `N` and print the sum of every even integer from `2` up to and including
`N`:

```text
2 + 4 + 6 + ... + (largest even number <= N)
```

Only positive even numbers are summed. `0` is not part of the series, though
including it would not change the total.

## Input and output

- Input: one integer `N`.
- Output: the sum of the even values in `[2, N]`, followed by a newline.
- If `N < 2` the range is empty and the answer is `0`.
- If `N` is odd, the last term is `N - 1`.

## Examples

### Example 1
```text
Input:
8
Output:
20
```
**Why:** `2 + 4 + 6 + 8 = 20`. There are four terms, and the closed form with
`m = 8 / 2 = 4` gives `m * (m + 1) = 4 * 5 = 20`.

### Example 2
```text
Input:
9
Output:
20
```
**Why:** `9` is odd, so the series stops at `8`. Same four terms, same answer.
Odd inputs round the endpoint down.

### Example 3
```text
Input:
0
Output:
0
```
**Why:** The first test is `2 <= 0`, which is false, so the loop never runs and
the initial `0` is printed. Same for `N = 1`.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `N >= 0`; negative `N` simply produces `0` here but is not part of the task.
- With `int`, the answer is exact for `N <= 92681`. Reason: there are
  `m = N / 2` terms and the total is `m * (m + 1)`; `m = 46340` gives
  `2147441940 < 2147483647`, while `m = 46341` gives `2147534622`, which
  overflows.
- Verified failure point: `N = 92682` prints `-2147432674`.
- `long long` extends the safe range to about `N = 6 * 10^9`, far beyond the
  `int` input range.
- Input is a single integer, not a list.

## Approach at a glance

1. Read `N`.
2. `sum = 0`, `i = 2`.
3. While `i <= N`: `sum += i`, then `i += 2`.
4. Print `sum`.

Stepping by `2` visits only the wanted values, so no parity test is needed. The
`i % 2 == 0` check would be redundant work.

| Time | Space |
| --- | --- |
| O(N / 2) iterations = O(N) | O(1) |

## Solution

[`solution.cpp`](./solution.cpp)

## What this teaches

- Choosing the loop stride can replace a conditional: the counter *generates*
  only valid terms.
- The count of terms is `N / 2` via integer division, which rounds down and
  thereby handles odd `N` automatically.
- An arithmetic progression has a closed form, so an `O(N)` loop can always be
  replaced by `O(1)` arithmetic when the limits demand it.
- Quadratically growing sums overflow long before the input does: `N` of
  `92682` is tiny, yet the answer is already out of `int` range.
- Empty-range handling falls out of the loop guard; no special case is needed.

## Checklist

- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
