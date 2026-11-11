# Greater of Two Numbers

**Pattern:** single comparison with the default branch covering ties | **Prerequisites:** relational operators, `if`/`else`, number order on negatives

## Problem statement

Read two integers `A` and `B` and print the larger of the two. If the two
values are equal, print that value once — equality is not a separate case,
because either answer is the same number.

The solution asks one question, `A < B`. If true, `B` is the answer;
otherwise `A` is at least as large as `B`, so `A` is the answer. The `else`
branch therefore serves two situations at once (`A > B` and `A == B`), which
is exactly what a two-way comparison should do.

## Input and output

- Input: two integers `A` and `B` on one line (or separated by whitespace).
- Output: one integer — the larger value — and nothing else.
- Equal inputs must still produce exactly one number.

## Examples

### Example 1
```text
Input:
8 13
Output:
13
```
**Why:** `8 < 13` is true, so the program prints `B = 13`.

### Example 2
```text
Input:
-4 -9
Output:
-4
```
**Why:** `-4` is greater than `-9` on the number line (it is to the right), so
`A < B` is false and the program prints `A = -4`. Comparing magnitudes would
give the wrong answer here.

### Example 3
```text
Input:
5 5
Output:
5
```
**Why:** `5 < 5` is false, so the `else` branch prints `A`, which equals `B`.
Exactly one number is printed.

### Example 4
```text
Input:
0 -7
Output:
0
```
**Why:** `0 < -7` is false, so `A = 0` is printed; zero beats a negative.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `A` and `B` are integers in `int` range, possibly negative or zero.
- The judge expects the value only: no "A is greater" message, no index, no
  trailing words.
- Exactly two tokens are supplied.

## Approach at a glance

Compare once. Choose the branch that prints `B` when `B` is strictly bigger,
and let `else` cover "`A` is bigger or they are equal". Writing the condition
in the positive form (`A < B` -> print `B`) avoids the classic mistake of
inverting the branches.

| Time | Space |
| --- | --- |
| O(1) | O(1) |

## Solution
[`greater-number.cpp`](./greater-number.cpp)

## What this teaches

- A two-way decision can be expressed with one test plus `else`; the second
  test would be redundant.
- Ties are handled by choosing a convention ("`else` means `A`"), which keeps
  the output single-valued.
- Negative numbers follow the same ordering rules; magnitude is irrelevant.
- The output is a value, not a sentence.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
