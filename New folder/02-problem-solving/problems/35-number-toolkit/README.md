# Number Toolkit
**Pattern:** three small helpers over one integer: predicate, accumulator loop, in-place modifier | **Prerequisites:** `%` and `/` on integers, `bool` returns, `while` loops, reference parameters, negative-number division

## Problem statement
Read one integer `N` and report three facts about it, one per line:

1. whether it is even or odd (the word `Even` or `Odd`),
2. the sum of its decimal digits,
3. `N` made positive (its absolute value), obtained by a function that modifies `N` in place.

The topic is composition: three functions, each with exactly one job, called in sequence from
`main`. The subtle part is that the language's remainder and division operators are only
"digit-friendly" for non-negative integers, so the digit logic has to normalise the sign first.

## Input and output
- Input: one line containing a single integer `N`.
- Output: three lines — `Even`/`Odd`, the digit sum, and the non-negative version of `N`.

## Examples
### Example 1
```text
Input:
-1234
Output:
Even
10
1234
```
**Why:** `-1234 % 2 == 0`, so it is even. The digit sum is `1 + 2 + 3 + 4 = 10` (the sign is
ignored). `makePositive` replaces `N` with `1234`, which is what the third line prints.

### Example 2
```text
Input:
7
Output:
Odd
7
7
```
**Why:** `7 % 2 == 1`. A single digit sums to itself, and a positive number is already its own
positive version — the helpers must not "fix" an input that needs no fixing.

### Example 3
```text
Input:
0
Output:
Even
0
0
```
**Why:** `0 % 2 == 0`. The digit-sum loop guards on `n > 0`, so it executes zero times and
returns the initial `sum = 0`. This is the case that catches a `do { } while` rewrite, which
would wrongly produce a digit of `0` for an empty number and still give `0` here — but would
break for other inputs only if `sum` were not initialised.

## Constraints and assumptions
Practice constraints (not specified by a judge). The code assumes:

- `N` fits in a 32-bit signed `int`.
- `N != INT_MIN` (`-2,147,483,648`). Negating `INT_MIN` is signed overflow, hence undefined
  behaviour; both `sumDigits` and `makePositive` negate their argument or use `-n`.

There is no upper bound on the digit count beyond the type (`int` has at most 10 digits), so
the digit sum is at most `9 * 10 = 90` — comfortably inside `int`, no overflow in `sum`.

## Approach at a glance
1. `isEven(N)` — one `%` and one comparison, returning `bool`. `main` turns the `bool` into
   the required word with `? :`.
2. `sumDigits(N)` — normalise the sign, then repeatedly peel the last digit with `% 10` and
   drop it with `/ 10` until the value is zero.
3. `makePositive(N)` — take a reference and negate in place when negative.
4. Print in the required order; the third value comes from the **modified** `N` itself.

Note the interaction with ordering: `sumDigits` takes `int` by value, so its internal
negation cannot leak out. `makePositive` takes `int&`, so its negation does. Printing the
digit sum *before* `makePositive` is correct but not strictly required, because the digit sum
is sign-independent.

| Time | Space |
| --- | --- |
| O(d) where `d` is the number of digits, at most 10 | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches
- `bool` is a first-class return type; `isEven` answers a question and nothing more.
- Integer division truncates toward zero, so `-1234 / 10 == -123` and `-1234 % 10 == -4`:
  the remainder inherits the sign of the dividend. That is why digit code normalises first
  or works on a positive copy.
- Ternary `?:` maps a `bool` to a word in one expression.
- Choosing the right parameter mode per function: value for reading, reference for rewriting.
- `INT_MIN` is the one value whose negation does not fit; it deserves an explicit test.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
