# Print Numbers to N

**Pattern:** counted `for` loop in a helper function | **Prerequisites:** functions, parameters and return types, `for` loop anatomy, loop scope, output formatting

## Problem statement

Read an integer `N` and print every integer from `1` through `N` inclusive, in
increasing order, separated by spaces.

Structurally this is the same task as folder
[`25-num-from-1-to-n-usingdowhile`](../25-num-from-1-to-n-usingdowhile/),
which uses a `do-while`. Comparing the two is the point: a counted loop with a
possibly empty range is exactly what `for` was designed for, and it needs no
guard.

The second idea is **decomposition**: the printing lives in
`void printNumbers(int)`, so `main` only reads input and calls the function.

## Input and output

- Input: one line containing the integer `N`.
- Output: `1 2 3 ... N` on one line, separated by single spaces. For `N < 1`
  nothing is printed.

## Examples

### Example 1
```text
Input:
5
Output:
1 2 3 4 5
```
**Why:** `i` takes the values `1, 2, 3, 4, 5`; the test `i <= N` fails only
when `i` reaches `6`. Five iterations, five numbers, last value included.

### Example 2
```text
Input:
1
Output:
1
```
**Why:** the loop condition holds for `i = 1` and fails for `i = 2`.

### Example 3
```text
Input:
0
Output:
(nothing printed)
```
**Why:** the condition `1 <= 0` is false before the first iteration, so the
body never runs. This is what `for` does naturally and what the `do-while`
version in folder `25` has to guard against.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `N` fits in a 32-bit signed `int` (`0 <= N <= 2 147 483 647`). Note that the
  loop counter must be able to hold `N + 1` conceptually; if `N == INT_MAX` the
  `i++` on the final pass overflows (see [`notes.md`](./notes.md)).
- Practically, output volume limits `N` far before the type does: `N` numbers
  of up to 10 digits each.
- Input is non-negative. Negative `N` prints nothing, which matches "empty
  range".
- Separator is a single space; the current code leaves a trailing space after
  the last number and prints no final newline.
- Output must be buffered sensibly for large `N` (`\n` instead of `endl`).

## Approach at a glance

`for (init; test; step)` groups the three loop decisions in one line:

- `int i = 1` — first value to print;
- `i <= N` — still inside the range (this is what includes `N` itself);
- `i++` — consecutive integers.

The body is a single `cout`. Because `i` is declared in the `for` header, it is
scoped to the loop and cannot leak into the rest of the function.

| Time | Space |
| --- | --- |
| O(N) iterations, O(N log N) characters printed | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches
- `for` expresses "known count, possibly zero iterations" more directly than
  `do-while`.
- `init / test / step` maps one-to-one onto "first value / still in range /
  next value".
- Functions with `void` return are the right tool for side effects such as
  printing; parameters are passed by value, so `printNumbers` cannot corrupt
  the caller's variable.
- Loop-variable scope: `i` declared in the header dies at the closing brace.
- Output cost is usually the bottleneck, not the loop.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
