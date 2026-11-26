# Extract the Last K Digits
**Pattern:** keep a decimal suffix with `N % 10^K` | **Prerequisites:** integer `%` and `/`, `while` loops, powers of ten, 32-bit overflow

## Problem statement

Read two integers on one line: `N`, the number to inspect, and `K`, how many
decimal digits to keep from the right end. Print the value formed by those
last `K` digits.

The operation is exactly `N` modulo `10^K`. Dividing by `10^K` discards every
place value of `10^K` and above; the remainder is what is left in the lowest
`K` digit positions. The folder name "Digit Extractor" describes the same
idea: you are slicing digits off the right end of the number.

## Input and output

- Input: one line with two integers, `N` first and `K` second (`cin >> N >> K`).
- Output: the last `K` digits of `N` printed as an integer, followed by a newline.
- Order matters. The declaration `int K, N;` does not change the reading order;
  only the sequence of `>>` extractions does.
- No leading zeros are requested, so the answer is a plain number, not a
  string of width `K`.

## Examples

### Example 1
```text
Input:
123456 3
Output:
456
```
**Why:** `10^3 = 1000` and `123456 % 1000 = 456`. The digits `1`, `2`, `3` sit
at place values `100000`, `10000`, `1000`, all multiples of `1000`, so they
vanish in the remainder.

### Example 2
```text
Input:
987654321 5
Output:
54321
```
**Why:** `10^5 = 100000`. Because `100000 * 9876 = 987600000`, the remainder is
`987654321 - 987600000 = 54321`.

### Example 3
```text
Input:
45 3
Output:
45
```
**Why:** `45 % 1000 = 45`. The number has fewer than `K` digits, so no digit is
actually cut. A judge that demands fixed width would want `045` instead; that
is a printing decision, not an arithmetic one.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions for this
solution:

- `0 <= N <= 2^31 - 1`, so `N` fits in `int` (use `long long` if you prefer).
- `1 <= K <= 9` when everything is `int`, because `10^9 <= 2^31 - 1` but
  `10^10 = 10000000000` overflows signed 32-bit.
- `K <= 18` if the power and `N` are stored in `long long`.
- `K = 0` is degenerate: `10^0 = 1`, so `N % 1 = 0`. Treat it as invalid.
- `N < 0` is not part of the task; C++ `%` would return a negative remainder
  (`-123456 % 1000 == -456`), so take `abs(N)` first if negatives are legal.
- The output is numeric. If the statement asks for exactly `K` characters,
  switch to fixed-width printing (see `notes.md`).

## Approach at a glance

1. Read `N` and `K`.
2. Build `p = 10^K` with a loop: start `p = 1`, multiply by `10` exactly `K` times.
3. Print `N % p`.

| Time | Space |
| --- | --- |
| O(K) to build the power, O(1) for the modulo | O(1) |

## Solution

[`solution.cpp`](./solution.cpp)

Note: the checked-in file multiplies by `10` three times and never reads `K`,
so it is correct only for `K = 3`. `notes.md` has a `Current-code review`
section with the precise defect and the minimal fix.

## What this teaches

- `% 10` peels one digit, `% 100` peels two; the divisor alone decides how many
  positions survive.
- A power of ten is built with a loop; `^` in C++ is bitwise XOR, and `pow`
  returns a `double`.
- The same rule works in any base: `% 2^k` keeps the low `k` bits.
- Magnitude reasoning: `10^K` becomes the binding limit long before `N` does.
- Input binding comes from the order of `cin >>` calls, not from declaration
  order, which is why `int K, N;` still reads `N` first.

## Checklist

- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
