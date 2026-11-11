# Count the Digits
**Pattern:** destructive digit loop — divide by `10` until nothing remains | **Prerequisites:** `while`, integer division, decimal representation, loop termination

## Problem statement

Read a non-negative integer `N` and print how many decimal digits it has when
written normally, without leading zeros:

```text
5072  -> 4
10    -> 2
7     -> 1
0     -> 1
```

Each division by `10` deletes exactly one digit from the right. Counting how many
divisions are needed before the value becomes `0` therefore counts the digits.

## Input and output

- Input: one integer `N`, assumed non-negative.
- Output: the number of decimal digits of `N`, followed by a newline.
- The loop mutates `N`, so the original value is gone afterwards; that is fine
  here because only the count is needed.
- `N = 0` is a special case: the loop `while (N > 0)` never runs and reports `0`
  digits, but `0` is written with one digit. The checked-in code has this defect;
  `notes.md` documents the fix.

## Examples

### Example 1
```text
Input:
5072
Output:
4
```
**Why:** four divisions bring it to zero: `5072 -> 507 -> 50 -> 5 -> 0`, so four
digits.

### Example 2
```text
Input:
10
Output:
2
```
**Why:** `10 -> 1 -> 0`; the trailing zero is a digit and is counted by the first
division, so the answer is `2`, not `1`.

### Example 3
```text
Input:
0
Output:
1
```
**Why:** the standard convention is that `0` has one digit. The active
implementation prints `0` instead, because the guard `N > 0` is false
immediately. Among non-negative inputs, this is the only case where code and
statement disagree.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `0 <= N <= 2147483647`, so `N` fits in `int` and has at most 10 digits.
- The counter never exceeds 10, so `int` is more than enough.
- If the statement guarantees `N >= 1`, the `N = 0` case is irrelevant and the
  current code is fully correct.
- If `N` can be `long long`, the maximum is 19 digits (`10^18` has 19 digits).
- Negative input is out of scope; if allowed, decide whether the sign counts as
  a character. The magnitude has the same digit count.
- The number is read as an integer, not as a string, so no whitespace or sign
  handling is required.

## Approach at a glance

1. Read `N`.
2. `count = 0`.
3. While `N > 0`: `count += 1`, then `N = N / 10`.
4. Print `count`.

For correctness at `N = 0`, either add a guard before the loop or switch to a
`do...while` so the body runs at least once.

| Time | Space |
| --- | --- |
| O(d) for `d` digits, i.e. O(log10 N) | O(1) |

## Solution

[`solution.cpp`](./solution.cpp)

Verified behaviour: `5072 -> 4`, `10 -> 2`, `2147483647 -> 10`, `0 -> 0` (wrong
per the convention above), `-5072 -> 0`.

## What this teaches

- Integer division by `10` is a right shift in base ten; it removes one digit and
  never changes the remaining ones.
- Loop conditions carry semantic weight: `N > 0` silently excludes `0`, while
  `N != 0` includes it (and also tolerates negatives).
- The number of iterations is logarithmic in the value but linear in the digit
  count — the first `O(log N)` loop most learners meet.
- A destructive loop is fine when the original value is not needed later.
- Digit counts for `int` are tiny (`<= 10`), which is why the loop is always fast
  regardless of the value's magnitude.

## Checklist

- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
