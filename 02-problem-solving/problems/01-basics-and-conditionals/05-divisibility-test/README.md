# Divisibility Test

**Pattern:** `N % K == 0` as a Boolean predicate mapped to `YES`/`NO` | **Prerequisites:** `%`, `if`/`else`, zero-divisor hazard, 64-bit types

## Problem statement

Read two integers `N` and `K`. Print `YES` if `N` is divisible by `K`
(that is, `K` divides `N` with remainder zero), otherwise print `NO`.

Divisibility is not a property you inspect digit by digit: it is exactly the
statement that the remainder vanishes. So the entire problem is one modulo and
a two-way print.

## Input and output

- Input: two integers `N` and `K`, whitespace-separated.
- Output: the single token `YES` or `NO`, uppercase, no punctuation, no extra
  text. One line.
- `K = 0` is invalid input: division and remainder by zero are undefined. The
  README requires `K != 0`; the current code does not enforce it.

## Examples

### Example 1
```text
Input:
20 5
Output:
YES
```
**Why:** `20 = 4 * 5 + 0`, so `20 % 5 == 0`.

### Example 2
```text
Input:
22 5
Output:
NO
```
**Why:** `22 = 4 * 5 + 2`, remainder `2`, so `5` does not divide `22`.

### Example 3
```text
Input:
-15 5
Output:
YES
```
**Why:** `-15 % 5 == 0`. A zero remainder is still a zero remainder; the sign
of `N` does not change divisibility.

### Example 4
```text
Input:
0 7
Output:
YES
```
**Why:** `0 = 0 * 7 + 0`. Zero is divisible by every non-zero integer. If the
original statement restricts `N` to positive values this case never occurs;
the assumption is recorded below.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `N` and `K` fit in `long long`; the code already uses `long long`, which is
  the right call because `K` can be large and `N % K` may need the full range.
- `K != 0`, as required by the README. The program must not be run with
  `K = 0`.
- Output tokens are exactly `YES` and `NO` in uppercase.

## Approach at a glance

Compute `N % K` once. Compare to zero. Print the matching token. No loop, no
special cases, no floating point: `N / K` as a `double` would round and could
report divisibility for values that are not multiples.

| Time | Space |
| --- | --- |
| O(1) | O(1) |

## Solution
[`divisibility-test.cpp`](./divisibility-test.cpp)

## What this teaches

- A divisibility question is a remainder question; one `%` answers it.
- Operand order matters: `N % K` asks "does `K` divide `N`", while `K % N`
  asks the reverse.
- A predicate expression (`N % K == 0`) is already a `bool`; it can be stored
  or tested directly.
- Even a correct formula can crash on a degenerate input (`K = 0`); guards are
  part of a robust solution.
- Output tokens are case-sensitive.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
