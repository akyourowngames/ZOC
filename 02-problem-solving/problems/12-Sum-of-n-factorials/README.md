# Sum of the First N Factorials
**Pattern:** incremental reuse of a running product | **Prerequisites:** `while`, running product, running sum, monotone growth, overflow

## Problem statement

Read `N` and print

```text
1! + 2! + 3! + ... + N!
```

The naive reading is "compute `N` factorials and add them". The point of the
exercise is to notice that factorial `i!` is already available from `(i-1)!`, so
one loop can maintain both the current factorial and the running total.

## Input and output

- Input: one non-negative integer `N`.
- Output: the sum of factorials from `1!` through `N!`, followed by a newline.
- `0!` is **not** included: the sum starts at `1!`. For `N = 0` the range is
  empty and the code prints `0`.
- The difference matters: if the task had asked for `0! + 1! + ... + N!`, every
  answer would be larger by exactly `1`.

## Examples

### Example 1
```text
Input:
3
Output:
9
```
**Why:** `1! + 2! + 3! = 1 + 2 + 6 = 9`.

### Example 2
```text
Input:
5
Output:
153
```
**Why:** adding `4! = 24` and `5! = 120` to the previous answer `9` gives
`9 + 24 = 33`, then `33 + 120 = 153`.

### Example 3
```text
Input:
0
Output:
0
```
**Why:** The loop condition `1 <= 0` is false, so nothing is added. The sum of
an empty set of terms is `0`, the additive identity — consistent with the
problem summing from `1!`, not from `0!`.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `0 <= N <= 12` keeps the `int` total valid:
  `1! + ... + 12! = 522956313 < 2147483647`.
- `N = 13` breaks `int`: the true total is `6749977113`, and the code prints
  `-1839957479` (the value modulo `2^32`, read as signed).
- `long long` extends the correct range to `N = 20`, where the total is
  `2561327494111820313`; `N = 21` overflows 64-bit (the total would be
  `53652269665821260313`).
- `N < 0` is undefined; the loop is skipped and `0` is printed.
- Input is a single integer, no test count.

## Approach at a glance

1. Read `N`.
2. `factorial = 1`, `sum = 0`, `i = 1`.
3. While `i <= N`: first `factorial *= i` (now `factorial == i!`), then
   `sum += factorial`, then `i++`.
4. Print `sum`.

| Time | Space |
| --- | --- |
| O(N) total multiplications and additions | O(1) |

The alternative — a nested loop recomputing each factorial — is `O(N^2)` and is
strictly worse for the same answer.

## Solution

[`solution.cpp`](./solution.cpp)

## What this teaches

- Reuse of a prefix computation: the previous iteration already did most of the
  work for the next factorial.
- Two accumulators can share one loop when they advance together, which turns a
  nested-loop idea into a single pass.
- Ordering inside the body is semantic, not cosmetic: multiplying before adding
  yields `i!`, adding before multiplying yields `(i-1)!`.
- Growth is dominated by the largest factorial, so the *sum* overflows at
  virtually the same `N` as the factorial itself (`13`).
- Empty-range behaviour is a design decision that should be stated, not assumed.

## Checklist

- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
