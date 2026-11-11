# Deep Notes

## Core logic

The program answers three questions about one integer `N`. Each is a scan over
candidate divisors, so the whole problem is about how to enumerate divisors
cheaply and how to phrase Yes/No answers.

- Primality: `N` is prime iff no integer in `[2, sqrt(N)]` divides it and
  `N >= 2`.
- Divisor count: divisors pair as `(k, N/k)`, with one member of each pair at
  most `sqrt(N)`.
- Perfection: `N` is perfect iff the sum of its proper divisors is `N`, i.e.
  `sigma(N) = 2N`.

Two mathematical details drive all edge cases.

1. `1` has one divisor, so it cannot satisfy "exactly two divisors".
2. A perfect square has a divisor pair with two equal members, so it must be
   counted once. `36` is the standard test: `d(36) = 9`, not `10`.

## Code walkthrough

`isPrime` (lines 4-11) loops `i = 2 .. n-1` and returns `false` on the first
divisor. It has no `n < 2` guard, so for `n = 0`, `n = 1`, and every negative
`n`, the loop body never runs and the function returns `true`. Verified:
`N = 0 -> true`, `N = 1 -> true`, `N = -7 -> true`. The loop bound is also
`O(N)` in the worst case (a prime), instead of `O(sqrt N)`.

`countDivisiors` (lines 13-21) counts divisors from `1` to `n` inclusive. It is
correct for `n >= 1`: `d(36) = 9`, `d(100) = 9`, `d(10^8) = 81` (since
`10^8 = 2^8 * 5^8`, so `(8+1)(8+1) = 81`). For `n = 0` or negative `n` the loop
does not run and it returns `0`, which is a silent domain error. The name is
misspelled (`Divisiors`), consistently in the definition and the call, so it
compiles.

`isPerfect` (lines 23-31) sums *all* divisors including `n`, then tests
`sum - n == n`. For `n >= 2` this is equivalent to `sigma(n) - n == n` and is
correct. For `n = 1` it gives `1 - 1 = 0 != 1` (correctly not perfect). For
`n = 0` it gives `0 - 0 == 0` (wrongly perfect). It is never called from
`main`.

`main` (lines 33-52) reads `N`, prints `isPrime(N)` as `true`/`false`, prints
`countDivisiors(N)`, then prints `true` when `countDivisiors(N)` is non-zero.
That last test is the defect: it asks "does `N` have any divisor?", which is
true for every positive `N`. The function is also called twice, so the `O(N)`
scan is paid twice.

Observed outputs (MSVC build, no optimization flags):

| `N` | Observed |
|---:|---|
| `0` | `true 0 false` |
| `1` | `true 1 true` |
| `2` | `true 2 true` |
| `6` | `false 4 true` |
| `7` | `true 2 true` |
| `12` | `false 6 true` |
| `28` | `false 6 true` |
| `36` | `false 9 true` |
| `100` | `false 9 true` |

## Why it works (correctness)

**Primality.** For `N >= 2`, if `N` is composite then `N = a*b` with
`2 <= a <= b <= N/2`. Then `a <= sqrt(N)`, so a divisor is found by scanning
`[2, sqrt(N)]`. Conversely, any found divisor proves compositeness. With the
missing `n < 2` guard, `0` and `1` are misclassified, so the implementation is
correct only for `N >= 2`; the fix is `if (n < 2) return false;`.

**Divisor count.** The map `k -> N/k` is an involution on divisors: applying it
twice returns `k`, and `k * (N/k) = N`. Hence divisors form pairs. For
`k < sqrt(N)` the partner is larger; for `k = sqrt(N)` the partner is `k`.
The committed loop visits all `k` from `1` to `N`, counting each divisor
exactly once, so it is correct for `N >= 1`. The optimized loop visits only
`k <= sqrt(N)` and adds two per pair (one for a square), which is the same
count by the pairing bijection.

**Perfection.** `sigma(N)` is the sum of all positive divisors. Subtracting
`N` removes the only improper positive divisor, leaving the proper-divisor
sum. So `sigma(N) - N == N` iff `N` is perfect, for `N >= 2`. The `N = 0` case
is outside the definition (every positive integer divides `0`), so the guard
`n < 2` is required, not cosmetic.

## Complexity

| Version | Prime | Divisor count | Perfect | Total |
|---|---|---|---|---|
| Committed | `O(N)` | `O(N)` | `O(N)` | `O(N)`, with the count run twice |
| Contest | `O(sqrt N)` | `O(sqrt N)` | `O(sqrt N)` | `O(sqrt N)` |

Space is `O(1)` in both versions.

Measured on the author's machine with MSVC defaults: `N = 10^8` took `1.87 s`
(two divisor scans; the prime check exits at `i = 2`), so `N = 10^9` is about
`19 s`, and a prime near `10^9 + 7` about `28 s` because the prime check adds
one more full scan. The optimized version needs `31622` iterations at `10^9`,
well under a millisecond.

Under common 1-3 second limits, the committed code passes up to roughly `10^8`
only when the limit is generous; at `10^9` it fails. The `O(sqrt N)` version
passes `10^9` comfortably and still works at `10^12` (one million iterations).

## Edge cases and tests

| Input | Expected (intended) | Observed (current) | Reason |
|---:|---|---|---|
| `0` | outside domain | `true 0 false` | prime loop does not run; no divisors |
| `1` | `false 1 false` | `true 1 true` | `1` is not prime; not perfect |
| `2` | `true 2 false` | `true 2 true` | smallest prime; proper sum `1` |
| `3` | `true 2 false` | `true 2 true` | prime |
| `4` | `false 3 false` | `false 3 true` | square; `1+2 != 4` |
| `6` | `false 4 true` | `false 4 true` | first perfect number |
| `12` | `false 6 false` | `false 6 true` | abundant, not perfect |
| `28` | `false 6 true` | `false 6 true` | second perfect number |
| `36` | `false 9 false` | `false 9 true` | square; nine divisors |
| `97` | `true 2 false` | `true 2 true` | prime |
| `10^8` | `false 81 false` | `false 81 true` | `2^8 * 5^8`, 81 divisors |
| `-7` | outside domain | `true 0 false` | loops skip negatives |

`496` and `8128` are the next perfect numbers and are useful as extra tests;
`isPerfect` should return `true` for both.

## Common mistakes

- Forgetting `n < 2` in `isPrime`, which marks `0`, `1`, and negatives prime.
- Using a divisor count as a boolean for perfection.
- Double-counting the square root when pairing divisors.
- Including `N` in the proper-divisor sum (or including `1`'s partner `N`).
- Using `i * i <= n` and overflowing for `n` near `INT_MAX`; prefer
  `i <= n / i`.
- Assuming `sigma(N)` fits in `int`; for `N` near `10^9` it can exceed
  `2^31 - 1`.
- Treating `0` as a valid input and letting `isPerfect(0)` return `true`.
- Printing labels or capitalized tokens.
- Testing only `6` and `28`, where the current bug accidentally produces the
  intended answer.

## Variants and follow-ups

- **Divisor count by factorization.** Factor `N = p1^e1 * ... * pk^ek`; then
  `d(N) = (e1+1) * ... * (ek+1)`. This is `O(sqrt N)` with a smaller constant
  for repeated queries and generalizes to `sigma`.
- **Many queries.** Precompute smallest prime factors or a divisor-count sieve
  up to the maximum `N`, then answer each query in `O(log N)` or from a table.
- **Sum of divisors.** Pairing gives `sigma` in `O(sqrt N)`; for large `N`,
  factorization plus the geometric-series formula is faster when the
  factorization is known.
- **Perfect numbers.** All known perfect numbers are even and have the
  Euclid-Euler form `2^(p-1) * (2^p - 1)` with `2^p - 1` prime. Whether an odd
  perfect number exists is open; do not encode "all perfect numbers are even"
  as a proven fact in a solution.
- **Classification.** Compare `sigma(N)` with `2N` to label `N` deficient,
  perfect, or abundant. `12` is abundant (`sigma = 28 > 24`).

## Key takeaways

- Pairing divisors is the default way to turn a linear scan into a square-root
  scan; always handle the square case.
- Definitions carry their own edge cases: `1` is special for primality, `0` is
  special for perfection.
- A count and a boolean are different types of answer. Reading the required
  output order is part of solving the problem.
- Measure before optimizing, but recognize `O(N)` scans at `N = 10^9` as
  automatic failures under contest limits.

## Current-code review

1. **Wrong third answer (lines 45-49).** `if (countDivisiors(N))` prints
   `true` for every `N > 0` and `false` for `0`/negatives. It should test
   `isPerfect(N)`: `if (isPerfect(N))`. This is the primary bug; it makes the
   third token independent of whether `N` is perfect.
2. **Missing prime guard (lines 4-11).** `isPrime` returns `true` for `0`, `1`,
   and negative input because the loop never executes. Add
   `if (n < 2) return false;` before the loop.
3. **Misspelled identifier (lines 13, 43, 45).** `countDivisiors` should be
   `countDivisors`. It compiles because the definition and both calls agree,
   but it is inconsistent with the sibling folder and hurts searchability.
4. **Duplicate `O(N)` call (lines 43 and 45).** The divisor count is computed
   twice. Store it once, e.g. `int divisors = countDivisors(N);`, then print
   and compare the stored value.
5. **Linear loops (lines 5, 15, 25).** All three checks scan to `N`. Replace
   with `i <= n / i` pairing; this is required for `N` near `10^9`.
6. **Unsafe `isPerfect` for `0` (lines 23-31).** After fixing item 1,
   `N = 0` would print `true` because `0 - 0 == 0`. Add the same `n < 2`
   guard, or define the input domain as `N >= 1`.
7. **`int` accumulation in `isPerfect` (line 27).** `sum` can exceed
   `INT_MAX` for large `N`; use `long long`.
8. **No trailing newline (line 49).** `cout << "true";` ends the output without
   `\n`. Most judges accept this, but adding `<< "\n"` is safer and matches
   normal conventions.
9. **No input validation (line 35).** If extraction fails, `N` keeps an
   indeterminate/zero value and the program still prints three tokens. Not
   required for a judge, but worth knowing when testing manually.

No `.cpp` file was modified; this review is descriptive. The minimal repair
for the graded output is item 1; items 2 and 6 are needed for a correct
implementation at the boundaries, and item 5 is needed for contest limits.
