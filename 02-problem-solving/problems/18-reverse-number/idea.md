# How to Think About It

## 1. Restate the task

Read `N`, build the number you get by writing its digits in the opposite order, and say
whether that equals `N`. In one word: palindrome test, implemented by construction rather
than by comparing characters.

## 2. Spot the pattern

There are two reusable primitives here.

**Digit stream** (read and consume): `d = N % 10; N /= 10;`

**Positional builder** (write and grow): `acc = acc * 10 + d;`

They are inverses of each other. `% 10` takes the rightmost digit off; `* 10 + d` pushes
a digit onto the right. Feed the first's output into the second and you reverse the
number, because the last digit read becomes the first digit written.

Check the arithmetic once with `reverse = 12` and `digit = 3`:

```text
12 * 10      = 120     // shift existing digits left, empty slot on the right
120 + 3      = 123     // fill the slot
```

Any other order of operations is wrong: `reverse * (10 + digit)` and
`reverse + digit * 10` do not build a positional number.

## 3. Derive the algorithm

1. `original = N;` — mandatory, because step 3 destroys `N`.
2. `reverse = 0;`
3. While `N > 0`:
   a. `digit = N % 10;`
   b. `reverse = reverse * 10 + digit;`
   c. `N = N / 10;`
4. `cout << (original == reverse ? "YES" : "NO");`

The extra variable is the whole insight: you cannot compare against something you have
already mutated. Notice the same shape in any problem that needs "before and after" —
save the value, transform, compare.

## 4. Dry run

`N = 1221`

| step | `N` before | `digit` | `reverse` | `N` after |
| --- | --- | --- | --- | --- |
| 1 | 1221 | 1 | 1 | 122 |
| 2 | 122 | 2 | 12 | 12 |
| 3 | 12 | 2 | 122 | 1 |
| 4 | 1 | 1 | 1221 | 0 |

`original = 1221 == reverse = 1221`, so `YES`.

`N = 1234`

| step | `N` before | `digit` | `reverse` | `N` after |
| --- | --- | --- | --- | --- |
| 1 | 1234 | 4 | 4 | 123 |
| 2 | 123 | 3 | 43 | 12 |
| 3 | 12 | 2 | 432 | 1 |
| 4 | 1 | 1 | 4321 | 0 |

`4321 != 1234`, so `NO`.

`N = 100`

| step | `N` before | `digit` | `reverse` | `N` after |
| --- | --- | --- | --- | --- |
| 1 | 100 | 0 | 0 | 10 |
| 2 | 10 | 0 | 0 | 1 |
| 3 | 1 | 1 | 1 | 0 |

`1 != 100`, so `NO`. The two zeros produced no positional growth because `0 * 10 + 0`
is still `0`; the `1` then lands in the units place.

`N = 0`: loop body never runs, `reverse = 0`, `0 == 0`, so `YES`.

## Progressive hints

1. Which digit do you read first, and which position should it end up in? (last digit
   read goes to the most significant position of the reverse)
2. What happens to `N` after the loop? (it becomes `0`) So what must you save?
3. How do you shift a decimal number one place left? (`* 10`) How do you append a digit?
   (`+ d`)
4. What should `reverse` start at so appending works? (`0`; `0*10 + d == d`)
5. Why does `100` correctly come out `NO`? (trailing zeros collapse to nothing, so the
   reverse is `1`; the asymmetry is real, not a bug)
6. What is the largest possible reverse of an `int` input? (`7463847412` for
   `2147483647`) Does that fit in `int`? (no)

## Traps

- Forgetting to save `original`, then comparing `0 == reverse`.
- Writing `reverse = reverse + digit * 10` — appends in the wrong place and destroys the
  earlier digits. The multiply applies to the *existing* reverse.
- Reading the digits with `while (N >= 0)` — infinite loop once `N` reaches `0`.
- Believing `int` is enough because the input is `int`. The reverse can have the same
  digit count but a larger leading digit, so it overflows `int` near `2.1e9`.
- Trying to preserve leading zeros in an integer. You cannot; use a string if the task
  requires printing them.
- Printing `YES`/`NO` in lowercase, or adding punctuation, when the judge is exact.
- Confusing this with the "reverse and print" task — the `cout << reverse` line is
  commented out on purpose.

## Self-check

- Reconstruct the reverse of `9070` by hand: `0, 7, 0, 9` -> `0 -> 7 -> 70 -> 709`. Is
  `9070` a palindrome? (no)
- Explain why the algorithm visits each digit exactly once.
- Rewrite the comparison as a string two-pointer test and argue they agree for positive
  input.
- Find the smallest `int` whose numeric reverse overflows `int`. (The reverse's leading
  digit is `N`'s last digit, so it must be `>= 3`; the smallest is `1000000003`, whose
  reverse is `3000000001 > 2147483647`.)
- State the invariant of the loop in one sentence.
