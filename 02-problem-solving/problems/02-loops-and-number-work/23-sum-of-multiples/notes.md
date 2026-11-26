# Deep Notes

## Core logic

The set of candidates is the arithmetic progression `K, 2K, 3K, ...`. Instead of scanning
`1..N` and filtering with `i % K == 0`, the loop *is* the progression: start at `K`, step by
`K`, stop past `N`. That changes the iteration count from `N` to `floor(N/K)` and removes
the branch.

The sum is `K * (1 + 2 + ... + t)` with `t = floor(N/K)`, so the closed form
`K * t * (t + 1) / 2` reproduces the loop in O(1). The loop is the executable proof of the
formula; the formula is the scalable version.

Termination depends entirely on the step being positive: `i += K` with `K >= 1` strictly
increases `i`, so `i <= N` eventually fails. `K = 0` freezes `i`; `K < 0` moves it away from
`N`. Both are infinite loops, and both are outside the stated domain.

## Code walkthrough

```cpp
int N, K, sum;

cin >> N >> K;      // N first, then K
sum = 0;            // additive identity

for (int i = K; i <= N; i += K) {   // first multiple, inclusive bound
    sum += i;                        // fold the multiple in
}
cout << sum;        // bare integer
```

- `cin >> N >> K` relies on whitespace separation and works across newlines too.
- `int i = K` — starting at `K` rather than `1` is what skips all non-multiples.
- `i <= N` — inclusive; `N` counts when divisible by `K`.
- `i += K` — the step doubles as the "next multiple" generator.
- No divisibility test anywhere: `%` is not used.
- `cout << sum;` prints without a newline.

## Why it works

Invariant: at the start of each iteration, `sum` is the sum of all multiples of `K` that
are strictly less than `i`, and `i` is itself a multiple of `K`.

- Base: `i = K`, no multiple is below `K` (for `K > 0`), so `sum = 0`. True.
- Step: `i <= N` guarantees the current multiple belongs in the answer, so adding `i` keeps
  the invariant for the next value `i + K`, which is also a multiple.
- Exit: `i > N`; every multiple `<= N` has been added, and all multiples are `>= K`, so
  none were missed.

Nothing is double-counted because the values visited form a strictly increasing sequence of
distinct multiples. Nothing is missed because consecutive multiples differ by exactly `K`,
the smallest positive gap in the set.

## Complexity

- Time: `floor(N / K)` iterations, each O(1). Worst case `K = 1` -> O(N); best case `K > N`
  -> one failed condition, O(1).
- Space: O(1).
- Closed form: O(1) time; the multiplications need care, `t * (t + 1)` can be about
  `2.1e9` for `N = 92681, K = 1`, which already overflows `int` before the division by 2.
  Compute in `long long` and divide first if you can.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| 10 3 | 18 | `3 + 6 + 9` |
| 10 4 | 12 | `4 + 8` |
| 5 7 | 0 | no multiple fits; empty sum |
| 10 10 | 10 | inclusive bound |
| 9 10 | 0 | one past the bound |
| 0 5 | 0 | `N = 0`; no positive multiple |
| 100 1 | 5050 | triangular number `100*101/2` |
| 1 1 | 1 | smallest non-trivial case |
| 10 0 | no output (infinite loop) | step size zero |
| 10 -3 | no output (infinite loop) | negative step moves away from `N` |
| 65536 1 | 2147516416 | exceeds `INT_MAX` -> overflow in `int` |

## Common mistakes

- `cin >> K >> N` — swapping the inputs silently changes the problem.
- `for (int i = 0; ...)` — adds a harmless zero, but signals confusion about "positive
  multiples".
- `i < N` — misses `N` when `N % K == 0`.
- No guard for `K = 0` or `K < 0`; both hang.
- `int` for the sum when `N` can be large; `N(N+1)/2` overflows at `N = 65536`.
- Adding the divisibility test back in "for safety", which just restores O(N).
- Computing `K * t * (t + 1) / 2` in `int` and assuming the division by 2 saves you; the
  product overflows first.
- Off-by-one in `t`: `t` counts the terms, and `N / K` already gives the count, so no `+1`
  is needed.

## Variants and follow-ups

- **Inclusive vs exclusive bound**: change `<=` to `<` for "below `N`".
- **Multiples of both `K1` and `K2`**: sum for `K1` + sum for `K2` - sum for `lcm(K1, K2)`
  — the inclusion-exclusion used by Project Euler #1.
- **Count instead of sum**: `N / K` in O(1).
- **Sum of multiples of `K` in `[A, B]`**: prefix difference, `f(B) - f(A - 1)`.
- **Divisible by `K` with a digit constraint**: keep the progression and filter on digits,
  or switch to digit DP when `N` is huge.
- **Closed form with modular answer**: `K * t * (t+1) / 2 mod M`; divide by 2 before taking
  the modulus or use a modular inverse, since `t(t+1)` is always even.

## Key takeaways

- Stepping along the candidate set is usually better than filtering the whole range: same
  answer, fewer iterations, no branch.
- Every loop needs a progress argument. "The counter increases" is a claim to verify, and
  it fails for `K <= 0`.
- Arithmetic progressions are the friendliest loops to convert to closed form: `t`, first
  term, last term, and `t*(first+last)/2`.
- Overflow thresholds should be computed, not guessed: `int` dies at `N = 65536` for
  `K = 1`.

## Current-code review

Two defects, both at the domain boundary the statement leaves open.

1. **`K = 0` hangs forever.** `for (int i = K; i <= N; i += K)` with `K = 0` evaluates
   `i += 0`, so `i` stays `0` and `0 <= N` never becomes false (for `N >= 0`). The program
   produces no output and never terminates. Guard:

   ```cpp
   if (K <= 0) { cout << 0; return 0; }
   ```

   The mathematical answer for `K = 0` is debatable (the set of positive multiples of 0 is
   empty, so `0` is a defensible output), but non-termination is never acceptable.

2. **`K < 0` also hangs.** With `K = -3, N = 10`: `i` starts at `-3`, the condition
   `i <= 10` holds, and `i += K` moves it to `-6, -9, ...`, always `<= N`. Infinite loop
   that eventually reaches signed-integer overflow (undefined behaviour). The same `K <= 0`
   guard covers it; `K` should be validated as positive.

3. **Overflow risk, unstated constraints.** `sum` is `int`. For `K = 1` the answer is
   `N(N+1)/2`, which exceeds `INT_MAX` at `N = 65536` (true sum `2147516416`). Safe only if
   `N <= 65535`; otherwise use `long long sum` and also cast in any closed-form variant.

For `N >= 0` and `K >= 1` with a sum that fits in `int`, the arithmetic and the inclusive
bound are correct, and the output format (bare integer) matches the statement.
