# How to Think About It

## 1. Restate the task

Read `N`, take apart its decimal digits, add them, print the total. No
reordering, no counting, no comparison — a pure fold over digits.

## 2. Spot the pattern

Two facts make this easy:

1. A number is stored as a value, not as characters, so I cannot index digits
   directly. I must *extract* them with arithmetic.
2. Base-10 arithmetic hands me the **last** digit for free: `N % 10`. And
   `N / 10` gives me the number without that digit.

So the natural traversal is right-to-left, one digit per step, destroying the
number as I go. The traversal order does not matter for a sum, which is why
this pattern is the cheapest possible.

This is the same shape as "count the digits", "reverse the number", "find the
largest digit": one loop, one extraction, one update, different accumulator
and different per-digit work.

## 3. Derive the algorithm
1. Read `N`.
2. `sum = 0` — the identity for addition, so adding the first digit gives that
   digit.
3. Extract the last digit: `digit = N % 10`.
4. `sum += digit`.
5. Drop the last digit: `N = N / 10`.
6. Repeat steps 3–5 while `N > 0`.

The condition is placed at the bottom because the body is valid for every
input: even `N = 0` has one digit to extract. With the test at the bottom the
`0` case needs no special handling.

## 4. Dry run

**`N = 5329`**

| iteration | `N` at start | `digit = N % 10` | `sum` after `+=` | `N` after `/ 10` | `N > 0`? |
| --- | --- | --- | --- | --- | --- |
| 1 | 5329 | 9 | 9 | 532 | true |
| 2 | 532 | 2 | 11 | 53 | true |
| 3 | 53 | 3 | 14 | 5 | true |
| 4 | 5 | 5 | 19 | 0 | false, stop |

Output `19`. The loop ran exactly as many times as there are digits, and `N`
reached `0` precisely after the last digit was consumed.

**`N = 0`**

| iteration | `N` at start | `digit` | `sum` | `N` after `/ 10` | `N > 0`? |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | 0 | 0 | 0 | false, stop |

Output `0`. One iteration even though there was "no work" — harmless here,
because adding `0` changes nothing.

**`N = 907`**

| iteration | `N` | `digit` | `sum` | `N` | continue? |
| --- | --- | --- | --- | --- | --- |
| 1 | 907 | 7 | 7 | 90 | yes |
| 2 | 90 | 0 | 7 | 9 | yes |
| 3 | 9 | 9 | 16 | 0 | no |

Output `16`. Interior zeros cost an iteration but add nothing.

## Progressive hints

1. How do you get the last decimal digit of an integer using only `/` and `%`?
2. How do you then get rid of it so the next digit is exposed?
3. What must `sum` start at so that the first addition is neutral?
4. Does the loop need to run zero times for any input in the domain? If not,
   `do-while` is safe — and it removes the `N = 0` special case.

## Traps

- **Forgetting `N = N / 10`.** Infinite loop: the same last digit is added
  forever.
- **Accumulating with `sum = digit`** instead of `sum += digit` — keeps only the
  last digit processed.
- **Uninitialised `sum`.** `int sum;` then `sum += digit` adds to garbage.
- **Using `% 10` on a `double`/`float`.** The `%` operator needs integers.
- **Assuming digit order matters.** It does not for a sum, but it does for
  reversal and palindrome checks.
- **Ignoring the sign.** For `N = -12`, `N % 10` is `-2`, not `2`, so the sum
  comes out negative.

## Self-check

- How many iterations for `N = 10^9`? (Ten — one per digit.)
- What is the largest digit sum reachable with a 32-bit `int`? (`82`, from
  `1 999 999 999`; ten nines are not representable.)
- Why is `do-while` a better fit than `while` here, and when would it not be?
  (The body is always valid; for a "reverse the number" task the loop still
  works, but for "count digits of 0" the expected answer may be 0 or 1.)
- If I keep a copy of the original `N`, what other questions can I answer in
  the same pass? (Digit count, max/min digit, product, frequency array.)
