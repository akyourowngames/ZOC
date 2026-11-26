# Sum of Digits
**Pattern:** extract with `% 10`, accumulate, then discard with `/ 10` | **Prerequisites:** `while`, `%`, integer division, running sum, loop termination

## Problem statement

Read a non-negative integer `N` and print the sum of its decimal digits:

```text
5072 -> 5 + 0 + 7 + 2 = 14
```

This is the first problem in the set that both *reads* a digit and *uses* it. The
digit-extraction idiom (`% 10` for the last digit, `/ 10` to remove it) becomes a
tool you will reuse in reversal, palindrome, and digit-frequency problems.

## Input and output

- Input: one non-negative integer `N`.
- Output: the sum of its decimal digits, followed by a newline.
- `N = 0` prints `0`, which is correct: the digit sum of zero is zero, and the
  empty loop is consistent with that answer.
- For negative `N` the loop is skipped and `0` is printed; the problem does not
  define that case.

## Examples

### Example 1
```text
Input:
5072
Output:
14
```
**Why:** `5 + 0 + 7 + 2 = 14`. The zero digit contributes nothing but still
consumes one iteration.

### Example 2
```text
Input:
0
Output:
0
```
**Why:** the guard `0 > 0` is false, so `sum` keeps its initial value `0`. Unlike
the digit-count problem, the answer here really is `0`, so no special case is
needed.

### Example 3
```text
Input:
2147483647
Output:
46
```
**Why:** `2+1+4+7+4+8+3+6+4+7 = 46`. Ten iterations for the largest `int`; the
result is far below `INT_MAX`, so no overflow is possible.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `0 <= N <= 2147483647`; ten digits at most.
- The maximum possible digit sum for a 32-bit signed `int` is `82`
  (`1999999999`), so `int sum` cannot overflow.
- If `N` is read as `long long` (up to 19 digits), the maximum digit sum is
  `171`, still trivial.
- Negative input is out of scope. If allowed, decide whether the sign is ignored
  (`abs(N)` first) or rejected.
- Input is a single integer; no test count, no repeated queries.

## Approach at a glance

1. Read `N`.
2. `sum = 0`.
3. While `N > 0`:
   - `sum += N % 10` — add the current last digit;
   - `N = N / 10` — drop that digit.
4. Print `sum`.

Order matters: the remainder must be taken *before* the division, because after
`N / 10` the last digit no longer exists.

| Time | Space |
| --- | --- |
| O(d) for `d` digits, i.e. O(log10 N) | O(1) |

## Solution

[`solution.cpp`](./solution.cpp)

The file also contains an earlier attempt, fully commented out, which introduced
a `temp` variable for the extracted digit. Both versions are correct; the active
one inlines `N % 10` directly.

## What this teaches

- The two-line idiom `digit = n % 10; n /= 10;` peels digits from right to left.
- Extraction and accumulation can be fused into one expression, but keeping the
  digit in a named variable often reads better.
- The order of `%` and `/` is semantic: you cannot recover a digit you already
  divided away.
- A `while (N > 0)` guard is acceptable here because the answer for `0` is `0`,
  whereas in digit *counting* the same guard produces a wrong answer.
- Digit sums have a hard upper bound (`9 * d`), so overflow analysis is easy.

## Checklist

- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
