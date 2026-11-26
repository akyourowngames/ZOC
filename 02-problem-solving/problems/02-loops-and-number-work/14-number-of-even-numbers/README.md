# Count Even Numbers up to N
**Pattern:** counting with a predicate (`i % 2 == 0`) | **Prerequisites:** `while`, `if/else`, modulo parity, integer division, count-versus-sum distinction

## Problem statement

Read `N` and print how many even positive integers lie in the range `1..N`
inclusive. This is a *counting* problem, not a summation problem: the answer for
`N = 10` is `5` (the number of even values), not `30` (their sum).

The next folder, `13-sum-of-even-numbers`, is the sibling task. Comparing the
two is the fastest way to internalise the difference between "how many" and "how
much".

## Input and output

- Input: one integer `N`.
- Output: the count of `x` with `1 <= x <= N` and `x % 2 == 0`, then a newline.
- `N = 0` and `N = 1` both give `0`, because `2` is the smallest even positive
  integer.
- `0` itself is not in the range, so it is never counted.

## Examples

### Example 1
```text
Input:
10
Output:
5
```
**Why:** the even values are `2, 4, 6, 8, 10` — five of them. Notice `10 / 2 = 5`,
so the closed form agrees with the enumeration.

### Example 2
```text
Input:
7
Output:
3
```
**Why:** `2, 4, 6` — three values. `7 / 2 = 3` in integer division, which drops
the incomplete pair. The odd endpoint contributes nothing.

### Example 3
```text
Input:
1
Output:
0
```
**Why:** no even positive integer is `<= 1`. The loop still runs once with
`i = 1`, the condition fails, and the counter stays `0`.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `N >= 0` and `N <= 2^31 - 1`. The *count* never exceeds `N / 2`, so no
  overflow is possible even at `INT_MAX` — unlike the sum version.
- The `O(N)` loop is comfortable up to roughly `N = 10^7`–`10^8`; beyond that,
  use the `O(1)` formula `N / 2`.
- For `N` larger than `int`, read into `long long` and still use `N / 2`.
- The range starts at `1`. If a variant starts at `0`, the answer increases by
  one, because `0` is even.
- Input is a single integer, not a list of values.

## Approach at a glance

1. Read `N`.
2. `i = 1`, `count = 0`.
3. While `i <= N`: if `i % 2 == 0`, increment `count`; then `i++`.
4. Print `count`.

The `O(1)` alternative is `count = N / 2`, valid because every consecutive pair
`(1,2), (3,4), ...` contains exactly one even number.

| Time | Space |
| --- | --- |
| O(N) loop (O(1) with `N / 2`) | O(1) |

## Solution

[`solution.cpp`](./solution.cpp)

The checked-in code uses the explicit predicate loop. Its `else` branch contains
`num = num;`, a self-assignment that does nothing; the branch can be deleted
without changing behaviour.

## What this teaches

- Accumulating a count versus accumulating a sum: `count += 1` inside a
  predicate versus `sum += i`.
- A modulo test as a predicate: `i % 2 == 0` classifies parity without division.
- Integer division as a counting shortcut: `N / 2` counts complete pairs.
- Counting is overflow-safe even when the underlying values are huge, which is
  why the formula is preferred at scale.
- A loop that does nothing on some branches (`else num = num`) is a sign the
  branch is unnecessary.

## Checklist

- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
