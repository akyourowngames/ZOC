# Deep Notes

## Core logic

Two nested ideas:

1. **Destroy-and-consume**: the digit loop consumes `N`, so any later comparison needs a
   copy. `original = N;` is taken before the loop.
2. **Positional rebuild**: `reverse = reverse * 10 + digit;` pushes the freshly read digit
   into the least significant position, shifting everything already there one place left.

Because the loop reads digits from least significant to most significant, the digit read
first (the original units digit) is appended first but then shifted left on every later
iteration, so it ends up as the most significant digit of `reverse`. The last digit read
(most significant of `N`) is appended last and stays in the units place. That is exactly
a reversal.

## Code walkthrough

```cpp
int N, reverse, digit, original;
cin >> N;
original = N;        // snapshot before destruction — the key line

reverse = 0;         // empty number
digit = 0;           // harmless initialization; assigned in the loop anyway

while (N > 0) {
    digit = N % 10;              // read rightmost digit
    reverse = reverse * 10 + digit;  // shift reverse left, append digit
    N = N / 10;                  // drop the digit just used
}
// cout << reverse << endl;      // the "print the reverse" variant, disabled

if (original == reverse) cout << "YES";
else                     cout << "NO";
```

- `digit = 0;` before the loop is dead code: every path through the loop assigns it. It
  signals the author's habit of "initialize everything", which is harmless but noise.
- `reverse` is `int`. That is the overflow hazard (see Current-code review).
- The commented line documents the original exercise ("reverse and print"); activating it
  changes the output contract entirely, so it stays off.
- No `endl` on the final output; fine for judges, though `"\n"` is the conventional choice.

## Why it works

Invariant: after `k` iterations, `reverse` holds the number formed by the `k` digits
removed so far, in reverse order, and `N` holds the unprocessed prefix.

- Base: zero iterations, `reverse = 0`, no digits — trivially the reversal of nothing.
- Step: the new digit `d` is the next one to the left of the removed block. Shifting
  `reverse` left by one decimal place and adding `d` places `d` immediately to the right
  of everything read so far, which is the correct next position for a reversed number.
- Exit: all digits are removed, so `reverse` is the full reversal.

Palindrome detection then follows from the definition: `N` is a palindrome iff its digit
string equals its reverse, and for non-negative integers with no leading zeros, integer
equality is equivalent to string equality of the canonical decimal forms. Trailing zeros
of `N` correspond to leading zeros of the reverse, which the integer representation
drops on both sides consistently — so no false positives occur.

## Complexity

- Time: O(d), one constant-time iteration per digit; `d <= 10` for `int`.
- Space: O(1) extra; four local integers, no string or array.
- String alternative: O(d) time, O(d) space.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| 0 | YES | single digit 0 is symmetric; loop skipped, `0 == 0` |
| 7 | YES | every single-digit number is a palindrome |
| 11 | YES | two identical digits |
| 10 | NO | reverse is 1 |
| 100 | NO | reverse is 1; trailing zeros are the asymmetry |
| 1221 | YES | even-length palindrome |
| 12321 | YES | odd-length palindrome |
| 1234 | NO | plain non-palindrome |
| 2147483647 | NO (but the reverse overflows) | `7463847412 > INT_MAX` — undefined behaviour |
| -121 | NO | loop never runs for negative `N`, so `reverse = 0 != -121` |

## Common mistakes

- Comparing `N == reverse` after `N` has been reduced to `0`.
- `reverse = reverse + digit * 10` (wrong place) or `reverse = reverse * 10 - digit`.
- Reinitializing `reverse` inside the loop, keeping only the last digit.
- Using `int` for `reverse` when input can approach `2^31 - 1`.
- Expecting `100` to reverse to `001` and print it; integers cannot hold leading zeros.
- Handling negatives by accident: the loop just does not run, which silently reports a
  non-palindrome for every negative number, including `-121`.
- Mixing up "reverse and print" with "reverse and compare" — the folder name versus the
  actual output contract.

## Variants and follow-ups

- **Reverse and print**: uncomment the `cout << reverse` line, drop the comparison; note
  the result for `100` is `1`.
- **String palindrome**: read as `string s`, compare `s[i]` with `s[n-1-i]`. This handles
  arbitrarily long input and preserves leading zeros, at O(d) memory.
- **Half reversal (no overflow)**: reverse only the second half and compare, stopping when
  `reverse >= N`. This is the standard O(1)-space solution for 32-bit input and avoids the
  overflow entirely.
- **Base B reversal**: replace `10` with `B` in both `%` and `* 10` to get the same logic
  in any radix.
- **Next palindrome**: find the smallest palindrome `>= N` by mirroring the left half and
  adjusting; a classic follow-up.
- **Reverse without arithmetic**: stack the digits (via `to_string` + `reverse`) — simpler
  to write, more memory.

## Key takeaways

- Save before you mutate; destructively consuming an input is a common source of
  "everything is zero" bugs.
- `acc = acc * base + digit` is the positional builder; learn it once, reuse it for
  binary-to-decimal, base conversion, and ATOI.
- Overflows live in intermediates, not just inputs.
- Trailing zeros disappearing is a feature for palindrome checks and a bug for "print the
  reverse" tasks.

## Current-code review

Three points, ordered by severity.

1. **Potential signed overflow (real defect for large input).** `reverse` is `int` and the
   reversed value can exceed `INT_MAX`. For `N = 2147483647` the computed value would be
   `7463847412`, so the statement `reverse * 10 + digit` overflows: undefined behaviour in
   C++, and on typical builds a wrapped negative number that yields a wrong verdict. The
   fix is a 64-bit accumulator:

   ```cpp
   long long reverse = 0;
   long long original = N;
   ```

   With `N` limited to `int`, a `long long` reverse always fits (`<= 9.99e9`).

2. **Naming versus output contract (documented, not a bug).** The folder is
   `18-reverse-number` and the commented-out line prints the reversal, but the active
   program prints `YES`/`NO`. The README states this explicitly, so behaviour matches the
   documentation; it is only the folder name that under-describes the program.

3. **Negative input (out of domain).** For `N < 0` the loop body never executes, so
   `reverse = 0` and the program answers `NO` for every negative number — including
   `-121`, which *is* a palindrome by digit symmetry. If negatives must be supported,
   work on `llabs(N)` and decide separately whether the sign is compared.
