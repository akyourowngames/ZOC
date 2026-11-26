# Reverse a Number

**Pattern:** rebuild a number digit by digit with `rev = rev * 10 + digit` | **Prerequisites:** modulo, integer division, decimal place value, overflow awareness

## Problem statement

Read a non-negative integer `N` and print a number whose digits are those of
`N` written in reverse order.

For `N = 1204` the digits are `1, 2, 0, 4`; printed backwards they are
`4, 0, 2, 1`, so the output is `4021`.

Because the result is printed as an integer, a reversed number that would begin
with zeros loses them: `N = 1200` produces `21`, not `0021`.

## Input and output

- Input: one line containing the integer `N`.
- Output: one integer — the digits of `N` reversed, printed without leading
  zeros.

## Examples

### Example 1
```text
Input:
1204
Output:
4021
```
**Why:** each extracted digit is *prepended* to the answer by multiplying the
accumulator by 10 and adding the digit. Four iterations, four digits moved.

### Example 2
```text
Input:
1200
Output:
21
```
**Why:** extraction yields `0, 0, 2, 1`. Structurally the reverse is `0021`,
which is the same integer as `21`. Integer output cannot display the padded
form.

### Example 3
```text
Input:
0
Output:
0
```
**Why:** one digit, `0`; `rev = 0 * 10 + 0 = 0`.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `N` fits in a 32-bit signed `int` (`0 <= N <= 2 147 483 647`).
- **The reversed value must also fit in `int`.** This is *not* automatic: `N`
  can be a valid `int` while its reverse overflows. `1 999 999 999` reverses to
  `9 999 999 991 > INT_MAX`. If the judge allows such inputs, the accumulator
  must be `long long` or the output produced as a string.
- Input is non-negative. For negative `N`, `%` keeps the sign and the code
  prints a negative reverse (`-123` → `-321`), which may or may not be wanted.
- No leading zeros in the input; `int` input would discard them anyway.

## Approach at a glance

Build the answer from the digits in the order they are extracted. Each new
digit must land in the units position, so the existing answer is shifted left
by one decimal place (`rev * 10`) and the digit is added:

```cpp
digit = N % 10;            // next digit, least significant first
rev   = rev * 10 + digit;  // shift answer, append digit
N     = N / 10;            // consume it
```

`rev = 0` before the loop is the identity for "no digits placed yet".

| Time | Space |
| --- | --- |
| O(d), d = digits (`d <= 10`) | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches
- Positional append: multiplying by the base shifts, adding inserts.
- Why digit order matters here but not in a digit sum.
- The first genuine overflow lesson in the digit section: a valid input can
  produce an invalid intermediate.
- The lost-leading-zero consequence of representing the result as an integer.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
