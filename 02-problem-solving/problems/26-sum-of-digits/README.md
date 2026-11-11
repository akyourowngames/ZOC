# Sum of Digits

**Pattern:** digit extraction with `% 10` and `/ 10` inside a `do-while` | **Prerequisites:** modulo, integer division, accumulation, `do-while`, base-10 place value

## Problem statement

Read a non-negative integer `N` and print the sum of its decimal digits.

For `N = 5329` the answer is `5 + 3 + 2 + 9 = 19`.

The loop is written as a `do-while`, which fits this problem unusually well:
every number, including `0`, has at least one digit, so the body is always
valid for at least one execution.

## Input and output

- Input: one line containing the integer `N`.
- Output: one integer — the sum of the digits of `N`.

## Examples

### Example 1
```text
Input:
5329
Output:
19
```
**Why:** the digits are `5, 3, 2, 9`, and `5 + 3 + 2 + 9 = 19`. Four
iterations, because 5329 has four digits.

### Example 2
```text
Input:
0
Output:
0
```
**Why:** `0` has a single digit, `0`, and `0 + nothing = 0`. A `do-while`
handles this naturally: one pass extracts digit `0`, then `N` becomes `0` and
the loop stops. A plain `while (N > 0)` would also print `0` here, but only
because the accumulator starts at `0` — it would perform zero iterations.

### Example 3
```text
Input:
1000000000
Output:
1
```
**Why:** nine zero digits contribute nothing; only the leading `1` counts.
Ten iterations despite the small answer.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `N` fits in a 32-bit signed `int` (`0 <= N <= 2 147 483 647`), so `N` has at
  most 10 decimal digits.
- With at most 10 digits, the sum is at most `9 * 10 = 90`, comfortably inside
  `int`. Even a 19-digit `long long` peaks at `9 * 19 = 171`.
- Input is non-negative. For negative `N`, `%` keeps the sign (see
  [`notes.md`](./notes.md)), so take `abs(N)` first if negatives are allowed.
- Output is a single number with no trailing text; a trailing newline is
  optional.

## Approach at a glance

Base-10 representation is a stack of digits: the last one is easiest to reach.
`N % 10` peels off that last digit, and `N / 10` discards it (integer division
truncates). Repeat until nothing is left. Add each peeled digit to a running
total.

```cpp
digit = N % 10;
sum += digit;
N = N / 10;
```

`N / 10` is also the progress measure: it strictly shrinks `N` for every
positive `N`, which is what guarantees termination.

| Time | Space |
| --- | --- |
| O(d), d = number of digits (`d <= 10`) | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches
- The digit invariant `digit = n % 10; n /= 10;` that powers every
  digit-processing problem in this section.
- Why an exit-controlled loop is safe when the body is valid for every input —
  including the `0` corner case.
- Accumulator pattern: initialise to the identity (`0` for sums, `1` for
  products), update once per extracted digit.
- Termination by a strictly decreasing measure (`N / 10 < N` for `N > 0`).

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
