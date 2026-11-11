# Occurrence of Digits (Does a Zero Appear?)
**Pattern:** Digit scan with a boolean flag (existence test) | **Prerequisites:** `%` and `/`, `while` loops, flags vs counters, early exit

## Problem statement

Read one integer `N` and decide whether at least one of its decimal digits is `0`. Print
`YES` if a zero occurs, otherwise `NO`.

The folder is named after the broader family "occurrence of digits in a number", but the
**active** code answers a narrower question: *does the digit `0` appear at least once?*
It uses a flag (`0`/`1`), not a counter, so it cannot report how many times a digit occurs.
The earlier digit-counting attempt is preserved as a commented block in `solution.cpp`; it
reads a target digit `D` and counts matches, but it consumes `N`, so it cannot be reused
for further questions.

## Input and output

- Input: one integer `N` (`cin >> N`). The commented variant would read `N` then `D`.
- Output: `YES` or `NO`, uppercase, no newline in the current code.

## Examples

### Example 1
```text
Input:
4027
Output:
YES
```
**Why:** the third digit scanned (right-to-left) is `0`, so the flag is set.

### Example 2
```text
Input:
5831
Output:
NO
```
**Why:** no digit is `0`; the flag stays `0` through all four iterations.

### Example 3
```text
Input:
1000
Output:
YES
```
**Why:** three zeros. A flag does not care whether there is one match or three — it only
records that at least one was seen.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:
- `N` fits in `int`, so at most 10 digits.
- `N >= 1` per the "positive integer" convention of this section.
- The digit of interest is fixed at `0`; no second input is read.

`N = 0` is out of domain: the loop never runs and the program prints `NO`, even though the
only digit of `0` is `0`. See `## Current-code review` in notes.md.

## Approach at a glance

1. `flag = 0` ("zero not seen yet").
2. While `N > 0`: `digit = N % 10`; if `digit == 0` then `flag = 1`; `N /= 10`.
3. Print `YES` if `flag == 1`, else `NO`.

An existence test needs one bit of state, not a number. The scan may stop the moment the
flag is set, because additional matches cannot change the answer.

| Time | Space |
| --- | --- |
| O(d) worst case; O(1) best case with early exit | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches

- Flag versus counter: existence is a boolean predicate; counting is an integer aggregate.
  Choosing the weaker state is simpler and cheaper.
- Early exit: a `break` (or a loop condition on the flag) turns the best case into a single
  iteration.
- The digit-of-interest can be a variable instead of a literal, which generalises the same
  loop to "does `D` occur?" and then to "how often does `D` occur?".
- Destructive scans have a cost: once `N` is consumed, follow-up questions need the digits
  stored or the number copied.
- Naming matters in a public repo: the folder says "occurence" (misspelled), while the
  authoritative word is "occurrence".

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
