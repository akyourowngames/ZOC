# Number Triangle (Inverted)
**Pattern:** Nested loops — outer loop for rows, inner loop for the row's content | **Prerequisites:** nested `for` loops, loop bounds as functions of the outer index, output formatting

## Problem statement

Read one integer `N` and print `N` rows. Row `i` (counting from `1`) contains the digits
`1, 2, ..., N - i + 1` written consecutively with no separators. The result is an inverted
triangle: the first row is the full run `1..N`, and each following row loses its last
element.

For `N = 3`:

```text
123
12
1
```

The row length is `N - i + 1`: it decreases by one per row, which is what makes the shape a
triangle. The inner loop's bound depending on the outer index is the single most reusable
idea in pattern printing.

## Input and output

- Input: one integer `N` (`cin >> N`).
- Output: `N` lines. Row `i` is the concatenation of the decimal representations of
  `1..N-i+1`, followed by a newline (`cout << endl` after each row).
- No trailing spaces, no blank line at the end beyond the final newline.

## Examples

### Example 1
```text
Input:
3
Output:
123
12
1
```
**Why:** row 1 has `3 - 1 + 1 = 3` values, row 2 has `2`, row 3 has `1`. The total number
of printed values is `3 + 2 + 1 = 6 = 3 * 4 / 2`.

### Example 2
```text
Input:
5
Output:
12345
1234
123
12
1
```
**Why:** each row is the previous row minus its last character. The outer loop runs five
times; the inner loop runs `5, 4, 3, 2, 1` times respectively.

### Example 3
```text
Input:
1
Output:
1
```
**Why:** one row with `1 - 1 + 1 = 1` value. Boundary case where the triangle degenerates to
a single character.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:
- `N >= 1` and `N` fits in `int`.
- The output is judged character-exactly: no spaces, lowercase nothing, one newline per row.

Two practical bounds follow from the output size:
- The program prints `N(N+1)/2` characters plus `N` newlines, so it is O(N^2) in *output*.
  `N = 10^4` already means about 50 million characters; beyond that, output time dominates
  every other consideration.
- The "no separators" rule is only unambiguous for `N - i + 1 <= 9`, i.e. `N <= 9` for the
  first row. For `N >= 10` rows contain multi-digit numbers glued together (row 1 of
  `N = 11` is `1234567891011`), which no reader can parse. See notes.md.

## Approach at a glance

1. Read `N`.
2. For `i = 1..N` (rows):
   - for `j = 1..N - i + 1` (columns): print `j`;
   - print a newline.
3. Done — nothing is stored.

Two counters, two bounds, one dependency: the inner bound is a function of `i`. The row
count is `N`; the row length is `N - i + 1`; the column value equals the column index.

| Time | Space |
| --- | --- |
| O(N^2) | O(1) |

Precisely: `N(N+1)/2` printed values, `N` newlines.

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches

- Nested loops: the outer loop selects the row, the inner loop fills it. Neither can be
  collapsed without changing the output.
- Bounds that depend on the outer index (`j <= N - i + 1`) encode the shape. Change the
  bound and you get a rectangle, a right triangle, or a pyramid.
- Deriving the bound from the row number instead of hard-coding rows is what makes the
  program scale.
- Output-heavy loops are limited by I/O, not arithmetic; `endl`'s flush per row is
  measurable at scale.
- Character-exact output problems punish stray spaces and missing newlines.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
