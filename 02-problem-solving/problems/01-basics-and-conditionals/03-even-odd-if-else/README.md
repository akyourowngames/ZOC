# Even or Odd

**Pattern:** two-branch `if`/`else` on a single parity test | **Prerequisites:** `%`, `==` vs `=`, Boolean conditions, exact output strings

## Problem statement

Read one integer `N`. Decide whether it is even or odd and print the single
required word.

A number is even when it leaves no remainder after division by `2`, that is
when `N % 2 == 0`; otherwise it is odd. Every integer falls into exactly one
of the two cases, which is why a two-branch `if`/`else` is the right shape:
one comparison, one decision, no fallthrough.

## Input and output

- Input: one integer `N` (the README does not bound it; see assumptions).
- Output: one word on one line — `even` for even `N`, `odd` for odd `N`, as in
  the README examples. Check the original statement for capitalisation
  (`EVEN`/`ODD` vs `even`/`odd`); the comparison is byte-exact.
- The checked-in program prints full sentences (`N is even.`) instead of the
  required word; see the current-code review in `notes.md`.

## Examples

### Example 1
```text
Input:
8
Output:
even
```
**Why:** `8 % 2 == 0`, so the even branch is taken. `8 = 2 * 4` exactly.

### Example 2
```text
Input:
7
Output:
odd
```
**Why:** `7 % 2 == 1`, the condition is false, so the `else` branch prints
`odd`.

### Example 3
```text
Input:
0
Output:
even
```
**Why:** `0 % 2 == 0`; zero is even by definition, and the code sends it to
the even branch without a special case.

### Example 4
```text
Input:
-3
Output:
odd
```
**Why:** C++ computes `-3 % 2 == -1`, which is not `0`, so the `else` branch is
taken. Only the comparison with zero matters, not the exact remainder value.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `N` is an integer that fits in `int` (`-2,147,483,647 ... 2,147,483,647`);
  negatives and zero are allowed, since the rule handles them.
- Exactly one number is given, with no extra tokens.
- The judge compares output exactly: one word, no period, no sentence, no
  interpolation of the number.

## Approach at a glance

One remainder, one comparison, one `cout`. Because parity is a partition of
the integers, the second condition never needs to be written: "not even"
already means "odd", so `else` is complete.

| Time | Space |
| --- | --- |
| O(1) | O(1) |

## Solution
[`even-odd.cpp`](./even-odd.cpp)

## What this teaches

- `%` reduces a number to a small set of residues, and a residue class is a
  clean branch condition.
- `==` compares; `=` assigns. `N % 2 = 0` is not even a valid expression.
- "Otherwise" is a real case: after the even test, `else` covers every odd
  integer, including negatives.
- Output text is part of the problem. The sentence in the code is not the
  word in the statement.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
