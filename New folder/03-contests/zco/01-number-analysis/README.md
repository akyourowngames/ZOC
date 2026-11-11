# Number Analysis

**Pattern:** Trial division, sqrt divisor pairing, number classification | **Difficulty:** Easy

## Problem statement

Read one integer `N` and print three answers on a single line, separated by single
spaces:

1. `true` if `N` is prime, otherwise `false`;
2. the number of positive divisors of `N`, counting both `1` and `N`;
3. `true` if `N` is perfect, otherwise `false`.

For `N >= 1` the terms are defined as follows.

- `N` is prime when its only positive divisors are `1` and `N`.
- The divisor count is `d(N) = |{ k : 1 <= k <= N and k divides N }|`.
- `N` is perfect when the sum of its proper divisors equals `N`, that is
  `sigma(N) - N = N`, where `sigma(N)` is the sum of all positive divisors.

For example, `6` has proper divisors `1, 2, 3`, whose sum is `6`, so `6` is
perfect. The intended output for `N = 6` is `false 4 true`.

> The committed program does not print the perfect-number answer. Its third
> token is the truthiness of the divisor count, which is `true` for every
> `N > 0`. The intended contract is the one above; the exact defect and the
> one-line repair are in `notes.md`. No `.cpp` file is changed by these docs.

## Input and output

| Item | Format |
|---|---|
| Input | one line containing a single decimal integer `N` |
| Output | one line: `<prime> <divisorCount> <perfect>` |

- `<prime>` and `<perfect>` are lowercase `true` / `false`; judges are usually
  case-sensitive.
- `<divisorCount>` is a plain decimal integer with no padding.
- Tokens are separated by exactly one space; a trailing newline is safe.
- No labels, prompts, or extra lines. Anything beyond the three tokens is a
  presentation bug even when the arithmetic is right.

## Examples

Intended output versus what the current binary actually prints:

| `N` | Reasoning | Intended | Current |
|---:|---|---|---|
| `1` | one divisor; not prime; proper-divisor sum `0 != 1` | `false 1 false` | `true 1 true` |
| `2` | prime; divisors `1,2`; `1 != 2` | `true 2 false` | `true 2 true` |
| `6` | divisors `1,2,3,6`; `1+2+3 = 6` | `false 4 true` | `false 4 true` |
| `7` | prime; divisors `1,7`; `1 != 7` | `true 2 false` | `true 2 true` |
| `12` | divisors `1,2,3,4,6,12`; proper sum `16` | `false 6 false` | `false 6 true` |
| `28` | `1+2+4+7+14 = 28` | `false 6 true` | `false 6 true` |
| `36` | perfect square; `d(36) = 9`; proper sum `55` | `false 9 false` | `false 9 true` |
| `97` | prime | `true 2 false` | `true 2 true` |
| `100` | `1,2,4,5,10,20,25,50,100` | `false 9 false` | `false 9 true` |

The current output coincides with the intended one only when `N` happens to be
perfect (`6`, `28`, `496`, `8128`, ...) or is `0`/negative. That is exactly why
a few hand tests can hide the bug.

## Constraints and assumptions

Practice constraints (not specified by a judge):

- `1 <= N <= 10^9`, one test case, decimal input.
- `N` fits in a 32-bit signed `int`; the current code assumes this.
- If the practice range is raised to `10^12`, `N` and the divisor sums need
  `long long`.

The original task statement is not in the repository, so these bounds are
assumptions for analysis, not quoted judge limits. The algorithm discussion
covers both the `O(N)` code as written and the `O(sqrt N)` contest version.

## Approach at a glance

The three answers are independent and each is a small number-theory query.

- Primality: test divisors from `2` up to `sqrt(N)`; stop at the first divisor.
  Treat `N < 2` as not prime.
- Divisor count: every divisor `i <= sqrt(N)` pairs with `N / i`. Count both,
  and count the square root once when `N` is a perfect square.
- Perfection: sum the proper divisors with the same pairing, excluding `N`
  itself, then compare with `N`.

`O(sqrt N)` per query is the standard contest target. The committed code scans
all of `1..N` three times (twice for the divisor count alone), which is the
main scalability defect.

| Time | Space |
|---|---|
| `O(N)` with the current loops (three passes, one of them duplicated) | `O(1)` |
| `O(sqrt N)` with divisor pairing and early exit | `O(1)` |

## Solution

[`solution.cpp`](./solution.cpp)

The file compiles and runs. It contains correct helper functions plus a
mis-wired `main`; see `notes.md` for the line-by-line review.

## What this teaches

- Definitions decide edge cases: `1` has exactly one divisor, so it cannot be
  prime; `0` is not in the positive-integer domain of these checks.
- Divisor pairing converts an `O(N)` scan into `O(sqrt N)` and forces you to
  handle perfect squares explicitly.
- Perfect numbers are about *proper* divisors; including `N` and then
  subtracting it is one valid implementation, but it must not leak into `0`.
- A helper that returns a count is not a boolean predicate. `if (count)` asks
  "are there any divisors?", not "is the number perfect?".
- Output format is part of the specification. Lowercase tokens, ordering, and
  separators are graded.

## Contest checklist

- [ ] Read exactly one integer; do not print a prompt.
- [ ] Reproduce the sample byte-for-byte (including token order).
- [ ] Handle `N = 1` and `N = 2` before trusting any prime loop.
- [ ] Use `i <= n / i` (or `1LL * i * i <= n`) instead of `i * i <= n` for
      large `N` to avoid signed overflow.
- [ ] Count a perfect-square divisor once.
- [ ] Sum proper divisors only; do not add `N` twice.
- [ ] Use `long long` for divisor sums when `N` is large.
- [ ] Test a perfect number, a perfect square, a prime, and a composite with
      many divisors.
- [ ] Remove labels and debug prints.
- [ ] End the output with a newline and return `0`.
