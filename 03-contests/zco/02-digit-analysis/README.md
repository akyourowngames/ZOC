# Digit Analysis

**Pattern:** Digit extraction, arithmetic reversal, palindrome check | **Difficulty:** Easy

## Problem statement

Read one non-negative integer `N` and print three results, each on its own line:

1. the sum of the decimal digits of `N`;
2. the integer obtained by writing the digits of `N` in reverse order;
3. `true` if the reversed integer equals `N` (a palindrome), otherwise `false`.

Formally, if `N = d(k-1) * 10^(k-1) + ... + d(1) * 10 + d(0)` with digits
`d(i)` in `[0, 9]` and `d(k-1) != 0` when `N > 0`, then

- digit sum `S(N) = d(0) + d(1) + ... + d(k-1)`;
- reversal `R(N) = d(0) * 10^(k-1) + ... + d(k-1)`;
- palindrome iff `R(N) = N`.

The reversal is stored as an integer, so leading zeros disappear: `R(1200) = 21`,
not the string `"0021"`. The problem below assumes integer semantics. If the
judge wants a zero-padded string, that is a different output contract.

The current program handles `N >= 0` and prints `0`, `0`, `true` for `N = 0`.
Negative input is not handled: the digit loops never run, so `-121` prints
`0`, `0`, `false`. The practice domain is therefore `N >= 0`.

## Input and output

| Item | Format |
|---|---|
| Input | one line containing a single decimal integer `N` |
| Output | three lines: integer digit sum, integer reversal, `true`/`false` |

Example layout for `N = 1221`:

```text
6
1221
true
```

There are no labels and no blank lines. Lowercase `true`/`false` matters.
The third line is printed without a trailing newline in the current code.
The digits are processed in base 10.

## Examples

| `N` | Digit sum | Reversal (observed) | Palindrome | Reasoning |
|---:|---:|---:|---|---|
| `0` | 0 | 0 | `true` | single digit; loops do not run |
| `7` | 7 | 7 | `true` | one digit is always a palindrome |
| `10` | 1 | 1 | `false` | `10 != 1`; trailing zero is lost |
| `1200` | 3 | 21 | `false` | reversal drops two leading zeros |
| `1221` | 6 | 1221 | `true` | reads the same both ways |
| `1234` | 10 | 4321 | `false` | distinct digits |
| `1000000007` | 8 | `-1589934591` | `false` | reversal overflows 32-bit `int` |
| `2147483647` | 46 | `-1126087180` | `false` | reversal exceeds `INT_MAX` |
| `-121` | 0 | 0 | `false` | negative input is outside the domain |

The last three rows are observed behavior of the committed binary, not valid
answers. They show two independent defects: signed overflow on reversal and
silent zero results for negatives.

## Constraints and assumptions

Practice constraints (not specified by a judge):

- `0 <= N <= 2^31 - 1`, so `N` fits in `int` and has at most 10 digits.
- One test case, decimal input.
- Reversal output is an integer with no leading zeros.
- Negative numbers are out of scope; if required, the sign convention must be
  defined (for example, reverse the magnitude and keep the sign).

If `N` may reach `10^18`, both `N` and the reversal need `long long`; a 19-digit
reversal exceeds even `unsigned long long`, so the robust solution builds a
string. These are design alternatives, not claims about the original task.

## Approach at a glance

All three answers come from the same digit loop:

```text
while (n > 0):
    digit = n % 10
    sum  += digit
    rev   = rev * 10 + digit
    n    /= 10
```

`n % 10` isolates the last digit; `n /= 10` removes it, so the invariant after
`t` iterations is that `rev` holds the last `t` digits reversed and `sum` holds
their sum. The palindrome test compares `rev` with the saved original.

| Time | Space |
|---|---|
| `O(d)` for `d` digits, three separate passes in the current code | `O(1)` |
| `O(d)` with one combined pass computing `sum` and `rev` together | `O(1)` |
| `O(d)` with a string and two pointers (overflow-free alternative) | `O(d)` |

## Solution

[`solution.cpp`](./solution.cpp)

The file contains three near-identical loops. It is correct for positive
`N` whose reversal fits in `int`; see `notes.md`.

## What this teaches

- The modulus/division pair is the primitive for decimal digits; every digit
  statistic is a variation on it.
- An accumulator with `rev = rev * 10 + digit` builds numbers left to right
  from right-to-left input.
- Integer reversal is not injective once leading zeros are involved:
  `1200` and `120` both reverse to `21`.
- Arithmetic reversal can overflow; a palindrome check should avoid depending
  on an overflowing value.
- Code duplication is a correctness risk: three copies of a loop mean three
  places to fix a bug.

## Contest checklist

- [ ] Read `N` once and print exactly three lines in the required order.
- [ ] Test `N = 0`, which must not crash or print garbage.
- [ ] Test a number ending in zero (`10`, `1200`) and confirm the intended
      leading-zero semantics.
- [ ] Test a one-digit number; it must be a palindrome.
- [ ] Save the original before mutating `N` in the palindrome check.
- [ ] Use `long long` for the reversal, or a string, when `N` can be large.
- [ ] Print lowercase `true`/`false`, no labels.
- [ ] Decide and document negative-input behavior instead of silently
      returning zeros.
- [ ] End the last line with a newline.
