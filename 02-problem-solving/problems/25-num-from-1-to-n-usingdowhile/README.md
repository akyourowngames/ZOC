# Print 1 to N with `do-while`

**Pattern:** counted loop written as a body-first `do-while` | **Prerequisites:** `cin`/`cout`, integer variables, `while` vs `do-while`, loop counters, off-by-one reasoning

## Problem statement

Read a single integer `N` and print every integer from `1` through `N`
inclusive, in increasing order, separated by single spaces.

The printing itself is trivial; folder [`31-print-to-N`](../31-print-to-N/)
solves the same task with a `for` loop. The point of *this* version is the loop
form. The counter loop must be written as a `do-while`, which executes its body
**before** testing the condition. That single fact changes what happens at the
boundary `N = 0`, and handling that boundary is the real content of the
exercise.

## Input and output

- Input: one line containing the integer `N`.
- Output: `1 2 3 ... N` on one line, numbers separated by one space.
  For `N < 1` the intended output is nothing (an empty line).

## Examples

### Example 1
```text
Input:
5
Output:
1 2 3 4 5
```
**Why:** the counter starts at `1`, prints, increments, and stops as soon as
the counter exceeds `5`. Five iterations, five numbers, condition `i <= N`.

### Example 2
```text
Input:
1
Output:
1
```
**Why:** `do-while` guarantees at least one iteration, and here exactly one
iteration is required.

### Example 3
```text
Input:
0
Output:
(nothing printed)
```
**Why:** the range `[1, 0]` is empty, so there is nothing to print. A bare
`do-while` cannot produce this: it prints `1` first and only then discovers
that the loop should never have started. See the guard discussion in
[`notes.md`](./notes.md).

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions for this
exercise:

- `N` fits in a 32-bit signed `int` (`|N| <= 2 147 483 647`).
- The intended domain is `N >= 0`; negative `N` behaves like `0` in the
  corrected version.
- Separator is one space. A trailing space after the last number is usually
  accepted, but omitting it is cleaner.
- A trailing newline is optional; adding one is safer for shell prompts.

## Approach at a glance

Every `do-while` has the shape

```cpp
init;
do {
    body;
    update;
} while (condition);
```

For a counter loop that means: `i = 1`, print `i`, `i++`, continue while
`i <= N`. Because the condition is only evaluated after the body, the loop
prints `1` even when `N = 0`. The correct fix is to guard the whole loop
(`if (N >= 1) { ... }`), not to patch it from inside the body — by the time
the body runs, the unwanted output already happened.

| Time | Space |
| --- | --- |
| O(N) | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches
- `do-while` is exit-controlled: the body always runs at least once, so loops
  whose body is invalid for some inputs need an outer guard.
- A `while (i <= N)` loop and a guarded `do-while` are equivalent for `N >= 1`.
- Off-by-one bugs live in the condition (`i < N` vs `i <= N`), not in the body.
- The counter doubles as the value being printed, which keeps state minimal.
- Choosing between `for`, `while`, and `do-while` is a statement about whether
  zero iterations are possible.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
