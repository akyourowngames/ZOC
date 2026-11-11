# How to Think About It

## 1. Restate the task

Apply `f(N) = sum of decimal digits of N` repeatedly until the result has one
digit. Print that fixed point. Because `f(N) < N` for every `N >= 10`, the
process must stop; the question is only how to structure the repetition.

## 2. Spot the pattern

I already have `f` — it is the whole of folder `26`. The new question is:
**how do I repeat an algorithm whose output becomes its next input?**

That is a *fixed-point loop*: repeat the transformation until a stopping
predicate holds. The stopping predicate is `N < 10`, i.e. "already a single
digit", which is the negated form of the loop condition `N >= 10`.

So the structure is a loop whose body is itself a loop:

```text
while (not yet a single digit)
    N = digit_sum(N)
```

The outer loop does not count anything and does not iterate over a collection.
It iterates over *states* of the same value. Recognising this shape is worth
more than the specific problem — the same skeleton solves Collatz, GCD by
subtraction, and Newton iteration.

## 3. Derive the algorithm
1. Read `N`.
2. While `N >= 10`:
   1. `sum = 0`.
   2. While `N > 0`: extract `digit = N % 10`, `sum += digit`, `N /= 10`.
   3. `N = sum`.
3. Print `N`.

Three details carry the correctness:

- `sum` must be reset to `0` at the start of *every* outer round; otherwise the
  previous round's total is carried in and the numbers stop shrinking.
- `N = sum` must be assigned *after* the inner loop finishes, since the inner
  loop has reduced `N` to `0` and would otherwise be fed a destroyed value.
- The outer condition is checked *before* the first round, because a
  single-digit input needs zero rounds. A `do-while` would add one pointless
  round (`9 -> 9`, harmless but conceptually wrong) — and for `0` it would
  produce `0` anyway.

## 4. Dry run

**`N = 5329`**

| round | `N` at start | inner pass: digits | `sum` | `N` after inner | `N >= 10`? |
| --- | --- | --- | --- | --- | --- |
| 1 | 5329 | 9, 2, 3, 5 | 19 | 19 | true (19) |
| 2 | 19 | 9, 1 | 10 | 10 | true (10) |
| 3 | 10 | 0, 1 | 1 | 1 | false |

Output `1`.

Inner pass detail for round 1: `5329 → digit 9, sum 9, N 532`; `digit 2, sum
11, N 53`; `digit 3, sum 14, N 5`; `digit 5, sum 19, N 0`. Then `N = 19`.

**`N = 38`**

| round | `N` | `sum` | next `N` |
| --- | --- | --- | --- |
| 1 | 38 | 11 | 11 |
| 2 | 11 | 2 | 2 |
| — | 2 | — | stop (`2 < 10`) |

Output `2`.

**`N = 0`**

Outer test `0 >= 10` is false on entry, loop body never runs, `0` is printed.
Zero rounds.

**`N = 9`**

Zero rounds, prints `9`.

**`N = 10`**

One round: `1 + 0 = 1`, then `1 < 10`, stop. Prints `1`.

## Progressive hints

1. Write down the sequence for `5329` by hand. How many rounds does it take?
2. Each round is exactly the digit-sum program you already wrote. What should
   the outer loop test?
3. Where must `sum = 0` live — inside or outside the outer loop? Why?
4. What happens if you forget `N = sum`? (The inner loop leaves `N = 0`, the
   outer test `0 >= 10` then fails, and the program prints `0` for every
   input. Silent wrong answer, no hang.)
5. Can you compute the answer without any loop? (`1 + (N-1) % 9` for `N > 0`.)

## Traps

- **Forgetting `sum = 0` inside the outer loop.** The sums accumulate across
  rounds and the value stops decreasing — often an infinite loop.
- **Forgetting `N = sum`, or placing it inside the inner loop.** Inside, the
  hand-off happens mid-computation and the digit stream is corrupted.
- **Using `do-while` for the outer loop.** Works numerically for `N >= 10` but
  is wrong in intent: zero rounds must be possible for single-digit input.
- **Confusing this with a single digit sum.** `5329` is `19`, not `1`; the
  difference is the whole problem.
- **Negatives.** `-19` skips the loop entirely and prints `-19`. Guard or take
  `abs`.
- **Assuming two rounds are always enough.** `10` needs a third round *after*
  `5329 -> 19 -> 10`.

## Self-check

- How many rounds for `999999999`? (Two: `81`, then `9`.)
- What is the maximum number of rounds for a 32-bit `int`? (Three.)
- Why is `1 + (N-1) % 9` equal to the loop result? Test with `N = 19`, `N =
  5329`, `N = 9`.
- Which line would you change to print every intermediate value? (`N = sum`
  becomes `cout << N << " -> "; N = sum;`.)
- Does the algorithm terminate for `N = 0`? (`0 >= 10` false, prints `0`.)
