# Deep Notes

## Core logic

One scalar `largest` summarises the whole digit prefix scanned so far. Each iteration
extracts the next digit and, if it is bigger, replaces the summary. No digit needs to be
stored because `max` is associative and commutative: the fold order is irrelevant.

The initialization `largest = 0` is valid because every decimal digit is `>= 0`. More
generally, initialize a maximum with the smallest possible value of the domain:
`0` for digits, `INT_MIN` for signed ints, `-inf` for reals.

## Code walkthrough

```cpp
int N, digit, largest;
cin >> N;             // read the value
digit = 0;            // dead store; assigned inside the loop
largest = 0;          // valid lower bound for a decimal digit

while (N > 0) {
    digit = N % 10;              // isolate the rightmost digit
    if (digit > largest) {       // strict comparison
        largest = digit;         // keep the new best
    }
    N = N / 10;                  // consume the digit
}
cout << largest;                 // bare digit
```

- `digit = 0;` is redundant but harmless; it only signals a style of "declare then
  initialize everything".
- The braces around the single-statement `if` body are a good habit; they prevent the
  classic "added a second line and it escaped the if" bug.
- The update uses `>` rather than `>=`. Both are correct for the maximum value; `>` avoids
  useless writes and is the standard form.
- `cout << largest;` prints an `int`, so `0..9` render as single characters — this is not
  a `char` and cannot print a stray symbol.

## Why it works

Invariant: immediately before each iteration, `largest` equals the maximum of the digits
already removed from the original number, and `N` holds the unprocessed prefix.

- Base: zero digits removed, and the maximum over an empty set is the initial bound `0`,
  which is `<=` every digit, so the invariant is consistent.
- Step: digit `d` is removed; the new maximum over the extended set is
  `max(largest, d)`, exactly what the `if` computes.
- Exit: `N == 0`, so every digit was removed and `largest` is the maximum over all digits.

Existence is guaranteed because the domain is `N >= 1`, so at least one digit is
processed and the initial bound never survives alone. For `N = 0` the bound itself is
printed, and it happens to be the right answer.

## Complexity

- Time: O(d) with `d <= 10` for `int`; each iteration is O(1).
- Space: O(1) — three integers.
- Lower bound: you must examine every digit, so O(d) is optimal.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| 7 | 7 | single digit |
| 10 | 1 | zero never beats one |
| 1000 | 1 | zeros only |
| 5831 | 8 | ordinary case |
| 9999 | 9 | all tied at the max |
| 2147483647 | 8 | largest digit of `INT_MAX` |
| 1000000000 | 1 | nine zeros cannot beat the leading 1 |
| 0 | 0 | loop skipped, bound printed — correct by luck |
| -5831 | 0 (current), undefined by statement | loop never runs on negatives |

## Common mistakes

- Starting at `9` (nothing can beat it) or at `1` when digits may all be `0`.
- Copying the minimum-digit code without flipping `>` to `<` and `0` to `9`.
- Comparing the shrinking `N` instead of `digit`.
- Forgetting to advance `N` in the loop.
- Storing digits into an array "for later" and then scanning twice — no benefit here.
- Believing a zero digit is material because it matters for products; for a maximum it is
  just a small candidate.
- Using `%` on negatives and being surprised by a negative remainder in C++ (`-7 % 10`
  is `-7`, not `3`).

## Variants and follow-ups

- **Smallest digit**: initialize to `9`, flip the comparison, and note that `N = 0` breaks
  the naive version (see folder 20).
- **Second largest digit**: keep two scalars, `best` and `second`, with care for ties.
- **Digit frequency array**: `int freq[10] = {0};` then `freq[d]++`; answers every
  "which digit / how many" question at once with O(1) space because the digit alphabet is
  fixed.
- **Largest digit of a string**: needed when `N` can have more than 19 digits; no
  arithmetic required, just `max` over characters.
- **Largest digit over a range**: combine with digit DP for `1..N` counting problems.
- **Leading digit**: a different question — keep updating a variable so the last
  assignment wins, or compute `d` when `N < 10`.

## Key takeaways

- Choose the fold's identity from the domain's extremes, not from habit.
- `max`/`min` folds are associative, which is exactly why one scalar suffices.
- The digit skeleton is stable across six or seven different problems: only the fold body
  changes.
- A redundant initialization (`digit = 0`) is harmless noise, but dead state is worth
  deleting on review.

## Current-code review

No defect inside the stated domain. The code is correct for every positive `int` and also
correct for `N = 0` (prints `0`).

Two out-of-domain observations only:

1. `digit` is declared and assigned `0` before the loop but is always overwritten inside.
   Pure dead store — a cleanup, not a bug.
2. For negative `N` the loop never executes, so the program prints `0`, which is not a
   digit of the input. The statement says "positive integer", so this is not a
   contradiction; if negatives must be supported, process `abs(N)` and keep `int` overflow
   in mind for `INT_MIN` (`-INT_MIN` overflows; use `long long`).
