# Factorial
**Pattern:** running product across `1..N` | **Prerequisites:** `while` loops, multiplication, the identity element `1`, 32-bit overflow

## Problem statement

Read a non-negative integer `N` and print `N!`, the product of every integer
from `1` to `N`:

```text
N! = 1 * 2 * 3 * ... * N
```

By convention the empty product is `1`, so `0! = 1`. The folder is the standard
follow-up to the summation loop: same loop shape, different operator.

## Input and output

- Input: one non-negative integer `N` on a single line.
- Output: the value of `N!`, followed by a newline.
- `N = 0` must print `1`, not `0`. This falls out automatically if the product
  starts at `1` and the loop starts at `1`.
- `N < 0` is outside the problem; factorial is undefined there.

## Examples

### Example 1
```text
Input:
5
Output:
120
```
**Why:** `1 * 2 * 3 * 4 * 5 = 120`. Five multiplications, five loop iterations.

### Example 2
```text
Input:
0
Output:
1
```
**Why:** The loop condition `1 <= 0` is false on the first test, so the body
never runs and the initial value `1` is printed. That is exactly the empty
product convention, not a special case.

### Example 3
```text
Input:
10
Output:
3628800
```
**Why:** `10! = 3628800`, still far below `INT_MAX = 2147483647`. At `N = 12`
the answer is `479001600`; at `N = 13` it no longer fits in `int`.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `0 <= N <= 12` for an `int` accumulator, since
  `12! = 479001600 <= 2147483647 < 13! = 6227020800`.
- `N <= 20` for `unsigned long long`, since
  `20! = 2432902008176640000 < 2^64 - 1` but `21!` overflows it.
- Beyond 20 the answer needs big-integer arithmetic or a base-10^9 array.
- `N` fits comfortably in `int` for any realistic factorial input; the product,
  not the input, is the binding constraint.
- Input is a single integer.

## Approach at a glance

1. Read `N`.
2. `factorial = 1`, `i = 1`.
3. While `i <= N`: `factorial *= i`, then `i++`.
4. Print `factorial`.

| Time | Space |
| --- | --- |
| O(N) multiplications | O(1) |

## Solution

[`solution.cpp`](./solution.cpp)

## What this teaches

- The accumulator pattern transfers directly from `+` to `*`; only the identity
  element changes (`0` for sums, `1` for products).
- Starting the product at `0` annihilates every answer — the multiplicative
  equivalent of an off-by-one disaster.
- The `0!` convention is a consequence of the empty product, not an exception
  written into the code.
- Factorials grow faster than any polynomial: between `10!` (3.6 million) and
  `13!` (6.2 billion) the value crosses the entire 32-bit signed range.
- `<=` versus `<` is the whole difference between `120` and `24` for `N = 5`.

## Checklist

- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
