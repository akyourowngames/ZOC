# Deep Notes

## Core logic

Factorial is a fold over `1..N` with multiplication. The state is a single
integer that always equals the factorial of the counter minus one:

```cpp
factorial = 1;
i = 1;
while (i <= N) {
    factorial = factorial * i;
    i++;
}
```

Everything else in the problem (the `0!` convention, the loop bound, the type)
follows from choosing `1` as the identity and `<=` as the bound.

## Code walkthrough

```cpp
int N, i ,factorial;
cin >> N;
factorial = 1;
i = 1;
```

`N`, `i`, and `factorial` are declared together; only `N` comes from input.
`factorial = 1` is not arbitrary: it is the multiplicative identity, the value
that makes "no factors multiplied yet" true. `i = 1` is the smallest factor that
changes nothing (`1 * 1`), which is why starting at `1` and starting at `2` agree
for every `N >= 1`.

```cpp
while (i <= N) {
    factorial = factorial * i;
    i++;
}
cout << factorial;
```

The multiply happens before the increment, so iteration `i` contributes factor
`i`. The long form `factorial = factorial * i` instead of `factorial *= i` is
stylistic only. No newline is printed.

## Why it works

Invariant: `factorial == (i - 1)!` at the top of each test.

- `i = 1`, `factorial = 1 = 0!`. True.
- Multiplying by `i` turns `(i - 1)!` into `i!`, and the increment makes the new
  `i - 1` equal to that same `i`. True again.
- `i` strictly increases toward `N + 1`, so the loop ends, and the invariant then
  reads `factorial == N!`.

For `N = 0` the invariant is already the answer at the first test, which is why
the empty-product convention needs no branch. It is not a special case added to
the code; it is the base case of the invariant.

## Complexity

`N` iterations, `O(1)` work each: `O(N)` time and `O(1)` extra space. The cost
is in the growing size of the numbers, not in the loop count; with big integers
the bit complexity is `O(N log N)`-ish because operands lengthen, but with fixed
width types every multiplication is constant time.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `0` | `1` | empty product |
| `1` | `1` | `1` |
| `2` | `2` | `1 * 2` |
| `5` | `120` | README example |
| `6` | `720` | `120 * 6` |
| `10` | `3628800` | common memorised value |
| `12` | `479001600` | largest correct `int` result |
| `13` | `6227020800` | code prints `1932053504` — overflow |
| `20` | `2432902008176640000` | needs `unsigned long long` |
| `-1` | undefined | loop skipped, prints `1` — misleading |

## Common mistakes

- Initialising the product to `0`, which zeroes every answer.
- Using `i < N`, which computes `(N - 1)!`.
- Testing only `N = 5` and assuming the program is general; the overflow only
  appears at `N = 13`.
- Expecting `long long` to be unlimited; `21!` overflows 64-bit unsigned.
- Forgetting the `0! = 1` convention when writing a recursive version, where the
  base case must be `n == 0`, not `n == 1`.
- Printing partial products inside the loop and mistaking them for the result.

## Variants and follow-ups

1. **Recursive form:** `long long f(int n) { return n <= 1 ? 1 : n * f(n - 1); }`
   — same recurrence, `O(N)` stack depth, so it fails around `N = 10^5`.
2. **Running sum of factorials:** keep the product between iterations instead of
   recomputing (see `12-Sum-of-n-factorials`).
3. **Modular factorial:** `factorial = factorial * i % MOD;` with
   `MOD = 1e9 + 7`; no overflow for `MOD^2 < 2^63`.
4. **Trailing zeros of `N!`:** count factors of `5` with
   `N/5 + N/25 + N/125 + ...`, no big integers needed.
5. **Big factorial:** store digits in an array base `10^9` and multiply by small
   integers, or use a library.

## Key takeaways

- A product accumulator starts at `1`; a sum accumulator starts at `0`.
- The `0!` convention is the empty product, which the loop gets for free.
- Factorial growth is the standard illustration of why result types matter more
  than input types.
- Reading `int N; int result;` and then multiplying `N` times is a silent
  time-bomb unless the constraint `N <= 12` is checked.

## Current-code review

The loop matches the README exactly for `0 <= N <= 12`, including the `0! = 1`
convention. Two issues remain, both outside that safe range:

1. **`int` overflow at `N = 13`.** Verified output: `13` prints `1932053504`
   instead of `6227020800` (low 32 bits of the true value, interpreted as
   signed). The code contains no guard, and signed overflow is undefined
   behaviour in C++ even though GCC and Clang wrap in practice. If the judge's
   limit exceeds 12, declare `unsigned long long factorial` (correct up to 20)
   or implement big integers.
2. **Negative input prints `1`.** For `N = -1` the loop is skipped and the
   initial `1` is printed, which reads as "(−1)! = 1" — wrong, since factorial
   is undefined for negatives. Add an explicit rejection or document `N >= 0`
   as a precondition.

Minor: `cout << factorial;` has no trailing newline, and the declaration
`int N, i ,factorial;` has inconsistent spacing around the comma. Neither
affects correctness.
