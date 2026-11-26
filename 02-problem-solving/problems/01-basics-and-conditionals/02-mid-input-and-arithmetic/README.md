# Last Digits and Remainders

**Pattern:** `n % 10^k` extracts the last `k` decimal digits | **Prerequisites:** integer division, `%`, decimal place value, `endl` vs `'\n'`

## Problem statement

Read one integer `num`. Print, one per line:

1. `num % 10` — the last digit;
2. `num % 100` — the last two digits as a number;
3. `num % 1000` — the last three digits as a number.

The task is about the remainder operator, not about string slicing: the result
is a number, so leading zeros of the "digit window" disappear (`7000 % 1000`
is `0`, printed as `0`).

## Input and output

- Input: a single integer `num`.
- Output: exactly three lines, each one decimal integer, in the order
  `% 10`, `% 100`, `% 1000`.
- No prompt, no labels, no zero padding.

## Examples

### Example 1
```text
Input:
12345
Output:
5
45
345
```
**Why:** `12345 = 1234*10 + 5`, so `% 10 = 5`; `12345 = 123*100 + 45`, so
`% 100 = 45`; `12345 = 12*1000 + 345`, so `% 1000 = 345`.

### Example 2
```text
Input:
5
Output:
5
5
5
```
**Why:** a one-digit number is smaller than `10`, `100` and `1000`, so the
remainder is the whole number every time.

### Example 3
```text
Input:
7000
Output:
0
0
0
```
**Why:** `7000` is an exact multiple of `10`, `100` and `1000`. The "last three
digits" are `000`, and as a number that is `0`.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `num` is read with `cin >> int`, so `|num| <= 2,147,483,647`; a wider input
  needs `long long` or a string.
- `num` may be zero or negative; the sample is positive. C++ truncates toward
  zero, so a negative input yields negative remainders (`-12345 % 100 = -45`).
  If the judge requires non-negative remainders, use `((n % m) + m) % m`.
- Digits are decimal; no leading-zero preservation is required by the
  statement.

## Approach at a glance

`10^k` is the place value of the `(k+1)`-th digit from the right. Taking
`num % 10^k` deletes everything at place value `10^k` and above, leaving
exactly the low `k` digits interpreted as a number. So one modulo per line,
with divisors `10`, `100`, `1000`.

| Time | Space |
| --- | --- |
| O(1) | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches

- `%` is the remainder of integer division, not a percentage and not a
  decimal fraction.
- The divisor's number of zeros equals the number of digits kept.
- The same operation is the engine behind digit extraction, odd/even tests,
  divisibility checks and cyclic indexing (`i % k`).
- Output is numeric, so "last three digits" of `7000` print as `0`, not `000`.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
