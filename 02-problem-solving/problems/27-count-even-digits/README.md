# Count Even Digits

**Pattern:** digit extraction plus a filtered counter (`% 10`, `% 2`, `/ 10`) | **Prerequisites:** modulo, integer division, `if` inside a loop, counting accumulators, parity

## Problem statement

Read a non-negative integer `N` and print how many of its decimal digits are
even. The even digits are `0, 2, 4, 6, 8`.

For `N = 2481` the even digits are `2`, `4`, `8`, so the answer is `3`; the
`1` is skipped.

This is the digit-extraction loop from folder
[`26-sum-of-digits`](../26-sum-of-digits/) with the *accumulate everything*
step replaced by *accumulate conditionally*. The counter only advances when a
predicate holds, which is the general shape of every "how many satisfy X"
question over digits.

## Input and output

- Input: one line containing the integer `N`.
- Output: one integer — the count of even decimal digits in `N`.

## Examples

### Example 1
```text
Input:
2481
Output:
3
```
**Why:** digits scanned right to left are `1, 8, 4, 2`; the test
`digit % 2 == 0` passes for `8`, `4`, `2` and fails for `1`. Three passes,
counter reaches `3`.

### Example 2
```text
Input:
1357
Output:
0
```
**Why:** every digit is odd. The counter is never incremented, and printing the
initial value `0` is the correct answer — a loop that performs no successful
update still has a meaningful result.

### Example 3
```text
Input:
0
Output:
1
```
**Why:** `0` has one decimal digit, and `0` is even (`0 % 2 == 0`), so the
count is `1`. If your judge expects `0` here — treating "no digits processed"
as the answer — that is a different convention; see the edge-case discussion
in [`notes.md`](./notes.md).

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `N` fits in a 32-bit signed `int` (`0 <= N <= 2 147 483 647`), so at most 10
  digits and the answer is in `[0, 10]`.
- Input is non-negative; `abs(N)` should be taken first otherwise.
- `0` is treated as an even digit, and the input `0` therefore counts as one
  even digit.
- Output is a single number; a trailing newline is optional.

## Approach at a glance

One loop peels digits with `N % 10` and `N / 10`. Before discarding each
digit, test it:

```cpp
digit = N % 10;
if (digit % 2 == 0) counter++;
N = N / 10;
```

The counter starts at `0` — the identity for counting, so "nothing matched" is
naturally reported as `0`. Termination comes from `N / 10` strictly shrinking
`N`, not from the parity test.

| Time | Space |
| --- | --- |
| O(d), d = digits (`d <= 10`) | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches
- A conditional counter: same traversal, predicate-gated update.
- The difference between "process every digit" and "act on some digits".
- Why `0` is even, and why that single fact decides the `N = 0` answer.
- Reading a loop whose result may legitimately be `0`: no early exit needed.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
