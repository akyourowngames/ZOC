# Basic Input and Arithmetic

**Pattern:** read once, evaluate one arithmetic expression, print one line (no prompts, no labels) | **Prerequisites:** `cin`/`cout`, `int` vs `long long`, `*`, `/`, `%`, operator precedence

## Problem statement

This folder is the opening drill set. The file holds four commented warm-up
programs plus one active program; treat each block as a separate problem.

1. **Double the number.** Read one integer `n`, print `2 * n`.
2. **Rectangle area.** Read `length` and `width`, print `length * width`.
3. **Echo a long number.** Read a whole number and print it back unchanged.
4. **Large product.** Read `a` and `b`, each up to `1,000,000`, print `a * b`.
5. **Two-number arithmetic table** (the active block). Read `a` then `b`, then
   print `a * b`, `b / a`, `b - a`, `a + b`, `b % a` — one result per line.

Exercise 5 is the only block that runs, so it is the "current solution"; the
other four are kept as a worked progression from `int` to `long long`.

## Input and output

- Input: exercise 1: one integer `n`. Exercise 2: two integers
  `length width`. Exercise 3: one integer. Exercise 4: two integers `a b`.
  Exercise 5: two integers `a b`, read with two separate `cin >>` calls
  (whitespace-separated input works the same either way).
- Output: the single requested value for exercises 1-4. For exercise 5, five
  lines in the order product, quotient, difference, sum, remainder. Every
  value is a whole number; the current code also writes a text label before
  each value.

## Examples

### Example 1
```text
Input:
7
Output:
14
```
**Why:** `7 * 2 = 14`; no prompt, no "Answer:" text, so the output is exactly
the number.

### Example 2
```text
Input:
5 4
Output:
20
```
**Why:** `length * width = 5 * 4 = 20`.

### Example 3
```text
Input:
1000000 1000000
Output:
1000000000000
```
**Why:** `10^6 * 10^6 = 10^12`, which is far beyond `int` but fits comfortably
in `long long`.

### Example 4 (exercise 5, current code)
```text
Input:
7 3
Output:
Multiplication: 21
Division: 0
Difference: -4
Sum: 10
Remainder: 3
```
**Why:** `7*3 = 21`, `3/7 = 0` (integer division truncates), `3-7 = -4`,
`7+3 = 10`, `3%7 = 3`. A judge expecting bare numbers would reject the labels.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- All inputs are integers that fit in a signed 64-bit type.
- Exercise 4: `1 <= a, b <= 1,000,000`, so `a * b <= 10^12`.
- Exercise 2: `length, width` are non-negative and small enough that the area
  fits in the chosen type; no unit conversion is implied.
- Exercise 5: `a != 0`, because the code divides by `a`. Values are read as
  `int`, so `|a|, |b| <= 2,147,483,647`.
- Output is checked exactly: no prompts, no labels, one value per line.

## Approach at a glance

Read the operand(s) in the declared order, compute directly, print the result
with `'\n'`. The only real decision is the type: look at the largest possible
*result*, not the largest possible *input*. If that result can exceed about
`2.1 * 10^9`, use `long long`; if it can exceed `9.2 * 10^18`, no built-in type
is enough on most judges.

| Time | Space |
| --- | --- |
| O(1) | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

Exercise 5 is the active block; exercises 1-4 are the commented blocks above
it, in file order.

## What this teaches

- Programs start at input and end at output: `cin >> n; cout << n * 2;` is a
  complete judge solution.
- Prompts (`"Enter your integer: "`) and labels (`"Answer: "`) are for humans
  and become wrong answers in an automated grader.
- Type selection follows the result range. `int * int` overflows before the
  assignment, so widening only the destination is not enough.
- Integer division truncates toward zero; `%` is remainder, not a fraction.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
