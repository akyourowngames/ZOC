# Palindrome Number

**Pattern:** reverse the digits, then compare against a saved copy | **Prerequisites:** digit extraction, positional append, preserving the input, overflow awareness, `if`/`else`

## Problem statement

Read a non-negative integer `N`. Print `YES` if `N` reads the same forwards and
backwards, otherwise `NO`.

`1221` is a palindrome (its reverse is itself). `1234` reverses to `4321`, so
it is not.

The algorithm is folder [`28-reverse-a-number`](../28-reverse-a-number/) plus
one saved variable and one comparison. The saving is the interesting part:
reversal destroys `N`, and a comparison needs both the original and the
reversed value.

## Input and output

- Input: one line containing the integer `N`.
- Output: `YES` or `NO`, uppercase, with no extra text.

## Examples

### Example 1
```text
Input:
1221
Output:
YES
```
**Why:** the loop builds `reverse = 1221` and `original = 1221`; the test
`reverse == original` succeeds.

### Example 2
```text
Input:
1234
Output:
NO
```
**Why:** `reverse = 4321`, `original = 1234`; not equal, so `NO`.

### Example 3
```text
Input:
1000
Output:
NO
```
**Why:** the reverse is `0001`, i.e. the integer `1`, while `original` is
`1000`. Exactly the same digits and yet not a palindrome — positional order is
what is being compared, not the multiset of digits.

### Example 4
```text
Input:
7
Output:
YES
```
**Why:** a one-digit number trivially equals its reverse. Every single digit is
a palindrome, including `0`.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:

- `N` fits in a 32-bit signed `int` (`0 <= N <= 2 147 483 647`).
- The reversed value must fit as well. The reversal is built for *every* input,
  so a non-palindromic 10-digit number such as `1 999 999 999` overflows `int`
  mid-loop (`9 999 999 991`), which is undefined behaviour. Use `long long` or
  a string for safety. (Palindromes that fit in `int` necessarily reverse to
  themselves, so they are the one safe 10-digit family.)
- Input is non-negative. With this code a negative such as `-121` would print
  `YES` because both sides carry the same sign; most statements exclude
  negatives.
- Leading zeros do not exist in the input (integer parsing removes them), so
  `00100` arrives as `100`.
- Output is exactly `YES`/`NO` with no trailing punctuation; a newline is
  optional.

## Approach at a glance

1. Save `original = N`.
2. Reverse `N` into `reverse` using `rev = rev * 10 + digit`.
3. Compare `reverse == original`.

Both directions of the same digits must be available at once, which is why the
copy is taken *before* the loop rather than reconstructed after it.

| Time | Space |
| --- | --- |
| O(d), d = digits (`d <= 10`) | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches
- Reversal destroys information; comparison needs it back.
- Equality of digit multisets is not equality of numbers (`1000` vs `1`).
- The same digit loop answers "is X" questions, not just "what is X".
- Overflow can silently corrupt a boolean answer, not only a printed number.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
