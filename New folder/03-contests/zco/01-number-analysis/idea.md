# How to Think About It

## 1. Restate and formalize

We are given one integer `N` and must answer three independent questions:

| Symbol | Meaning |
|---|---|
| `Prime(N)` | `N >= 2` and no `k` with `2 <= k < N` divides `N` |
| `d(N)` | number of `k` in `[1, N]` with `N % k == 0` |
| `Perfect(N)` | sum of the proper divisors of `N` equals `N` |

If `sigma(N)` is the sum over *all* positive divisors, then
`Perfect(N)` is equivalent to `sigma(N) - N == N`, i.e. `sigma(N) == 2N`.

Output is one line, three tokens: `Prime(N)`, `d(N)`, `Perfect(N)`.

Two facts are worth writing down before coding:

1. `1` is not prime, and neither is `0`. A prime needs exactly two distinct
   positive divisors.
2. `6` and `28` are perfect; `1` is not, because its "proper divisor sum" is
   `0`, not `1`.

## 2. Start from brute force

The straightforward translation of the definitions:

```text
prime = true
for k = 2 .. N-1:
    if N % k == 0: prime = false

divisors = 0
for k = 1 .. N:
    if N % k == 0: divisors = divisors + 1

sigma = 0
for k = 1 .. N:
    if N % k == 0: sigma = sigma + k
perfect = (sigma - N == N)
```

This is correct for `N >= 2` and needs roughly `3N` divisions. The committed
solution resembles this shape, except that `main` prints `divisors` where
`perfect` belongs. The brute force also shows the structure: all three checks
are scans over the same set of candidate divisors `1..N`. That observation is
the key to the optimization.

## 3. Derive the optimization

### Primality

If `N` is composite, write `N = a * b` with `1 < a <= b < N`. Then
`a <= sqrt(N)`. So checking `k = 2 .. floor(sqrt(N))` is enough; if no `k`
divides `N`, `N` is prime. Stop at the first divisor found.

```text
isPrime(n):
    if n < 2: return false
    for k = 2; k <= n / k; k++:
        if n % k == 0: return false
    return true
```

`k <= n / k` is division-only and cannot overflow, unlike `k * k <= n` when
`n` is close to `INT_MAX`.

### Divisor count

Divisors pair: if `k | N`, then `N / k` is also a divisor, and exactly one of
the pair is `<= sqrt(N)` unless `k = N / k`. So scan `k = 1 .. floor(sqrt(N))`
and add:

- `2` when `N % k == 0` and `k != N / k`;
- `1` when `k == N / k` (the perfect-square case).

Example: `N = 36`, `sqrt(36) = 6`.
Pairs `(1,36), (2,18), (3,12), (4,9)` give `8` divisors, and `k = 6` adds the
single divisor `6`, for `d(36) = 9`.

### Perfect number

Use the same pairing on proper divisors. Start `sum = 0`, then for
`k = 1 .. floor(sqrt(N))`:

- if `k == 1`: add only `1` (never add `N`, which is the partner of `1`);
- otherwise if `k | N`: add `k`, and add `N / k` only when `N / k != k` and
  `N / k != N` (the last condition never triggers for `k >= 2`).

Then `Perfect(N) = (sum == N)` for `N >= 2`. For `N = 28`:
`1 + (2 + 14) + (4 + 7) = 28`. For `N = 36`:
`1 + (2 + 18) + (3 + 12) + (4 + 9) + 6 = 55 != 36`.

Simpler and safer: compute `sigma(N)` including `N`, then test
`sigma - N == N`; this mirrors the committed `isPerfect` and avoids special
cases for `N / k == N`, but `N = 0` must be rejected separately.

## 4. Correctness sketch

**Lemma 1 (pairing).** For `N >= 1`, the map `k -> N/k` is a bijection on the
positive divisors of `N`, and `k * (N/k) = N`. Exactly one element of each pair
is `<= sqrt(N)`; both are equal only when `N = k^2`.

**Theorem (divisor count).** The loop over `k <= sqrt(N)` visits every divisor
`<= sqrt(N)` once. It adds `2` for every non-square pair and `1` for the square
case, so the total equals `d(N)`, with no double counting.

**Theorem (primality).** If `N >= 2` is composite, it has a divisor in
`[2, sqrt(N)]` by Lemma 1, and the loop finds it. If the loop finds a divisor,
`N` has a divisor other than `1` and itself, so `N` is composite. The guard
`n < 2` makes `0` and `1` non-prime, as required.

**Theorem (perfection).** The paired sum accumulates every proper divisor
exactly once: `1` is added once, and every other pair `(k, N/k)` contributes
its two distinct members. Therefore `sum` is the proper-divisor sum, and the
comparison `sum == N` is exactly the definition.

## 5. Dry run

Intended `O(sqrt N)` algorithm on `N = 36`.

**Prime check.** `k = 2`: `36 % 2 == 0`, return `false` immediately.

**Divisor count** (`k <= 36 / k`, so `k <= 6`):

| `k` | `36 % k` | Partner | Add | Running count |
|---:|---:|---:|---:|---:|
| 1 | 0 | 36 | 2 | 2 |
| 2 | 0 | 18 | 2 | 4 |
| 3 | 0 | 12 | 2 | 6 |
| 4 | 0 | 9 | 2 | 8 |
| 5 | 1 | - | 0 | 8 |
| 6 | 0 | 6 | 1 | 9 |

`d(36) = 9`.

**Proper-divisor sum.**

| `k` | Action | Running sum |
|---:|---|---:|
| 1 | add `1` (partner `N` excluded) | 1 |
| 2 | add `2 + 18` | 21 |
| 3 | add `3 + 12` | 36 |
| 4 | add `4 + 9` | 49 |
| 5 | no divisor | 49 |
| 6 | square, add `6` once | 55 |

`55 != 36`, so `36` is not perfect. Intended output: `false 9 false`.

For `N = 28` the same loops give `false`, `6` divisors, and proper sum
`1 + 2 + 4 + 7 + 14 = 28`, hence `false 6 true`.

The committed `main` instead produces `false 9 true` for `36` and
`false 6 true` for `28`, because the third token is `countDivisors(N) != 0`.

## Progressive hints

1. Write the three definitions as three separate loops first. Correctness
   before speed.
2. Ask which candidate divisors are redundant: if `k` divides `N`, what else
   does?
3. A composite number always has a factor at most its square root. Use that
   for an early exit in the prime test.
4. When pairing, the square root is its own partner. Count it once.
5. The third answer is about perfection, not about having divisors.

## Traps

- `0` and `1` slip through `for (i = 2; i < n; i++)` without executing, so the
  function returns `true`. Guard `n < 2`.
- `if (countDivisors(N))` is true for every `N > 0`; it asks whether any
  divisor exists, which is always yes.
- Summing all divisors and subtracting `N` gives `true` for `N = 0`
  (`0 - 0 == 0`); the domain must exclude `0` or the guard must reject it.
- `i * i <= n` can overflow when `n` is near `INT_MAX`.
- Forgetting the square correction inflates `d(N)` by one for `4, 9, 16, ...`.
- `sigma(N)` can exceed `INT_MAX` for large `N`; use `long long`.
- Printing `True`/`False` or adding labels fails a token comparison.
- The divisor count loop runs twice in `main`, doubling the cost silently.

## Self-check

1. Why is `d(1) = 1` but `1` is not prime?
   Because primality requires exactly two distinct positive divisors; `1` has
   one.
2. Why does the prime loop stop at `sqrt(N)`?
   Any composite `N = a*b` has `min(a,b) <= sqrt(N)`, so a small factor exists.
3. How many divisors does `2^10` have?
   Eleven: they are `2^0` through `2^10`.
4. What goes wrong with `N = 0` in `isPerfect`?
   The loop adds nothing, `sum - n == n` becomes `0 == 0`, and `0` is declared
   perfect incorrectly.
5. Which line of `main` should pass `isPerfect(N)` instead of the divisor
   count?
   The `if` that prints the third token, currently `if (countDivisiors(N))`.
6. If `N = 10^9`, how many loop iterations does the optimized divisor count
   use?
   `floor(sqrt(10^9)) = 31622`, versus `10^9` in the current version.
