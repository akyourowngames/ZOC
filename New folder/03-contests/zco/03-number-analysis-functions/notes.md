# Deep Notes

## Core logic

The folder is the "functions" variant of the same three checks: `isPrime`
rejects `n < 2` and tests divisors, `countDivisors` counts divisors, and
`isPerfect` implements `sigma(n) - n == n`. The structural goal is separation
of concerns: each rule is a function with one return value, and
`analyzeNumber` is the only place that prints. The current code has that
structure but uses a labelled output, and all three loops are linear. Its
`if (n < 2) return false;` guard (line 5) is the fix that folder 01 lacks.

## Code walkthrough

`isPrime` (lines 4-13): guard, then `for (i = 2; i < n; i++)` returning
`false` on the first divisor, otherwise `true`. Correct for all `int` inputs:
`0`, `1`, and negatives are rejected by the guard; `2` skips the loop and
returns `true`; `4` returns `false` at `i = 2`. Complexity is `O(n)` for a
prime, because the loop bound is `n`, not `sqrt(n)`.

`countDivisors` (lines 15-23): counts `i` in `[1, n]` with `n % i == 0`.
Correct for `n >= 1`; returns `0` for `n = 0` and negatives because the loop
does not run. `O(n)`.

`isPerfect` (lines 25-36): declares `int sum;` (line 26), assigns `sum = 0;`
(line 28), sums every divisor in `[1, n]`, and returns `sum - n == n`. For
`n >= 2` this is exactly the proper-divisor test: `sum` is `sigma(n)`, and
subtracting `n` removes the only improper divisor. Examples: `6 -> 6`,
`28 -> 28`, `12 -> 16 != 12`, `36 -> 55 != 36`. For `n = 0` it returns `true`
incorrectly. `O(n)`.

`analyzeNumber` (lines 38-42): prints three labelled lines:

```text
Prime: <true|false>
Divisors: <count>
Perfect: <true|false>
```

The last line has no trailing newline. The function returns `void`, so the
results cannot be reused or tested without capturing stdout.

`main` (lines 44-50): reads `N` and calls `analyzeNumber(N)`. No prompts, no
validation.

Observed outputs:

| `N` | Observed |
|---:|---|
| `0` | `Prime: false`, `Divisors: 0`, `Perfect: true` |
| `1` | `Prime: false`, `Divisors: 1`, `Perfect: false` |
| `2` | `Prime: true`, `Divisors: 2`, `Perfect: false` |
| `6` | `Prime: false`, `Divisors: 4`, `Perfect: true` |
| `12` | `Prime: false`, `Divisors: 6`, `Perfect: false` |
| `28` | `Prime: false`, `Divisors: 6`, `Perfect: true` |

## Why it works (correctness)

**Prime guard.** For `n < 2` the answer is `false` by definition; the guard
implements this directly, so no reliance on loop behavior at the boundary.

**Prime loop.** For `n >= 2`, if a divisor `i` exists with `2 <= i < n`, then
`n` is composite. If none exists, `n` has no divisor other than `1` and `n`,
so it is prime. The loop is exhaustive over the relevant range (all divisors
above `sqrt(n)` pair with one below it), so the result is correct even though
the loop is longer than necessary.

**Divisor count.** Scanning all `i` in `[1, n]` counts each positive divisor
exactly once, which is the definition of `d(n)` for `n >= 1`.

**Perfection.** `sum` is `sigma(n)`. Since `n` divides itself, `sum - n` is the
sum over divisors strictly less than `n`, i.e. the proper-divisor sum. The
test `sum - n == n` is therefore exact for `n >= 2`. It fails at `n = 0`
because the empty sum is `0` and the equation degenerates to `0 == 0`; the
domain must be restricted or guarded.

**Output.** The three printed values are in the same order as the three
questions: prime, divisor count, perfect. The labels are extra content; if the
judge expects only values, the program's output is not equal to the expected
output even though every number is right.

## Complexity

| Helper | Current | Target |
|---|---|---|
| `isPrime` | `O(n)` (worst case: prime) | `O(sqrt n)` |
| `countDivisors` | `O(n)` | `O(sqrt n)` |
| `isPerfect` | `O(n)` | `O(sqrt n)` |
| `analyzeNumber` | `O(n)`, three scans | `O(sqrt n)` |
| Space | `O(1)` | `O(1)` |

Measured with MSVC defaults: `N = 10^8` (even) took `3.03 s` (two full divisor
scans; `isPrime` exits at `i = 2`), a prime near `10^8` about `4.5 s`, and
`N = 10^9` about `30 s` (even) or `45 s` (prime) by extrapolation. Under a 1-2
second limit this passes only up to a few times `10^7`. The
`O(sqrt n)` version performs at most `31623` iterations per helper at
`N = 10^9` and is effectively instant. For `N` up to `10^12`, the sqrt loops
need `10^6` iterations and `long long` arithmetic.

## Edge cases and tests

| Input | Target | Current | Reason |
|---:|---|---|---|
| `0` | out of domain | `Prime: false`, `Divisors: 0`, `Perfect: true` | no divisors; `0 - 0 == 0` false positive |
| `1` | `false 1 false` | `Prime: false`, `Divisors: 1`, `Perfect: false` | one divisor; proper sum `0` |
| `2` | `true 2 false` | `Prime: true`, `Divisors: 2`, `Perfect: false` | smallest prime; loop empty |
| `3` | `true 2 false` | matches | prime |
| `4` | `false 3 false` | matches | square; proper sum `3` |
| `6` | `false 4 true` | matches (labels aside) | first perfect number |
| `12` | `false 6 false` | matches | proper sum `16` |
| `28` | `false 6 true` | matches | second perfect number |
| `36` | `false 9 false` | matches | square; nine divisors |
| `97` | `true 2 false` | matches | prime |
| `10^9` | `false 100 false` | too slow to run | `2^9 * 5^9`, `d = 100` |
| `-5` | out of domain | `Prime: false`, `Divisors: 0`, `Perfect: false` | loops skip negatives |

`10^9 = 2^9 * 5^9`, so `d(10^9) = (9+1)(9+1) = 100`; `sigma(10^9) =
2,497,558,338`, which does not fit in `int`.

## Common mistakes

- Printing labels or extra whitespace when the judge compares tokens.
- Trusting `isPrime` without the `n < 2` guard (the folder 01 bug).
- Forgetting the perfect-square correction in a sqrt divisor count.
- Including `n` in the proper-divisor sum, or subtracting it twice.
- Letting `isPerfect(0)` return `true`.
- Accumulating `sigma` in `int`; it exceeds `2^31 - 1` for many `n` near `10^9`.
- Leaving `sum` uninitialized; the current order assigns before use, but a later
  edit can break that.
- Keeping `O(n)` divisor loops when the intended range is `10^9`.
- Computing divisors twice in two helpers when one sqrt scan can produce both
  the count and the sum.
- Mixing `cout` into computational helpers, which prevents direct unit tests.

## Variants and follow-ups

- **Single shared scan.** One function can compute `(count, sigma)` in
  `O(sqrt n)`; both classifications then follow. This is the natural refactor.
- **Return a struct.** `struct Analysis { bool prime; int divisors; bool
  perfect; };` lets `main` own all formatting, and tests can call the analysis
  without capturing stdout.
- **Precomputation for many queries.** A smallest-prime-factor sieve plus
  factorization answers each query in `O(log n)`; a divisor-count sieve answers
  all queries up to `M` in `O(M log M)`.
- **Perfect-number characterization.** Even perfect numbers are exactly
  `2^(p-1)(2^p - 1)` with `2^p - 1` prime (Euclid-Euler). This is a theorem to
  know, not an algorithmic shortcut for testing a given `n`.

## Key takeaways

- A correct `n < 2` guard is a one-line fix for an entire class of boundary
  bugs.
- `sum - n == n` is a valid perfection test only on the positive domain.
- Functions that return values are testable; functions that print are not.
- Labels are data. Competitive output is exact text, not a report for humans.
- `O(N)` arithmetic at `N = 10^9` is a timeout, regardless of how clean the
  code structure is.

## Current-code review

1. **Labels in the output (lines 39-41).** `Prime: `, `Divisors: `, and
   `Perfect: ` are extra tokens. A strict judge expects
   `<prime> <divisors> <perfect>` on one line (as in folder 01). Remove the
   labels and the line breaks, or confirm the original statement explicitly
   requires them.
2. **No trailing newline (line 41).** The last `cout` ends with the boolean, not
   `endl`/`"\n"`. Cosmetic for most judges, but inconsistent with the other two
   lines.
3. **Linear prime test (line 7).** `i < n` should be `i <= n / i` (or
   `1LL * i * i <= n`). For a prime near `10^9`, this is a timeout.
4. **Linear divisor count (line 17).** `i <= n` should stop at `sqrt(n)` with
   pairing; the current loop is `O(n)`.
5. **Linear proper-divisor sum (line 30).** Same issue; the sqrt pairing should
   exclude `n` and count a square root once.
6. **`isPerfect(0)` is `true` (lines 25-36).** With `N = 0` the loop adds
   nothing and `0 - 0 == 0`, so the program really prints `Perfect: true` for
   `N = 0`. Add `if (n < 2) return false;`, or state the domain.
7. **`int sum` overflow (line 26).** `sigma(n)` can exceed `INT_MAX` (for
   `n = 10^9` it is `2,497,558,338`). Use `long long` for `sum` in any
   submission whose upper bound is large.
8. **Uninitialized declaration (line 26).** `int sum;` followed immediately by
   `sum = 0;` is not a bug (no read occurs before the write), but it is fragile.
   Initialize at the declaration: `long long sum = 0;`.
9. **Computation mixed with I/O (lines 38-42).** `analyzeNumber` both computes
   and prints, returns `void`, and hard-codes the format. Returning a struct or
   the three values would make the helpers testable and the format a `main`
   concern.
10. **Silent domain handling for `0` and negatives (lines 15-23, 25-36).**
    `countDivisors` returns `0` and `isPerfect` returns `true` for `0`; both are
    meaningless outside `n >= 1`. A guard at the top of each helper (or in
    `analyzeNumber`) documents and enforces the domain.
11. **No input validation (line 47).** A failed extraction leaves `N` at `0`
    (C++11 and later), producing the `N = 0` analysis rather than an error. Not
    a judge concern with well-formed input, but worth noting.

Positive points worth preserving: `isPrime` has the correct `n < 2` guard, the
third value really is `isPerfect(N)` (unlike folder 01), and each rule is in a
named function. No `.cpp` file was modified; this review is descriptive.
