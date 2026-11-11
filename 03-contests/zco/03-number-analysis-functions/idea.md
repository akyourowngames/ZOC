# How to Think About It

## 1. Restate and formalize

Given `N`, compute three predicates/quantities:

| Name | Definition | Type |
|---|---|---|
| `prime` | `N >= 2` and no `k` in `[2, N-1]` divides `N` | boolean |
| `divisors` | number of `k` in `[1, N]` that divide `N` | integer |
| `perfect` | sum of proper positive divisors of `N` equals `N` | boolean |

Target output (strict judge): one line, three tokens,
`<prime> <divisors> <perfect>`, for example `false 4 true` for `N = 6`.

The refactor target is structural: three pure functions plus one presentation
function. "Pure" here means the function returns a value and does not print;
printing is confined to `analyzeNumber`/`main`. That is what makes the checks
independently testable.

## 2. Start from brute force

Per definition, each helper can be a loop over `1..N`:

```text
isPrime(n):
    for k = 2 .. n-1:
        if n % k == 0: return false
    return true
countDivisors(n):
    count = 0
    for k = 1 .. n:
        if n % k == 0: count++
    return count
isPerfect(n):
    sum = 0
    for k = 1 .. n:
        if n % k == 0: sum += k
    return sum - n == n
```

This is the shape of the committed code, plus
`if (n < 2) return false;`. That guard is necessary because the loop range is
empty for `n = 0` and `n = 1`, and an empty loop falls through to `true`.
The brute force is correct and `O(N)` per call, so it is a reference, not a
contest solution at `N = 10^9`.

## 3. Derive the optimization

### Primality

If `N = a*b` is composite with `1 < a <= b`, then `a <= sqrt(N)`. Testing
`k = 2 .. floor(sqrt(N))` is therefore sufficient, and the first divisor
allows an early exit. Use `k <= n / k` to avoid `k*k` overflow.

### Divisor count

Divisors pair as `(k, N/k)`, one member `<= sqrt(N)`. Scan `k <= sqrt(N)`,
add `2` for a pair and `1` when `k == N/k`. `d(36) = 9` because the pair
`(6,6)` counts once.

### Perfection

Sum proper divisors during the same scan: add `1` alone at `k = 1` (its partner
is `N`, which is improper), and add `k` plus `N/k` for `k >= 2` when they are
distinct. For a square, add the root once. Compare with `N`.

Alternatively, compute `sigma(N)` including `N` and test `sigma - N == N`,
which is what the committed `isPerfect` does. The alternative has one extra
special case: `N = 0` yields `0 - 0 == 0`, a false positive, so it needs
`N >= 2`.

### Presentation

Move all `cout` calls out of the checks. `analyzeNumber` should either print
the three tokens itself or return a small struct that `main` prints. The
committed version prints labels; a strict judge rejects them.

The current code also scans `1..N` for the divisor count and again for the
proper-divisor sum. One sqrt scan can produce both values, a constant-factor
win on top of the important `O(N) -> O(sqrt N)` gain.

## 4. Correctness sketch

**`isPrime`.** If `N < 2`, return `false`, matching the definition (no primes
below 2). For `N >= 2`, the loop tests every `k` with `2 <= k <= sqrt(N)`.
If one divides `N`, `N` is composite. If none does, suppose `N = a*b` with
`2 <= a <= b`; then `a <= sqrt(N)`, contradiction. So `N` is prime.

**`countDivisors`.** The pairing map is a bijection on divisors. Each
non-square pair contributes two distinct divisors found within the scan; the
square pair contributes one. No divisor is missed because every divisor has a
partner at most `sqrt(N)`. So the count is exact.

**`isPerfect`.** `sigma(N)` includes every positive divisor once, including
`N`. Subtracting `N` gives the proper-divisor sum. The equality test is
therefore the definition of a perfect number for `N >= 2`. For `N = 1` the
test is `1 - 1 == 1`, i.e. `false`, which is correct; for `N = 0` the test is
`0 == 0`, which is incorrect, hence the domain restriction.

**`analyzeNumber`.** It calls the three functions on the same `N` and prints
their results in the required order. Correctness reduces to the helpers plus
the output format.

## 5. Dry run

Trace `N = 28` through the current functions. `isPrime(28)` divides by `2`
immediately and returns `false`.

`countDivisors(28)` (brute force, `k = 1..28`):

| Divisor found | Running count |
|---:|---:|
| 1 | 1 |
| 2 | 2 |
| 4 | 3 |
| 7 | 4 |
| 14 | 5 |
| 28 | 6 |

`isPerfect(28)`:

| Divisor | Running sum |
|---:|---:|
| 1 | 1 |
| 2 | 3 |
| 4 | 7 |
| 7 | 14 |
| 14 | 28 |
| 28 | 56 |

`sum - n == n` is `56 - 28 == 28`, i.e. `true`.

Output (current layout):

```text
Prime: false
Divisors: 6
Perfect: true
```

Target layout: `false 6 true`.

Optimized dry run for `countDivisors(28)` with pairing. The loop bound is
`k * k <= 28`, i.e. `k <= 5`:

| `k` | Divides? | Partner | Add |
|---:|---|---:|---:|
| 1 | yes | 28 | 2 |
| 2 | yes | 14 | 2 |
| 3 | no | - | 0 |
| 4 | yes | 7 | 2 |
| 5 | no | - | 0 |

Total `6`, same answer in five iterations instead of twenty-eight.

## Progressive hints

1. Write the three checks as separate functions that return values and never
   print; test them with a temporary `main`.
2. Ask what `isPrime` returns when the loop body never executes. That is the
   `0`/`1` bug.
3. For `n >= 2`, if `k` divides `n`, then `n/k` does too. Only one of them can
   be below `sqrt(n)`.
4. For perfection, the partner of `1` is `n`, which must not be added.
5. Count a square root once: `add = (k == n/k) ? 1 : 2`.
6. Decide the output layout before writing `analyzeNumber`; labels are content.

## Traps

- Omitting `if (n < 2) return false;` and relying on the loop.
- Using `sum - n == n` without excluding `n = 0`.
- Adding `n` as a proper divisor (i.e. returning `sigma == 2n` without
  subtracting).
- Double-counting the square root.
- Printing `Prime:`/`Divisors:`/`Perfect:` when the judge expects tokens.
- Mixing computation and I/O so that a function cannot be reused or tested.
- Leaving `int sum;` uninitialized; it happens to be assigned immediately, but
  the code is fragile under editing.
- Overflowing `int` in `sigma` for large `N`.
- Using `for (i = 2; i < n; i++)` at `N = 10^9`: correct but far too slow.
- Assuming the optimized divisor count is needed only for the count; the same
  loop should feed `isPerfect`.

## Self-check

1. What does the current `isPrime(1)` return, and why?
   `false`, because of the explicit `n < 2` guard added in this version.
2. What would it return without the guard?
   `true`, since `for (i = 2; i < 1; i++)` never runs.
3. Why is `isPerfect(0)` `true` in the current code?
   The loop adds nothing, `sum` stays `0`, and `0 - 0 == 0`.
4. How many divisors does `36` have, and which pair is special?
   Nine; `(6,6)` is the square pair and counts once.
5. Why do labels fail a judge?
   Output is compared token by token; `Prime:` has no counterpart.
6. Which function should own `cout`, and which helper dominates at a large
   prime?
   `analyzeNumber` (or `main`); `isPrime` dominates because it scans to `N`
   without finding a divisor.
