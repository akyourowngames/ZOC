# Number Classifier
**Pattern:** independent boolean predicates folded into a counter | **Prerequisites:** `bool` functions, `&&`, `%`, `if` without `else`, counting patterns

## Problem statement
Read one integer `N` and print how many of the following two properties it satisfies:

1. `N` is **positive and even** (both conditions at once — this counts as **one** property).
2. `N` is **divisible by 5**.

The answer is therefore `0`, `1`, or `2`. The exercise is about independent checks: each
property is asked separately and each true answer adds one to a shared counter, so no
property can hide another. The two properties overlap (a positive multiple of 10 such as `20`
satisfies both), which is exactly why the counter must not be an `if`/`else if` chain.

The folder name contains a spelling mistake (`classiffier`); it is kept so existing links
and paths keep working.

## Input and output
- Input: one line containing a single integer `N`.
- Output: one line containing a single integer, the count in `0..2`. No words, no newline
  required beyond the value itself.

## Examples
### Example 1
```text
Input:
10
Output:
2
```
**Why:** `10 > 0` and `10 % 2 == 0`, so property 1 holds (count 1). `10 % 5 == 0`, so
property 2 holds (count 2). Both properties are counted, which is why the two `if`s are
sequential rather than `else if`.

### Example 2
```text
Input:
15
Output:
1
```
**Why:** `15` is positive but odd, so property 1 fails. `15 % 5 == 0`, so property 2 passes.
Count is 1 — the odd number still earns a point, and the missing point is the parity one.

### Example 3
```text
Input:
0
Output:
1
```
**Why:** `0 > 0` is false, so the combined property 1 fails even though zero is even.
`0 % 5 == 0` is true, so property 2 passes. This is the example that separates "even" from
"positive and even" and catches code that counts parity on its own.

### Example 4
```text
Input:
-10
Output:
1
```
**Why:** negative, so property 1 fails. `-10 % 5 == 0` is true in C++ (the remainder is `0`,
and zero is zero regardless of sign), so property 2 passes. Never normalise the sign before
testing divisibility — the test is sign-blind by construction.

## Constraints and assumptions
Practice constraints (not specified by a judge). The code assumes:

- `N` fits in a 32-bit signed `int`.
- No arithmetic is performed beyond `% 2` and `% 5`, so the whole `int` range is safe and no
  overflow is possible.

The count can never exceed 2 with the active code. If the intended task were the older
three-property version (positive, even, divisible by 5, each counted separately) the maximum
would be 3 — see `## Current-code review` in `notes.md`; the statement here follows the
active implementation and the existing README.

## Approach at a glance
1. Write one `bool` function per question: `isPositive`, `isEven`, `isDivisibleBy5`.
2. Compose them: `isValid(n) = isPositive(n) && isEven(n)` expresses property 1 in terms of
   the two atomic tests, so the short-circuit `&&` does the work and the name documents intent.
3. Start `counter = 0`; run one `if` per property; `counter++` when the condition is true.
4. Print the counter.

Why a counter and not `else if`: the properties are not alternatives. Asking
"if (valid) ... else if (divisibleBy5) ..." gives at most 1, because a number that is both
never reaches the second branch.

| Time | Space |
| --- | --- |
| O(1) | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches
- Independent predicates should be counted, not chained with `else if`.
- `&&` short-circuits: if `n > 0` is false, `n % 2 == 0` is never evaluated. This is an
  optimisation and, in general, a safety feature (guarding a dereference or a division).
- Naming a composite condition (`isValid`) turns a comment into code.
- `%` treats `0` and negative multiples consistently: `0 % 5 == 0`, `-10 % 5 == 0`.
- `bool` functions returning `true`/`false` read better in conditions than storing `int` flags.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
