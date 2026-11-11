# Maximum and Minimum of an Array
**Pattern:** initialise from the first element, then scan-and-update in a single pass | **Prerequisites:** arrays, 0-based indexing, best-so-far variables, comparison logic, negative numbers

## Problem statement
Read an integer `N`, then `N` integers into an array. Print the largest element on the first
line and the smallest element on the second line.

The interesting decision is not the loop — it is the **initialisation**. Both running answers
must start from a real element of the input (`arr[0]`), not from `0` or from a magic constant.
Initialising `max` to `0` looks harmless and is wrong for any array of negative numbers.

## Input and output
- Input:
  - line 1: `N`, the number of elements (`N >= 1` is required by the code),
  - line 2: `N` space-separated integers.
- Output:
  - line 1: the maximum element,
  - line 2: the minimum element.

## Examples
### Example 1
```text
Input:
6
3 9 -2 7 0 5
Output:
9
-2
```
**Why:** `max` and `min` both start at `arr[0] = 3`. Scanning from index `1`: `9 > 3` raises
`max` to `9`; `-2 < 3` lowers `min` to `-2`; the remaining values `7`, `0`, `5` change neither.
The scan starts at index `1` because index `0` has already been used as the seed — including it
again would be harmless but redundant.

### Example 2
```text
Input:
4
-5 -2 -9 -1
Output:
-1
-9
```
**Why:** every element is negative. `max` and `min` start at `-5`. Then `-2 > -5` raises `max`
to `-2`, `-9 < -5` lowers `min` to `-9`, and `-1 > -2` raises `max` to `-1` while leaving `min`
alone. The largest is `-1` (closest to zero) and the smallest is `-9` (farthest). A version that
initialised `max = 0` would print `0` here: `0` is not an element, and it is larger than all of
them.

### Example 3
```text
Input:
1
7
Output:
7
7
```
**Why:** with a single element the scan loop body never runs (`i = 1` is not `< 1`), and both
answers stay at `arr[0] = 7`. This is the smallest legal input and the reason `N` must be at
least 1.

### Example 4
```text
Input:
5
4 4 4 4 4
Output:
4
4
```
**Why:** all values equal. Strict comparisons (`>` and `<`) never fire, so both answers remain
the seed. Duplicates need no special handling — unlike "second largest" variants, which do.

## Constraints and assumptions
Practice constraints (not specified by a judge). The code assumes:

- `1 <= N <= 100`. The array is the fixed declaration `int arr[100]`; there is no guard, so
  `N > 100` writes out of bounds (undefined behaviour).
- **`N >= 1` is essential**: the code reads `arr[0]` before the loop, so `N = 0` reads an
  uninitialized element and prints garbage. See `## Current-code review` in `notes.md`.
- Each element fits in a 32-bit signed `int`. No arithmetic is performed — only comparisons and
  assignments — so `INT_MIN` and `INT_MAX` are both safe as element values; only negation or
  addition would overflow, and neither is used.
- The input supplies `N` numbers; a short input leaves elements uninitialized.

## Approach at a glance
1. Read `N`, declare `int arr[100]`.
2. Fill: `for (i = 0; i < N; i++) cin >> arr[i];`
3. Seed both answers from the first element: `max = arr[0]; min = arr[0];`
4. Scan from `i = 1` to `N - 1`. For each element, two independent checks:
   `if (arr[i] > max) max = arr[i];` and `if (arr[i] < min) min = arr[i];`
5. Print `max`, end the line, print `min`.

The seed makes both invariants true before the loop: "`max` is the largest of the elements seen
so far" holds trivially for the single element seen. Every iteration then extends the set by one
element and restores the invariant, which is the inductive proof of correctness.

| Time | Space |
| --- | --- |
| O(N), exactly `2N - 2` comparisons | O(N) stored, O(1) extra |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches
- Initialise a best-so-far variable from **data**, not from a guessed constant.
- Why `max = 0` fails on all-negative arrays while `max = arr[0]` cannot.
- Two accumulators in one pass: the same loop can maintain a maximum and a minimum because the
  updates are independent.
- Strict `>` versus `>=` affects *which* copy of a duplicate is kept, not the printed value.
- Sentinel initialisation (`INT_MIN` / `INT_MAX` from `<climits>`) is the alternative, and it
  still needs `N >= 1` for a sane empty-array policy.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
