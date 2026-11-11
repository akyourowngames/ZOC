# Product of Digits
**Pattern:** Digit-extraction loop with a multiplicative accumulator | **Prerequisites:** `%` and `/`, `while` loops, identity elements, integer overflow

## Problem statement

Read one integer `N` and print the product of all of its decimal digits. The program
peels digits off the right-hand end with `N % 10`, multiplies each one into a running
accumulator, and shrinks the number with `N / 10` until nothing is left.

Zero is a real digit here. If `N` contains any `0`, the running product becomes `0`
and stays `0`, because multiplication by zero is absorbing.

## Input and output

- Input: one integer `N` on a single line (`cin >> N`). The repo's statement calls it a
  positive integer.
- Output: one bare integer, the product of the digits. The current code uses
  `cout << product;` — no label, no trailing newline.

## Examples

### Example 1
```text
Input:
203
Output:
0
```
**Why:** digits are `2, 0, 3`, and `2 * 0 * 3 = 0`. The zero is multiplied in like any
other digit, so the accumulator is poisoned at the second step.

### Example 2
```text
Input:
5831
Output:
120
```
**Why:** extraction order is right-to-left: `1, 3, 8, 5`. The accumulator goes
`1 -> 3 -> 24 -> 120`. Multiplication is commutative, so extraction order does not
affect the result.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:
- `N` fits in `int`, so `N <= 2147483647` and `N` has at most 10 digits.
- `N >= 1`, matching the "positive integer" wording inherited from the sum-of-digits
  problem. `N = 0` is out of domain but still worth checking — see notes.md.
- Digits are base-10 digits; the sign is not a digit.

Under those assumptions the product cannot overflow `int`. The worst case inside `int`
is `999999999`, giving `9^9 = 387420489`; the ten-digit ceiling `2147483647` gives only
`903168`. If you ever widen the input to `long long`, widen the accumulator too: the
product of eighteen `9`s is `1.5e17` (fits in `long long`), but twenty `9`s does not.

## Approach at a glance

1. Start the accumulator at the multiplicative identity: `product = 1`.
2. While `N > 0`: `product *= N % 10;` then `N /= 10;`.
3. Print `product`.

This is the generic *streaming fold* shape: choose an identity, fold one element per
iteration, stop when the source is exhausted. Nothing needs to be stored, so the
memory is constant.

| Time | Space |
| --- | --- |
| O(d) where d = number of digits | O(1) |

`d = floor(log10 N) + 1`, so for `int` input the loop runs at most 10 times.

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches

- The identity element is problem-specific: `0` for sums and counts, `1` for products,
  `0` or `-1` for a running maximum depending on the domain.
- `% 10` reads the last digit; `/ 10` deletes it. Together they form the digit stream.
- An absorbing element (`0` under `*`) means the accumulator can never recover.
- A fold over a digit stream needs no array — compare with problems that build one.
- Accumulator type selection is part of correctness, not an afterthought.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
