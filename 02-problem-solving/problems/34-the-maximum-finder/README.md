# Maximum and Swap
**Pattern:** branching helper that returns a value, plus a two-reference in-place swap | **Prerequisites:** `if`/`else`, `return` semantics, reference parameters, temporary variables

## Problem statement
Read two integers `N` and `M`. Print the larger of the two on its own line. Then swap the
two values through a function that takes both by reference, and print the swapped `N` and
`M` on a second line, separated by a space.

Two different helper styles are exercised side by side: `maximum` answers a question without
touching its arguments, while `swapNumbers` changes both arguments in place. The `endl`
between the stages is part of the expected output, not decoration.

## Input and output
- Input: one line containing two integers `N` and `M`, separated by whitespace.
- Output:
  - line 1: `max(N, M)`
  - line 2: the values after swapping, as `N M` (now holding the original `M` and `N`).

## Examples
### Example 1
```text
Input:
4 9
Output:
9
9 4
```
**Why:** `maximum(4, 9)` compares `4 > 9` (false) and returns `9`. `swapNumbers` then makes
`N = 9`, `M = 4`, so the second line is `9 4`. The two `9`s are unrelated: one is the
maximum, the other is the old `M` that moved into `N`.

### Example 2
```text
Input:
7 7
Output:
7
7 7
```
**Why:** with equal values the comparison `a > b` is false, so `maximum` returns `b`, which
equals `a`. Swapping equal values is a no-op that still prints both numbers.

### Example 3
```text
Input:
-3 -8
Output:
-3
-8 -3
```
**Why:** `-3 > -8` is true, so the maximum is `-3`. Negatives compare by value, not by
magnitude: `-3` is larger than `-8` because it is closer to zero.

## Constraints and assumptions
Practice constraints (not specified by a judge). The code assumes:

- Both numbers fit in a 32-bit signed `int` (`-2,147,483,648 .. 2,147,483,647`).
- No arithmetic is performed, so there is **no overflow risk** — comparison and assignment
  are safe for the entire `int` range, including `INT_MIN` and `INT_MAX`.
- Input contains exactly two integers on one line (or across lines; `cin >>` skips
  whitespace, so line breaks do not matter).

`swapNumbers` uses a third variable rather than `a = a + b; b = a - b; a = a - b;`, which
would overflow for large values. That is the reason `temp` is the recommended technique.

## Approach at a glance
1. Read `N` and `M`.
2. Call `maximum(N, M)`: both arguments are copies, so this call cannot change anything.
   Print the returned value followed by `endl`.
3. Call `swapNumbers(N, M)`: the parameters are references, so `temp = a; a = b; b = temp;`
   rewrites the caller's two variables.
4. Print `N` and `M` in their new order.

| Time | Space |
| --- | --- |
| O(1) | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches
- A function can be a *decision* (`maximum`) or a *mutation* (`swapNumbers`); the signature
  reveals which.
- Two reference parameters let one function update two caller variables at once.
- The three-assignment swap is the safe one; the arithmetic trick overflows.
- `endl` inserts `'\n'` **and** flushes; `'\n'` alone is cheaper when no flush is needed.
- `std::max` and `std::swap` already exist in `<algorithm>` / `<utility>`; writing them by
  hand is the learning exercise, not the goal.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
