# Deep Notes

## Core logic

"`K` divides `N`" means there exists an integer `q` with `N = q * K`. Truncated
division computes `q = N / K` and `r = N % K` such that `N = q*K + r` and
`|r| < |K|`. So `r == 0` holds exactly when such a `q` exists. One modulo
settles the question for any magnitude, because the test never enumerates
multiples.

The predicate is a `bool`; C++ evaluates `N % K == 0` to `true`/`false`, so it
can be used directly in an `if` or a ternary without an explicit comparison of
the result.

## Code walkthrough

1. `long long N; long long K;` — 64-bit signed types. `N` can be up to about
   `9.2 * 10^18`, and `K` can be larger than `N`, so reading both as `long long`
   avoids the `int` ceiling.
2. `cin >> N >> K;` — first token to `N` (dividend), second to `K` (divisor).
3. `if (N % K == 0) { cout << "YES"; }` — the single test. The braces are
   optional for one statement but keep the branch visible.
4. `else { cout << "NO"; }` — every non-divisible pair.
5. `return 0;` — the program ends after one token.

No `K == 0` check exists. With `K = 0` the CPU raises a divide-by-zero
exception (`0xC0000094` on Windows); the program does not print `NO`, it
terminates.

## Why it works

Correctness rests on the division identity and on the fact that remainders are
bounded in magnitude. If `K` divides `N`, the remainder is forced to be `0`; if
the remainder is `0`, then `N = (N/K) * K`, exhibiting the required quotient.
There is no third possibility, so a two-valued output is complete.

## Complexity

One modulo, one comparison, one write: O(1) time and O(1) space. The cost does
not grow with the size of `N` or `K`; only the number of machine words needed
to store them would change the constant.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `20 5` | `YES` | README sample |
| `22 5` | `NO` | remainder `2` |
| `5 20` | `NO` | dividend smaller than divisor |
| `20 20` | `YES` | a number divides itself |
| `0 7` | `YES` | zero is a multiple of every non-zero `K` |
| `7 0` | undefined | remainder by zero; current code crashes |
| `-15 5` | `YES` | sign does not affect divisibility |
| `-15 -5` | `YES` | `%` yields `0` for equal-sign multiples |
| `15 -5` | `YES` | remainder `0` regardless of divisor sign |
| `9223372036854775807 1` | `YES` | `LLONG_MAX`, `% 1` is always `0` |
| `9223372036854775807 2` | `NO` | largest `long long` is odd |

## Common mistakes

- Reversing the operands (`K % N`), which is a different question and only
  incidentally agrees on symmetric samples.
- Reading into `int` when `K` or `N` can exceed `2,147,483,647`.
- Using `N / K == something` or floating-point division for an exact test.
- Printing lowercase or mixed-case tokens.
- Leaving a debug print of the remainder in the final code.
- Guarding `K == 0` with `cout << "NO"` and then still evaluating `N % K`
  (short-circuit only works if the modulo is inside the guarded branch).

## Variants and follow-ups

- **Multiple divisors:** check `N % 2 == 0 && N % 3 == 0`, or combine with
  `&&`/`||`; watch short-circuiting to avoid dividing by zero.
- **Divisibility rules by digit:** by `3` or `9` (digit sum), by `4` (last two
  digits), by `11` (alternating sum). These exist because of place-value
  arithmetic and are worth deriving once.
- **Count multiples of `K` in `[1, n]`:** `n / K`, the quotient form of the
  same idea (floor division for positive values).
- **`gcd`-based test:** `K` divides both `A` and `B` exactly when
  `K` divides `gcd(A, B)`; useful when many queries share two numbers.
- **Large inputs beyond 64 bits:** read as strings and test divisibility
  digit by digit, keeping `remainder = (remainder * 10 + digit) % K`.

## Key takeaways

1. Divisibility is `% == 0`; nothing else is needed.
2. Operand order encodes the question: dividend first, divisor second.
3. `%` is exact and cheap; floating point is neither.
4. A guaranteed-valid input assumption (`K != 0`) is not the same as a checked
   one; judges sometimes include the degenerate case anyway.
5. Output tokens are part of the contract, including case.

## Current-code review

The divisibility logic is correct for every `K != 0` (verified: `20 5` ->
`YES`, `22 5` -> `NO`, `-15 5` -> `YES`, `0 7` -> `YES`). One real defect:

1. **Missing `K == 0` guard.** The README states `K` must not be zero, but the
   code evaluates `N % K` unconditionally. Running `7 0` terminated the process
   with the integer divide-by-zero exception on the MSVC build used to verify
   (abnormal exit, no output at all) — not with a wrong-but-survivable line.
   If there is any chance the judge includes `K = 0` (or if this file is
   published as a reusable snippet), guard it:

   ```cpp
   if (K == 0) { cout << "NO"; return 0; }   // or follow the statement
   if (N % K == 0) cout << "YES";
   else            cout << "NO";
   ```

   Note that the fallback for `K == 0` must come from the statement; "NO" is
   only a placeholder, since mathematically the question is undefined.

2. **No trailing newline.** `"YES"`/`"NO"` are printed without `'\n'`. Accepted
   by most judges, but every other folder in this track prints a newline, so
   the inconsistency is worth fixing for consistency's sake.
