# Smallest Digit in a Number
**Pattern:** Digit-extraction loop with a running minimum | **Prerequisites:** `%` and `/`, `while` loops, `if` comparison, sentinel initialization

## Problem statement

Read one integer `N` and print the smallest of its decimal digits. The program visits
every digit with the standard digit loop and keeps a running minimum, replacing the best
whenever a strictly smaller digit appears.

Since decimal digits lie in `0..9`, the natural starting value is `9`: the largest possible
digit, so any real digit can beat it. That choice is also the program's weak point, because
if *no* digit is ever processed (`N = 0`), the placeholder `9` is printed as if it were an
answer.

## Input and output

- Input: one integer `N` (`cin >> N`), a single value.
- Output: one bare digit, `0` through `9`, via `cout << smallest;` — no label, no newline.

## Examples

### Example 1
```text
Input:
5831
Output:
1
```
**Why:** digits are `5, 8, 3, 1`. Right-to-left the running best goes `1 -> 1 -> 1 -> 1`;
the very first digit is already the minimum and nothing beats it.

### Example 2
```text
Input:
4027
Output:
0
```
**Why:** a zero digit always wins a minimum. The `0` is found at the second extraction and
`smallest` sticks at `0`.

### Example 3
```text
Input:
999
Output:
9
```
**Why:** all digits equal the initial bound. The strict `<` never fires, so `smallest`
stays `9` — and that is the right answer, because `9` really is a digit of the input.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:
- `N` fits in `int`: at most 10 digits, `N <= 2147483647`.
- `N >= 1` per the "positive integer" wording of the statement.
- Digits are base 10; the sign is not a digit.

`N = 0` is out of domain. The current code prints `9` for it, which is wrong under the
usual reading ("smallest digit of 0 is 0"). See `## Current-code review` in notes.md.

Negative `N` is likewise out of domain and also prints `9`.

## Approach at a glance

1. `smallest = 9` — an upper bound that every digit can beat or tie.
2. While `N > 0`: `digit = N % 10`; if `digit < smallest` then `smallest = digit`;
   `N /= 10`.
3. Print `smallest`.

Symmetric to the largest-digit problem with two substitutions: bound `9` instead of `0`,
and `<` instead of `>`. The fold step is otherwise identical.

| Time | Space |
| --- | --- |
| O(d) where d = number of digits | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches

- A running minimum needs an *upper* bound as its identity: any value `>= 9` works, and
  `9` doubles as a real digit.
- Sentinel initialization is only safe when the loop is guaranteed to run at least once.
  "Guaranteed" should be an explicit precondition, not a hope.
- 「`0` beats everything in a min, nothing in a max」 is worth memorizing: zeros are
  decisive for minimums and products, irrelevant for maximums and sums.
- Same loop skeleton as sum/product/largest/reverse: only the fold body changes.
- A frequency array `int freq[10]` is the general solution when more than one statistic is
  needed.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
