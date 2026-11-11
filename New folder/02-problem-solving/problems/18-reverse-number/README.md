# Reverse a Number (Palindrome Check)
**Pattern:** Build a number digit-by-digit, then compare with the saved original | **Prerequisites:** `%` and `/`, `while` loops, integer overflow, string vs numeric comparison

## Problem statement

Read one integer `N`, reverse its decimal digits, and compare the reversed value with
the original. Print `YES` when they are equal, otherwise `NO`.

That equality test is exactly the definition of a **palindrome**: `1221` reads the same
both ways, `1234` does not. The folder is named "reverse-number" because reversal is the
core operation, but the program's output is the verdict, not the reversed digits. The
`cout << reverse << endl;` line that would have printed the reversal is commented out in
the source.

## Input and output

- Input: one integer `N` (`cin >> N`), a single value on a single line.
- Output: `YES` if the digits read the same forwards and backwards, else `NO`. No
  newline after the word in the current code.

## Examples

### Example 1
```text
Input:
1221
Output:
YES
```
**Why:** the reverse is `1221`. Digit order `1,2,2,1` is symmetric, so dropping leading
zeros is irrelevant here.

### Example 2
```text
Input:
1234
Output:
NO
```
**Why:** the reverse is `4321`, which differs from `1234` at the first position.

### Example 3
```text
Input:
100
Output:
NO
```
**Why:** the digit-by-digit reverse is `0,0,1`, i.e. the integer `1`. `100 != 1`, and
correctly so — the string `"100"` is not a palindrome. This is the case where integer
semantics and string semantics agree, but for a subtle reason: the trailing zeros are
what matter, not the leading ones.

## Constraints and assumptions

Practice constraints (not specified by a judge). Safe assumptions:
- `N` fits in a 32-bit `int`, so `N <= 2147483647`.
- `N >= 1` is the intended domain; `N = 0` happens to be handled correctly by accident
  (`0 == 0`, so `YES`).
- Digits are decimal; leading zeros in the input are not written.

Important: the *reversed value* is not bounded by `INT_MAX`. `reverse(2147483647) =
7463847412`, which exceeds `2147483647`, so a 64-bit accumulator (or a string-based
comparison) is required for full `int` input coverage. See notes.md.

## Approach at a glance

1. Save `original = N` — once the loop runs, `N` is destroyed.
2. `reverse = 0`.
3. While `N > 0`:
   - `digit = N % 10`
   - `reverse = reverse * 10 + digit` (shift the current reverse left one decimal place,
     then append the new digit on the right)
   - `N /= 10`
4. Compare `original == reverse` and print `YES` or `NO`.

`reverse * 10` is the inverse of `% 10`: it makes a decimal slot on the right for the
next digit, the same way `% 10` reads the slot on the right.

| Time | Space |
| --- | --- |
| O(d) where d = number of digits | O(1) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches

- Why an accumulator must be saved *before* a destructive loop consumes its source.
- Positional building: `acc = acc * base + digit` reconstructs a number in any base.
- Leading zeros vanish in integers, which is exactly the behaviour palindrome checking
  needs for trailing zeros of the original.
- Numeric reversal can overflow even when the input fits — overflow is about the
  intermediate, not the input.
- The same task has three implementations with different tradeoffs: numeric reverse,
  two-pointer on the string, or half-reverse (the LeetCode-style O(1)-space version).

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
