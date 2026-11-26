# The Middle Number

**Pattern:** value between two others, expressed as two ordered pairs joined by `||` | **Prerequisites:** chained comparisons, `&&`/`||` precedence, ordering vs input position

## Problem statement

Read three integers `A`, `B`, `C`. Print the one that is neither the largest
nor the smallest — the median by value, not the second number typed.

For three **distinct** values, a value is the median exactly when it lies
strictly between the other two. `B` is between `A` and `C` if `A < B < C` or
`C < B < A`; the same test applied to `A` covers the second case, and if
neither holds then `C` is the median. That is the solution the file
implements.

With duplicates the phrase "neither largest nor smallest" becomes ambiguous:
`3 3 5` has no unique middle element. The code takes the distinct-value reading;
see the current-code review.

## Input and output

- Input: three integers `A B C`.
- Output: one integer — the median value — with no label or punctuation.
- Ties: the README assumes distinct values; the program's behaviour for
  duplicates is documented below rather than silently assumed.

## Examples

### Example 1
```text
Input:
9 2 6
Output:
6
```
**Why:** sorted order is `2, 6, 9`; the middle value is `6`, which happens to
be the third input. Neither `9` (max) nor `2` (min) qualifies.

### Example 2
```text
Input:
1 2 3
Output:
2
```
**Why:** `A < B` and `B < C`, so the first condition group is true and `B` is
printed.

### Example 3
```text
Input:
3 2 1
Output:
2
```
**Why:** descending order; `C < B` and `B < A` is the second half of the same
condition, so `B` is still the median.

### Example 4
```text
Input:
2 3 1
Output:
2
```
**Why:** `A` is between the others (`1 < 2 < 3` is `C < A < B`), so the second
branch fires and prints `A`.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- Three integers in `int` range, possibly negative.
- The README's primary assumption is **three distinct values**; the code is
  correct for all six orderings of distinct numbers.
- If duplicates are allowed, the statement must define "middle"; the
  `sort`-based median is the usual definition, and the current code does not
  match it for every duplicate input.
- Output is the value only.

## Approach at a glance

Three ordered comparisons per candidate, at most two candidates tested:

```text
if B is strictly between A and C -> B
else if A is strictly between B and C -> A
else -> C
```

A more robust alternative is to sort three values and print index `1`; that
needs `<algorithm>` but removes the case analysis and handles duplicates.

| Time | Space |
| --- | --- |
| O(1) | O(1) |

## Solution
[`middle-number.cpp`](./middle-number.cpp)

## What this teaches

- "Between" needs both directions: ascending (`A < B && B < C`) and descending
  (`C < B && B < A`). One `&&` chain is only half the answer.
- The last branch of a case analysis is a claim; it must be justified by the
  cases already excluded.
- Input position is not order. The middle number typed is unrelated to the
  median.
- Sorting is the general-purpose tool; explicit comparisons are the
  no-library, exam-friendly version.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
