# Sum of Digits Until a Single Digit (Digital Root)

**Pattern:** nested loop — repeat the digit-sum pass until the value has one digit | **Prerequisites:** digit extraction, nested loops, loop-carried state, termination reasoning, invariants

## Problem statement

Read a non-negative integer `N`. Replace it by the sum of its digits, then
replace the result by the sum of *its* digits, and keep going until the value
has a single digit. Print that final digit.

For `N = 5329`:

```text
5329 -> 5+3+2+9 = 19 -> 1+9 = 10 -> 1+0 = 1
```

so the answer is `1`.

This number is called the **digital root** of `N`. The exercise exists to show
a loop nested inside a loop where the *outer* loop re-runs an entire previous
algorithm rather than iterating over data.

## Input and output

- Input: one line containing the integer `N`.
- Output: one integer in `[0, 9]` — the repeated digit sum.

## Examples

### Example 1
```text
Input:
5329
Output:
1
```
**Why:** three rounds: `5329 -> 19 -> 10 -> 1`. Note that `19` is still two
digits, so a single digit-sum pass is not enough; and `10 -> 1` needs a third
round.

### Example 2
```text
Input:
0
Output:
0
```
**Why:** the outer condition `N >= 10` is false immediately, so `0` is printed
untouched. `0` is already a single digit.

### Example 3
```text
Input:
38
Output:
2
```
**Why:** `3 + 8 = 11`, then `1 + 1 = 2`. Two rounds.

### Example 4
```text
Input:
999999999
Output:
9
```
**Why:** `9 * 9 = 81`, then `8 + 1 = 9`. Large input, two rounds — the value
collapses by roughly a factor of ten per round.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `N` fits in a 32-bit signed `int` (`0 <= N <= 2 147 483 647`), so at most 10
  digits and at most three rounds.
- Input is non-negative. The active code does not handle negatives: for
  `N = -19` the outer test `-19 >= 10` fails immediately and `-19` is printed,
  which is not a digit.
- Intermediate sums are small (`<= 90` for 10-digit input), so no overflow is
  possible in either loop.
- Output is a single digit; a trailing newline is optional.

## Approach at a glance

Two nested loops, each with a distinct job:

- **inner** `while (N > 0)` — one digit-sum pass, destroying `N` and producing
  `sum`;
- **outer** `while (N >= 10)` — decide whether another pass is needed, and feed
  the previous result back in.

The hand-off between them is a single assignment, `N = sum`, and it is what
makes the outer loop a *repetition of the whole inner algorithm* rather than a
simple counter.

| Time | Space |
| --- | --- |
| O(d) total across all rounds (`d <= 10`, at most 3 rounds) | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches
- Nesting loops where the outer loop repeats a complete sub-algorithm.
- Loop-carried state: the outer variable is rewritten by the inner loop's
  result.
- Termination needs an argument about *how fast* values shrink, not just that
  they shrink.
- The difference between "one pass" and "fixed point" (folder
  [`26-sum-of-digits`](../26-sum-of-digits/) is one pass).

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
