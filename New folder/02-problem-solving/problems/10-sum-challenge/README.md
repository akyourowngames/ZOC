# Sum from 0 to N
**Pattern:** running total in a `while` loop (accumulator) | **Prerequisites:** `while`, `+=`, loop bounds, integer overflow, arithmetic series

## Problem statement

Read one non-negative integer `N` and print the sum of every integer from `0`
through `N` inclusive:

```text
0 + 1 + 2 + ... + N
```

This is the classic accumulator exercise: a variable carries a partial answer
across iterations, and the loop decides how many terms enter it.

## Input and output

- Input: one integer `N` on a single line.
- Output: the sum `0 + 1 + ... + N`, followed by a newline.
- The endpoint `N` is included. `N = 5` sums six terms (`0` through `5`), and
  the extra `0` changes nothing, which is why both `i = 0` and `i = 1` starts
  work with a `<=` test.

## Examples

### Example 1
```text
Input:
5
Output:
15
```
**Why:** `0 + 1 + 2 + 3 + 4 + 5 = 15`. The closed form gives
`5 * 6 / 2 = 15` as well.

### Example 2
```text
Input:
0
Output:
0
```
**Why:** The loop condition `0 <= 0` is true, so the single term `0` is added.
Adding the additive identity leaves the sum at `0`.

### Example 3
```text
Input:
100
Output:
5050
```
**Why:** `100 * 101 / 2 = 5050`. Confirms the loop against the formula; the
loop performs 101 additions, the formula performs three arithmetic operations.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `0 <= N <= 65535` keeps the `int` sum valid, because
  `65535 * 65536 / 2 = 2147450880 < 2147483647`.
- `N = 65536` already overflows signed 32-bit (`2147516416`), which wraps to
  `-2147450880` on two's-complement machines.
- If the judge allows larger `N`, use `long long` (`N <= 3037000499` is safe)
  or `__int128` / big integers beyond that.
- Negative `N` is out of scope. If given, the loop body never runs and the
  program prints `0`.
- Input is a single integer; no multiple test cases.

## Approach at a glance

1. Read `N`.
2. Initialise `sum = 0` and `i = 0`.
3. While `i <= N`: add `i` to `sum`, then increment `i`.
4. Print `sum`.

An equivalent `O(1)` route is `N * (N + 1) / 2`, valid for non-negative `N`.

| Time | Space |
| --- | --- |
| O(N) loop (O(1) with the closed form) | O(1) |

## Solution

[`solution.cpp`](./solution.cpp)

The source comment explains the author's own reasoning about the start value:
`0` is harmless because it is the additive identity, so `i = 0` with `i <= N`
and `i = 1` with `i <= N` produce the same sum, while `i = 1` with `i < N`
would silently drop the last term.

## What this teaches

- The accumulator pattern: one variable, initialised to the identity element of
  the operation, updated once per iteration.
- Loop bounds decide membership. `<=` includes `N`, `<` excludes it.
- The identity element for `+` is `0`; adding it is a no-op, which is why the
  start value is a free choice here.
- The sum grows like `N^2 / 2`, so the *result* overflows long before the
  counter does.
- Verification habit: check a small case against the closed form.

## Checklist

- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
