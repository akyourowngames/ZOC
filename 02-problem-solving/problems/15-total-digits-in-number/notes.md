# Deep Notes

## Core logic

A decimal number with `d` digits satisfies `10^(d-1) <= N < 10^d`. Integer
division by `10` maps that interval to `10^(d-2) <= N/10 < 10^(d-1)`, so each
division removes exactly one digit. After `d` divisions the value is `0`, and it
was still positive after `d - 1` divisions. Therefore the number of successful
divisions equals the number of digits.

```cpp
count = 0;
while (N > 0) {
    count += 1;
    N = N / 10;
}
```

## Code walkthrough

```cpp
int N, count;
cin >> N;
count = 0;
```

`N` is the number being dismantled, `count` the digit tally. The declared order
is reversed relative to common style (`count` before `N`), which is harmless.

```cpp
while (N > 0) {
        count += 1;
        N = N / 10;
}
cout << count;
```

- `N > 0` is the guard that stops the loop once every digit is gone.
- `count += 1` records the digit currently being removed; it could be `count++`.
- `N = N / 10` performs the removal. Without this line the loop never ends.
- The indentation inside the loop is eight spaces instead of four; consistent
  with the rest of the file but inconsistent with the repo's other sources.
- The file also ends with a very long run of trailing spaces on the line after
  the closing brace, which is invisible in most editors but shows up in diffs.

## Why it works

Loop invariant: before each test, `N` has had `count` digits removed from the
right, i.e. `N` is the original value divided by `10^count` (truncated).

- Initialisation: `count = 0`, nothing removed yet.
- Maintenance: one division removes one more digit and one increment accounts
  for it, so the relationship holds with `count + 1`.
- Termination: `N` strictly decreases for `N > 0` (`N / 10 < N`), and it is
  bounded below by zero, so the loop must stop. When it stops, `N == 0`, meaning
  all digits were removed; `count` is the digit count.

The mechanism also explains the `N = 0` flaw: the invariant argument assumes at
least one digit exists, but the guard rejects the value before any iteration.

## Complexity

- `d` iterations, each doing one division and one increment: `O(d)` time,
  `O(1)` space.
- For `int`, `d <= 10`, so the loop is effectively constant time.
- Asymptotically `O(log10 N)`, which is why digit problems are considered cheap
  even for values near `10^9`.
- Space is `O(1)`; a recursive version would add `O(d)` stack frames.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `0` | `1` | convention: zero has one digit; code prints `0` |
| `1` | `1` | single digit |
| `7` | `1` | single digit |
| `9` | `1` | largest single digit |
| `10` | `2` | zero digit counts |
| `99` | `2` | two digits |
| `100` | `3` | two zeros still count |
| `1000` | `4` | README edge case |
| `5072` | `4` | README example |
| `1000000000` | `10` | `10^9`, ten digits |
| `2147483647` | `10` | largest `int` |
| `-5072` | `4` if sign ignored | code prints `0` |

## Common mistakes

- Omitting `N = N / 10`, creating an infinite loop.
- Using `N >= 0`: `0 / 10` stays `0`, so the loop never terminates.
- Reporting `0` digits for `0`.
- Using `%` instead of `/` in the update (`N = N % 10`), which freezes the value.
- Using `log10(N) + 1` without care: `log10(1000)` can return
  `2.9999999999999996`, truncating to `2`.
- Copying this loop into the digit-sum problem and forgetting that there the
  remainder must be captured before the division.

## Variants and follow-ups

1. **`do...while` fix:** `do { ++count; N /= 10; } while (N != 0);` — handles
   `0` (counts one digit) and negative values (counts the digits of the
   magnitude). Correct for `N = 0` without an extra branch.
2. **Guard fix:**
   `if (N == 0) count = 1; else while (N > 0) { ... }`.
3. **Floating point:** `N == 0 ? 1 : (int)log10((double)N) + 1`, with an epsilon
   adjustment (`+ 1e-9`) to survive boundary values.
4. **String route:** `to_string(N).size()` — simple, works for negatives if you
   subtract one for the `'-'`.
5. **Count digits in another base:** replace `10` with `b`; the digit count is
   the number of divisions by `b`.
6. **Count even/odd digits:** combine with a predicate on `N % 10` before the
   division (see `27-count-even-digits`).

## Key takeaways

- Dividing by the base removes one digit; the divisions count the digits.
- Loop guards decide whether `0` is handled; `> 0` and `!= 0` behave differently.
- Destructive loops are acceptable only when the original value is not needed
  afterwards.
- Digit problems are `O(log N)` in numeric value and `O(1)` for fixed-width
  integers.
- Floating-point logarithms are a shortcut with sharp edges; integer loops are
  exact by construction.

## Current-code review

The active code contradicts the stated task for exactly one input:

1. **`N = 0` prints `0` instead of `1`.** Verified. The guard `while (N > 0)`
   fails immediately, so `count` stays `0`; the intended answer is one digit.
   Minimal fix without restructuring:

   ```cpp
   if (N == 0) {
       cout << 1;
       return 0;
   }
   ```

   or replace the loop with `do { ++count; N /= 10; } while (N != 0);`, which
   also makes the negative case behave sensibly (it counts the digits of `|N|`).

2. **Negative input prints `0`.** For `N = -5072` the loop is skipped and the
   output is `0`. The `do...while (N != 0)` form above fixes this too.

3. **Cosmetic:** the loop body is indented by eight spaces, the file ends with a
   long trailing-whitespace line, and the output has no trailing newline. All
   three show up in diffs; clean them before release.

Everything else is correct: `5072 -> 4`, `10 -> 2`, `1000 -> 4`, `2147483647 -> 10`.
