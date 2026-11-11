# Maximum of Three Numbers

**Pattern:** running maximum, or three branch guards that must cover ties | **Prerequisites:** `if`/`else if`/`else`, `&&`, comparison vs assignment, tie handling

## Problem statement

Read three integers `A`, `B`, `C`. Print the largest of the three.

The natural first attempt is a chain of guards: "`A` is the maximum if it is
bigger than both others; otherwise `B` if it is bigger than both others;
otherwise `C`". That chain is only correct if each guard weakens the strict
comparisons to `>=`, because with strict `>` a tie between two candidates makes
every guard false and the fallback prints the third value. The safe pattern is
a running maximum: start with `A` and replace it whenever a later value is
strictly larger.

## Input and output

- Input: three integers `A B C`, whitespace-separated.
- Output: one integer, the maximum. No label, no index, no explanation.
- Equal values are allowed; the maximum must still be printed once.

## Examples

### Example 1
```text
Input:
4 11 7
Output:
11
```
**Why:** `11 > 4` and `11 > 7`; `11` is the unique maximum, so both the chain
version and the running maximum print `11`.

### Example 2
```text
Input:
-3 -8 -5
Output:
-3
```
**Why:** the values are negative but ordered normally: `-3 > -5 > -8`. Starting
a running maximum from `0` would print `0`, which is not even in the input.

### Example 3
```text
Input:
5 5 3
Output:
5
```
**Why:** `A` and `B` tie for the maximum, `C` is smaller. The running maximum
yields `5`. The strict-comparison chain in the current file prints `3` here; see
the current-code review in `notes.md`.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- All three values fit in `int`; negatives and zero are allowed.
- Duplicates are allowed. The README's tie note requires the answer to remain
  correct when two or three values are equal.
- Exactly three tokens are supplied; nothing follows them.

## Approach at a glance

Running maximum:

```text
m = A
if (B > m) m = B
if (C > m) m = C
print m
```

Two comparisons, no case analysis, and ties are irrelevant because `>` simply
does not update `m` for an equal value. The all-pairs chain can be made correct
with `>=`, but it is longer and easier to get wrong.

| Time | Space |
| --- | --- |
| O(1) | O(1) |

## Solution
[`maximum-of-three.cpp`](./maximum-of-three.cpp)

## What this teaches

- A running maximum is a loop body that happens to run twice; it generalises to
  `n` values and to arrays.
- Strict `>` in a chain of guards silently excludes ties; the fallback branch
  then prints a value that may be the minimum.
- Initialising a maximum to `0` is only safe when all inputs are non-negative.
- Maximum is a value, not a position or a count.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
