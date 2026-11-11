# How to Think About It

## 1. Restate the task

Decide whether the decimal string of `N` is equal to its own reversal. Output a
boolean, not a number.

Two observations sharpen it immediately:

- "Reads the same backwards" is a statement about *positions*, not digits, so
  reversing and comparing is a faithful test.
- The test is symmetric: `reverse(N) == N` exactly when the first digit equals
  the last, the second equals the second-to-last, and so on.

## 2. Spot the pattern

I already know how to reverse a number (folder `28`). A palindrome check is that
procedure followed by `==`. The pattern is **transform-then-compare**.

The only new hazard is state: the reverse procedure mutates `N` until it is `0`.
After the loop the original is gone. So the algorithm needs one extra variable
holding a snapshot taken before any mutation.

Contrast with the digit sum (folder `26`): there, no comparison was needed, so
no copy was needed. The need for a copy is a signal that the problem requires
information about the input *after* the traversal.

## 3. Derive the algorithm
1. Read `N`.
2. `original = N` — the snapshot.
3. `reverse = 0`.
4. `digit = N % 10`.
5. `reverse = reverse * 10 + digit`.
6. `N = N / 10`.
7. Repeat 4–6 while `N > 0`.
8. If `reverse == original`, print `YES`; else print `NO`.

Step 2 must precede step 4. Anywhere later and it captures a partly destroyed
number, which is the single most common bug in this problem.

## 4. Dry run

**`N = 1221`** (palindrome)

| iteration | `N` | `digit` | `reverse` | `N` after `/10` |
| --- | --- | --- | --- | --- |
| 1 | 1221 | 1 | 1 | 122 |
| 2 | 122 | 2 | 12 | 12 |
| 3 | 12 | 2 | 122 | 1 |
| 4 | 1 | 1 | 1221 | 0 |

`reverse = 1221`, `original = 1221` → equal → `YES`.

**`N = 1234`** (not a palindrome)

| iteration | `N` | `digit` | `reverse` | `N` after `/10` |
| --- | --- | --- | --- | --- |
| 1 | 1234 | 4 | 4 | 123 |
| 2 | 123 | 3 | 43 | 12 |
| 3 | 12 | 2 | 432 | 1 |
| 4 | 1 | 1 | 4321 | 0 |

`reverse = 4321 != 1234` → `NO`.

**`N = 1000`** — the trap case

| iteration | `N` | `digit` | `reverse` | `N` after `/10` |
| --- | --- | --- | --- | --- |
| 1 | 1000 | 0 | 0 | 100 |
| 2 | 100 | 0 | 0 | 10 |
| 3 | 10 | 0 | 0 | 1 |
| 4 | 1 | 1 | 1 | 0 |

`reverse = 1 != 1000` → `NO`. Note that the multiset `{1,0,0,0}` is identical
on both sides; only the order differs. And `1001` would be `YES`, since the
zeros would land back in the middle.

**`N = 0`** — one iteration, `reverse = 0`, `original = 0` → `YES`.

## Progressive hints

1. Which earlier problem already reverses digits? What is missing to turn it
   into a comparison?
2. After the reversal loop finishes, what does `N` hold? If you need the input,
   when must you copy it?
3. Do you need to compare digit by digit, or is a single integer comparison
   enough?
4. What is printed for `N = 1000`, and why does that answer feel surprising?
5. Optional twist: can you decide the answer by reversing only *half* the
   number? (Yes — that version cannot overflow, see [`notes.md`](./notes.md).)

## Traps

- **Saving the original after the loop.** `original = N` placed below the loop
  saves `0`, and the program prints `NO` for everything except `0`.
- **Comparing the wrong things** — `N == reverse` after `N` was consumed by the
  loop compares `0 == reverse`.
- **Forgetting that `1000` is not a palindrome.** Digit-set equality is not
  positional equality.
- **Overflow.** Reversing a 10-digit number can exceed `INT_MAX`, and the
  comparison then uses a garbage value. The `N <= 2 147 483 647` bound does not
  protect you.
- **Lowercase output.** `Yes` / `yes` will be judged wrong if `YES` is
  required.
- **Assuming negative numbers are excluded.** `-121` yields `YES` here; if the
  statement forbids negatives, guard against them explicitly.

## Self-check

- Is `0` a palindrome? (Yes, one digit.)
- Is `10`? (No: reverse is `1`.)
- Is `1001`? (Yes.)
- How many iterations for `N = 1221`? (Four, one per digit.)
- Which single line must move if you wanted to reuse the loop to also print the
  digit count? (Nothing moves; a `count++` inside the body is enough.)
- If `int` overflow worries you, what is the minimal change? (`long long
  reverse`.)
