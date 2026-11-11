# Number Analyzer: Square and Double
**Pattern:** value-returning function plus reference-modifying function | **Prerequisites:** functions, pass-by-value vs pass-by-reference, evaluation order, `int` overflow

## Problem statement
Read one integer `N`. Print its square, then double `N` through a function that takes a
**reference** to it, and print the new value of `N`. The two results appear on the same
line, separated by a single space.

The exercise exists to make one distinction concrete: a function that receives `int n`
works on a copy and cannot change the caller, while a function that receives `int& n`
works on the caller's variable itself. The output order also forces you to think about
*when* each value is read — the square must be captured before the doubling, otherwise
the printed square would describe the doubled number.

## Input and output
- Input: one line containing a single integer `N`.
- Output: one line, `square N_doubled`, with exactly one space between the two numbers.

## Examples
### Example 1
```text
Input:
4
Output:
16 8
```
**Why:** `square(4)` returns `16` and is stored before the call to `doubleNumber`, which
changes `N` from `4` to `8`. Printing `result` then `N` gives `16 8`.

### Example 2
```text
Input:
-5
Output:
25 -10
```
**Why:** `(-5) * (-5) = 25`; doubling a negative keeps the sign, `-5 * 2 = -10`. Note that
the second value is smaller in value ordering but larger in magnitude — do not "fix" it.

### Example 3
```text
Input:
0
Output:
0 0
```
**Why:** both operations are harmless at zero, and both produce `0`. This is the case that
catches code which prints `result` after an accidental second doubling.

## Constraints and assumptions
Practice constraints (not specified by a judge). The code assumes:

- `N` fits in a 32-bit signed `int`.
- `N * N` fits in `int`: `|N| <= 46340`.
- `2 * N` fits in `int`: `|N| <= 1,073,741,823`.

The square limit is the tighter of the two, so the effective safe domain is
`|N| <= 46340`. Outside it, both `N * N` and `N + N` overflow, and signed overflow in C++
is undefined behaviour (not a defined wrap-around). The program performs no validation of
the input; a failed extraction leaves `N` and `result` uninitialized.

## Approach at a glance
1. Read `N`.
2. `result = square(N);` — capture the square **before** any mutation, because `square`
   reads the current value of `N`.
3. `doubleNumber(N);` — `n` is a reference alias for `N`, so `n = n * 2` rewrites `N`.
4. Print `result` and the now-modified `N` in that order.

Tracing the two calls as data flow is the whole problem:

```text
N = 4  --square-->  result = 16
       --doubleNumber-->  N = 8
output: 16 8
```

| Time | Space |
| --- | --- |
| O(1) | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches
- The practical difference between `int n` and `int& n` at the call site.
- That a reference parameter is an alias, not a copy: `sizeof(int&) == sizeof(int)`; nothing
  is allocated for it.
- Sequencing matters: read a value before mutating its source.
- A function that returns a value can be used inside an expression; a `void` function that
  mutates must be called as its own statement.
- Overflow appears twice in tiny programs, and the lower bound wins.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
