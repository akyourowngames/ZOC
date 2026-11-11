# Deep Notes

## Core logic

Every answer comes from one loop shape, repeated three times:

```text
while (n > 0) {
    int digit = n % 10;
    ... use digit ...
    n /= 10;
}
```

Digit sum accumulates `sum += digit`; reversal accumulates
`rev = rev * 10 + digit`; the palindrome check computes `rev` from a saved copy
and compares. `rev * 10` shifts the accumulated digits left and `+ digit`
places the new digit in the units position. On non-negative `int` values `%`
and `/` behave normally; on negatives `n % 10` can be negative
(`-121 % 10 == -1`), which the `n > 0` conditions sidestep by never running.

## Code walkthrough

`sumDigits` (lines 4-14) loops while `n > 0`, adding `n % 10` and dividing by
10; `N = 1221` gives `6`, `N = 0` gives `0` because the loop is skipped.
`reverseNumber` (lines 16-27) applies `reverse = reverse * 10 + digit` in the
same loop: `1221 -> 1221`, `1200 -> 21` because the two units zeros contribute
nothing. `isPalindrome` (lines 29-42) saves `original = n`, reimplements the
reversal inline, and returns `original == reverse`; the parameter is by value,
so `main`'s `N` is unchanged. `main` (lines 44-59) prints the sum, the
reversal, and the boolean, with no labels but no final newline.

Observed outputs:

| `N` | Output (three lines) |
|---:|---|
| `0` | `0`, `0`, `true` |
| `7` | `7`, `7`, `true` |
| `10` | `1`, `1`, `false` |
| `1200` | `3`, `21`, `false` |
| `1221` | `6`, `1221`, `true` |
| `1000000007` | `8`, `-1589934591`, `false` |
| `2147483647` | `46`, `-1126087180`, `false` |
| `-121` | `0`, `0`, `false` |

## Why it works (correctness)

**Digit extraction is exact.** For `n > 0`, `n = 10q + r` with `0 <= r <= 9`;
C++ gives `r = n % 10` and `q = n / 10`, so each iteration peels the last digit
and strictly decreases `n`.

**Digit sum and reversal.** Invariant: after `t` iterations, `sum` is the sum
of the `t` least significant digits, and `rev` holds those digits in reverse
order. `sum += digit` and `rev = rev * 10 + digit` preserve it; at termination
`sum = S(N)` and `rev = R(N)`. This is induction on `t`.

**Palindrome.** Comparing the saved original with `rev` is exactly `N == R(N)`.
Without the saved copy, `n` is `0` after the loop and the comparison is wrong.

**Where the proof breaks.** The reversal of a 10-digit `N` can exceed
`INT_MAX` (for example `1000000007 -> 7000000001`). Signed overflow is
undefined, so the C++ value, and the palindrome answer derived from it, are
not guaranteed.

## Complexity

For `d = floor(log10(N)) + 1` digits:

| Operation | Time | Space |
|---|---|---|
| `sumDigits` | `O(d)` | `O(1)` |
| `reverseNumber` | `O(d)` | `O(1)` |
| `isPalindrome` | `O(d)` | `O(1)` |
| `main` total | `O(d)`, three passes | `O(1)` |

For `int` input, `d <= 10`, so the program cannot time out; correctness
(overflow) is the binding constraint, not speed. A string solution costs
`O(d)` space but removes the overflow risk, and `d <= 19` even for 64-bit input.

## Edge cases and tests

| Input | Expected | Observed | Reason |
|---:|---|---|---|
| `0` | `0`, `0`, `true` | `0`, `0`, `true` | zero iterations; `0` is a one-digit palindrome |
| `5` | `5`, `5`, `true` | same | single digit is always a palindrome |
| `10` | `1`, `1`, `false` | same | trailing zero disappears in the reversal |
| `11` | `2`, `11`, `true` | same | two equal digits |
| `100` | `1`, `1`, `false` | same | reversal is `1`, not `001` |
| `1200` | `3`, `21`, `false` | same | two leading zeros lost |
| `1221` | `6`, `1221`, `true` | same | even-length palindrome |
| `12321` | `9`, `12321`, `true` | same | odd-length palindrome |
| `1234` | `10`, `4321`, `false` | same | distinct digits |
| `2147483647` | `46`, `7463847412`, `false` | `46`, `-1126087180`, `false` | reversal exceeds `INT_MAX` |
| `1000000007` | `8`, `7000000001`, `false` | `8`, `-1589934591`, `false` | same overflow |
| `-121` | undefined by current spec | `0`, `0`, `false` | loop condition `n > 0` fails |

For the overflow rows the palindrome verdict is still correct; only the
reversal line is wrong. A wrong value can still produce a right boolean, so
the reversal must be checked separately.

## Common mistakes

- Not saving the original before the palindrome loop.
- Using `n` after the loop in the comparison.
- Writing `rev = rev * 10 + n % 10` and then dividing by 10 twice, or otherwise
  skipping the digit.
- Forgetting that `n /= 10` must use the same `n` that was reduced by `%`.
- Expecting leading zeros in an integer result.
- Using `int` for reversal of a 10-digit number.
- Assuming `n % 10` is non-negative for negative `n`.
- Handling negatives with `abs(n)`, which is undefined for `INT_MIN`.
- Duplicating the loop instead of calling `reverseNumber`, so a fix is applied
  in one place and missed in another.
- Printing booleans with `cout << boolalpha` together with other formatting,
  or using `1`/`0` when `true`/`false` is required.
- Forgetting the newline between the three answers.

## Variants and follow-ups

- **Count digits.** Same loop with `count++`; in base 10 this is
  `floor(log10(N)) + 1`, but the loop is exact for `N = 0` if seeded at `1`.
- **Product of digits.** Same loop with `prod *= digit`; note that any zero makes
  the product `0`, and `N = 0` gives `0`.
- **Largest / smallest digit.** Maintain extrema; initialize with `-1` / `10` or
  with the first extracted digit to avoid sentinel bugs.
- **Base `b`.** Replace `10` with `b` in `%` and `/`; digits above 9 need a
  character mapping.
- **Palindrome without reversal.** Compare a string with its reverse, or reverse
  only half the number. The half-reversal approach avoids overflow entirely and
  is the usual answer for 64-bit inputs.
- **Digital root.** Repeated digit summing until one digit remains; the result is
  `1 + (N - 1) % 9` for `N > 0`, a useful cross-check for `sumDigits`.
- **Negative numbers.** Define semantics first (reverse the magnitude and keep
  the sign, or reject). `-121` would be a palindrome under the magnitude
  convention.

## Key takeaways

- One loop invariant explains sum, reversal, digit count, and every other digit
  statistic.
- `%` and `/` are only simple for non-negative operands; domain handling is part
  of the algorithm.
- Integer reversal loses trailing zeros; this is a semantic decision, not a bug
  by itself.
- The reversal of an `int` can need more than `int`; choose a wider type or a
  string before the palindrome comparison.
- Three copies of a loop are three chances to fix a bug in only one place.

## Current-code review

1. **Three duplicated digit loops (lines 8-12, 21-25, 35-39).** `isPalindrome`
   reimplements exactly the body of `reverseNumber`. It could save the original
   and call `return original == reverseNumber(n);`. `reverseNumber` takes its
   argument by value, so this is safe. The duplication is the root cause of
   having to audit overflow in two places.
2. **Negative input silently produces zeros (lines 8, 21, 35).** All loops are
   conditioned on `n > 0`. For `N = -121` the program prints `0`, `0`, `false`.
   Either state the domain as `N >= 0` or normalize the input deliberately
   (and avoid `abs(INT_MIN)`). As written, negative inputs are mishandled, not
   rejected.
3. **Reversal overflow (line 23).** `reverse = reverse * 10 + digit` is `int`
   arithmetic. `N = 1000000007` produces `-1589934591` and
   `N = 2147483647` produces `-1126087180` on the test build. This is undefined
   behavior; the fix is `long long reverse` (and `long long n`) or a string, not
   reliance on wraparound.
4. **Palindrome depends on the overflowing value (lines 32-41).** Because
   `isPalindrome` computes its own `int` reversal, its answer is also exposed to
   overflow. A different compiler could wrap differently or optimize based on
   the assumption that signed overflow never happens.
5. **`N = 0` behavior (all three functions).** The loops are skipped, so the
   outputs are `0`, `0`, `true`. That is consistent with the definitions, but it
   is accidental rather than explicit: no comment or guard records the decision.
   If the judge requires `N >= 1`, `0` is out of domain and should be documented
   as such.
6. **Leading-zero semantics (line 23).** `reverseNumber(1200)` returns `21`.
   This is correct for integer reversal and wrong if the expected output is the
   zero-padded string `0021`. The README states the integer assumption; the code
   contains no handling for the string interpretation.
7. **Unused loop counter (lines 8, 21, 35).** `for (int i = 1; n > 0; i++)`
   never uses `i`. It is harmless for `int` inputs, but it misleads the reader
   into thinking a digit count is needed. Use `while (n > 0)`.
8. **Uninitialized-looking declarations (lines 17, 30).** `int reverse, digit;`
   declares without initialization, then assigns `reverse = 0` immediately.
   There is no bug, but initializing at declaration (`int reverse = 0;`) removes
   the need to verify order.
9. **Name `reverse` shadows `std::reverse` (line 17).** With `using namespace
   std;` this is legal here because `<algorithm>` is not included, but the local
   variable would hide the algorithm and break unqualified calls if that header
   were added. A name like `rev` avoids the trap.
10. **Missing trailing newline (line 56).** The third line has no `\n`. Harmless
    for most judges; add it for cleanliness.
11. **No input check (line 47).** If `cin >> N` fails, `N` is left with an
    indeterminate value (since C++11, a failed extraction sets it to `0`), and
    the program prints three lines anyway. Not required for a valid test file.

The program's arithmetic is correct for every `N` in `[0, 2147483647]` whose
reversal also fits in `int`; everything outside that set is either wrong by
design (negatives) or undefined (overflow). No `.cpp` file was modified.
