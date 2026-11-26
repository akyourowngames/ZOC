# Swapping Two Values

**Pattern:** exchange two variables through a third slot (or through arithmetic) | **Prerequisites:** assignment semantics, temporaries, `cout` formatting, overflow

## Problem statement

Read two integers `A` and `B`, exchange their values, and print the new `A`
and `B` on one line separated by a single space.

The point of the exercise is not the output — it is the mechanics of
assignment. `A = B; B = A;` fails because the first statement destroys `A`
before `B` needs it. The two correct approaches are a temporary variable and an
arithmetic swap. The active code uses the arithmetic version:

```text
A = A + B;
B = A - B;   // = (old A + old B) - old B = old A
A = A - B;   // = (old A + old B) - old A = old B
```

The commented block above it is the temporary-variable version, kept as the
reference.

## Input and output

- Input: two integers `A` and `B`, whitespace-separated.
- Output: the two values after the swap, `A` first, separated by one space,
  on one line, with no labels.
- The program prints numbers, not "Before/After" text.

## Examples

### Example 1
```text
Input:
5 9
Output:
9 5
```
**Why:** the values trade places: the new `A` is the old `B` (`9`) and the new
`B` is the old `A` (`5`).

### Example 2
```text
Input:
-4 7
Output:
7 -4
```
**Why:** the swap is independent of sign; only the assignment order matters.

### Example 3
```text
Input:
3 3
Output:
3 3
```
**Why:** swapping equal values changes nothing, and the arithmetic swap
computes `A = 6`, `B = 6 - 3 = 3`, `A = 6 - 3 = 3` without error.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `A` and `B` fit in `int`.
- The arithmetic swap needs `A + B` to fit in `int` to be well defined. With
  `|A|, |B| <= 1,000,000,000` the sum can reach `2,000,000,000`, which still
  fits (`2,147,483,647` is the limit), but `1,500,000,000 + 1,500,000,000`
  already overflows. The README states no bounds, so nothing guarantees this.
- Output format is exactly `A B` with one space; a trailing space or missing
  newline is a formatting detail the statement does not pin down.

## Approach at a glance

Either keep the old `A` in a temporary and assign in reverse order, or use the
sum as the temporary. The temporary version is provably safe; the arithmetic
version trades one variable for one possible overflow.

| Time | Space |
| --- | --- |
| O(1) | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches

- Assignment overwrites; a value needed later must be saved first.
- A temporary variable is the standard, overflow-free swap.
- Arithmetic swap works algebraically for any values, but needs a type wide
  enough for `A + B`.
- `std::swap` already exists; knowing both manual forms explains what it does.
- Output formatting (separator, count of values) is part of the contract.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
