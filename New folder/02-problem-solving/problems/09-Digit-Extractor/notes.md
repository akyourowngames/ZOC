# Deep Notes

## Core logic

Decimal place values are powers of ten. In `N = 123456` the digit `4` is worth
`4 * 100`. Keeping the last `K` digits means dropping every term whose place
value is `10^K` or larger. Division by `10^K` performs that drop, and the
remainder is the low block that survives:

```text
N = q * 10^K + r,   0 <= r < 10^K
```

`r` is the number formed by the last `K` digits (with the caveat that an integer
cannot remember leading zeros). So the whole task is one remainder operation
with a computed divisor.

## Code walkthrough

```cpp
int K, N;
cin >> N >> K;      // K = 3
```

Both variables are declared but uninitialised, which is fine only because `cin`
assigns them before any use. The extraction order is `N` then `K`; declaration
order is irrelevant. The trailing comment records the author's assumption that
`K` is always `3`.

```cpp
int temp = 1;
temp = temp * 10;
temp = temp * 10;
temp = temp * 10;
```

This is a hand-unrolled loop for `K = 3`, ending with `temp == 1000`. Three
statements instead of `for (int i = 0; i < K; i++) temp *= 10;`. Every line is a
literal copy of the previous one, which is exactly the signal that a loop should
replace them.

```cpp
cout << N % temp;
```

Prints `N % 1000`. No newline is emitted, so the prompt or next program output
would continue on the same line in a terminal.

## Why it works

`123456 = 123 * 1000 + 456`. The `123 * 1000` part contributes nothing to the
remainder because it is an exact multiple of `1000`; the remainder `456` is
literally the digits `456`. The argument is identical for any `K`: split `N` at
the `10^K` boundary, and the low block is the digit suffix.

Because `10^K > r` always, a remainder of `K` digits can never "carry" into a
higher place, so the extraction is lossless for the digits it keeps.

## Complexity

- Current code: three multiplications and one modulo — `O(1)` time, `O(1)` space,
  independent of `K` and of the size of `N` (32-bit arithmetic is constant time).
- Intended generic code: `O(K)` time for the power loop, `O(1)` space. With
  `K <= 9` this is at most nine iterations, so it is effectively constant too.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `123456 3` | `456` | textbook case |
| `987654321 5` | `54321` | five-digit suffix |
| `45 3` | `45` | fewer digits than `K`, nothing removed |
| `7 3` | `7` | single digit |
| `1000 3` | `0` or `000` | suffix is all zeros; integer printing loses the width |
| `0 3` | `0` | zero has digit `0` |
| `2147483647 3` | `647` | largest `int` still works |
| `123456 2` | `56` | current code prints `456` — it ignores `K` |
| `123456 4` | `3456` | current code prints `456` — one digit short |
| `1234567890 5` | `67890` | current code prints `890` |
| `-123456 3` | `-456` in C++ | truncating division keeps the sign; task likely wants `456` |

## Common mistakes

- Dividing instead of taking the remainder: `123456 / 1000` returns `123`, the
  *high* digits — the opposite of the task.
- Off-by-one in the power loop: `K - 1` multiplications build `10^(K-1)` and
  return one digit too many.
- Believing `^` is exponentiation. `10 ^ 3` evaluates to `9`.
- Using `pow` and truncating: `pow(10, 23)` may return `99999999999999991611392`.
- Forgetting that `10^10` overflows `int`, so `K = 10` silently produces a
  garbage divisor if a generic loop is added without widening the type.
- Ignoring the sign of `N`, or ignoring the leading-zero policy of the judge.

## Variants and follow-ups

1. **Generic `K`:** `long long p = 1; for (int i = 0; i < K; ++i) p *= 10;`
   then print `N % p`. This is the fix the folder needs.
2. **Fixed-width output:** `cout << setw(K) << setfill('0') << (N % p);` turns
   `45 3` into `045` and `1000 3` into `000`.
3. **String route:** `string s = to_string(N); cout << s.substr(s.size() - K);`
   keeps leading zeros naturally but is slower and needs a length check.
4. **Arbitrary base:** replace `10` with `b`; `N % b^K` extracts the low `K`
   base-`b` digits.
5. **Middle digits:** first remove the low digits with `%`, then remove the high
   ones with `/`, e.g. digits 2..4 of `123456` are `(N / 100) % 1000 = 234`.

## Key takeaways

- `% 10^K` is the canonical "keep the suffix" operation and the foundation of
  digit-by-digit loops that use `% 10` and `/ 10`.
- A fixed constant hidden in repeated statements is a loop waiting to be written.
- The divisor dictates the result range; check that the divisor itself still
  fits the chosen integer type.
- Reading two inputs does not require using both; here `K` is consumed but
  unused, which is a strong smell during review.

## Current-code review

The active file contradicts the stated task in one substantive way:

1. **`K` is read but never used.** `temp` is built as `1 * 10 * 10 * 10`, a
   constant `1000`. Any `K != 3` produces the wrong answer: `123456 2` prints
   `456` instead of `56`, and `123456 4` prints `456` instead of `3456`.
   Minimal fix:

   ```cpp
   long long p = 1;
   for (int i = 0; i < K; ++i) p *= 10;
   cout << N % p << '\n';
   ```

2. **No trailing newline.** `cout << N % temp;` leaves the cursor on the same
   line. Harmless for most judges, but inconsistent with the other solutions in
   the repo; append `'\n'`.

3. **Leading-zero semantics are undefined.** `1000 3` prints `0` where the
   "last three digits" read as text would be `000`. The README should state
   which convention applies before this is used as a judge answer.

4. **No validation of `K`.** `K <= 0` or `K >= 10` is not rejected. With the
   hardcoded version this is masked; with the generic loop it becomes an
   overflow risk for `K = 10` in `int`.

The arithmetic that *is* present is correct: `N % 1000` genuinely returns the
last three digits for non-negative `N`, so the only defect is the missing
generalisation.
