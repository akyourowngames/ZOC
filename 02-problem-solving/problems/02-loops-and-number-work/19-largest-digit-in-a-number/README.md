# Largest Digit in a Number
**Pattern:** Digit-extraction loop with a running maximum | **Prerequisites:** `%` and `/`, `while` loops, `if` comparison, loop invariants

## Problem statement

Read one integer `N` and print the largest of its decimal digits. The program visits
every digit with the standard digit loop and keeps a running maximum: whenever the
current digit beats the best seen so far, the best is replaced.

Because decimal digits live in `0..9`, the maximum can be tracked in a single `int` and
initialized to `0` — no sentinel like `-1` is required, though `-1` is the more general
formulation.

## Input and output

- Input: one integer `N` (`cin >> N`), a single value.
- Output: one bare digit, `0` through `9`. Current code prints with `cout << largest;` —
  no label, no newline.

## Examples

### Example 1
```text
Input:
5831
Output:
8
```
**Why:** digits are `5, 8, 3, 1`. Right-to-left the running best goes `1 -> 3 -> 8 -> 8`;
`8` wins.

### Example 2
```text
Input:
9000
Output:
9
```
**Why:** three zeros never beat `9`. A zero digit is a legitimate value but not a
threat to a positive best.

### Example 3
```text
Input:
7
Output:
7
```
**Why:** single-digit input is handled in one iteration; `7 > 0` so `largest` becomes `7`.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:
- `N` fits in `int`, so `N <= 2147483647` -> at most 10 digits.
- `N >= 1` per the "positive integer" wording.
- Digits are base 10; the sign is not a digit.

If `N` may be `0`, the current code still prints `0`, which is the correct answer, so no
special case is needed — a rare case where the naive initialization happens to be
exactly right. Negative inputs are not defined by the statement; the current code prints
`0` for them, since the loop never runs.

## Approach at a glance

1. `largest = 0` (a valid lower bound for any digit).
2. While `N > 0`: `digit = N % 10`; if `digit > largest` then `largest = digit`;
   `N /= 10`.
3. Print `largest`.

The comparison is strictly greater, not greater-or-equal: with `>=` the update is still
correct but does redundant work, and it would matter if you also wanted to track which
position the maximum came from.

| Time | Space |
| --- | --- |
| O(d) where d = number of digits | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches

- The running best (fold with `max`) is the simplest form of dynamic programming: a
  one-scalar state that summarises everything seen so far.
- A valid *lower bound* is enough to initialize a maximum; you do not need a real digit.
- Loop invariants: "nothing already scanned is bigger than `largest`" is a claim you can
  check at the top of every iteration.
- This is the same loop as sum/product/count/reverse with only the fold body swapped —
  the reusable digit skeleton.
- Two-pass alternatives (store all digits, then scan) cost O(d) memory for no benefit.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
