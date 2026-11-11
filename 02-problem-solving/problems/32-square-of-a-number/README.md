# Square of a Number
**Pattern:** pure function with one value parameter and one return value | **Prerequisites:** functions, pass-by-value, `%`/`*` operators, 32-bit integer ranges

## Problem statement
Read one integer `N` and print its square, `N * N`.

The point of the exercise is structure, not just arithmetic: the multiplication must
live inside a function that receives `N` **by value** and `return`s the result, while
`main` only performs input, one function call, and output. Because the parameter is a
copy, the caller's `N` is never modified — that is what makes `square` safe to call
from anywhere, and it is the property that separates this problem from the reference
parameter exercises in folders 33-35.

## Input and output
- Input: one line containing a single integer `N`.
- Output: one line containing the decimal value of `N * N` — no labels, no extra spaces.

## Examples
### Example 1
```text
Input:
4
Output:
16
```
**Why:** `4 * 4 = 16`. `main` reads `M = 4`, `square(4)` returns `16`, and `cout` prints it.

### Example 2
```text
Input:
-7
Output:
49
```
**Why:** a negative multiplied by a negative is positive: `(-7) * (-7) = 49`. Sign never
leaks into the result of a squaring operation, which is why `x * x >= 0` for every `int`
that does not overflow.

### Example 3
```text
Input:
0
Output:
0
```
**Why:** `0 * 0 = 0`. Zero is a valid input, not an error case; the function must not
special-case it.

## Constraints and assumptions
Practice constraints (not specified by a judge). The code assumes:

- `N` is a well-formed decimal integer that fits in a 32-bit signed `int`.
- `N * N` still fits in `int`, i.e. `|N| <= 46340`.

The second assumption is the real limit and is easy to miss:

| `N` | `N * N` | Fits in `int` (`INT_MAX = 2,147,483,647`)? |
| --- | --- | --- |
| `46340` | `2,147,395,600` | yes |
| `46341` | `2,147,488,281` | **no** — signed overflow, undefined behaviour |

There is no input validation in the code; a non-numeric token makes `cin >> M` fail and
leaves `M` uninitialized, which is undefined behaviour.

## Approach at a glance
1. Declare `int M;` and read it with `cin >> M`.
2. Call `square(M)`. The argument is copied into the parameter `N`.
3. `square` evaluates `N * N` once and returns that `int`.
4. `cout << square(M);` prints the returned value.

This is a single multiplication, so the running time does not depend on the magnitude of
`N`. The function has no state, no loop, and no side effects — it is a pure transformation
from one `int` to another.

| Time | Space |
| --- | --- |
| O(1) | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches
- How to move a computation out of `main` into a reusable, testable function.
- Pass-by-value semantics: `square` receives a copy, so the caller's variable is unchanged.
- `^` in C++ is bitwise XOR, not exponentiation: `4 ^ 2` is `6`, not `16`.
- `std::pow(4, 2)` returns `double`; for integer squaring, plain multiplication is exact,
  faster, and overflow-checkable.
- Where the `int` limit actually sits (`46340` vs `46341`), and why exceeding it is
  undefined behaviour rather than a wrapped value you can rely on.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
