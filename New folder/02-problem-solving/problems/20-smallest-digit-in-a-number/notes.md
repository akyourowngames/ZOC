# Deep Notes

## Core logic

A single scalar `smallest` summarises the smallest digit in the prefix scanned so far.
Each iteration extracts a digit and replaces the summary when the new digit is strictly
smaller. The fold `min` is associative, so streaming works: no digit must be retained.

The bound `9` is an upper bound over the digit domain (`0..9`). It is the largest legal
digit, so every extracted digit either ties or beats it, guaranteeing the first iteration
produces a real value — but only if an iteration happens.

## Code walkthrough

```cpp
int N, smallest, digit;
cin >> N;
smallest = 9;     // upper bound for a decimal digit
digit = 0;        // dead store; overwritten in the loop

while (N > 0) {
    digit = N % 10;              // rightmost digit
    if (digit < smallest) {      // strictly smaller wins
        smallest = digit;
    }
    N = N / 10;                  // consume the digit
}
cout << smallest;
return 0;
```

- `smallest = 9;` is placed before the loop, which is correct; do not move it inside, or
  every iteration would reset the answer.
- `digit = 0;` is unnecessary but harmless.
- The `if` body is braced; the comparison is strict, so ties leave the state alone.
- There is a stray blank line before `return 0;` in the source; cosmetic only.
- `cout << smallest;` prints `0..9` as a single character because the value is an `int`.

## Why it works

Invariant: before each iteration, `smallest` equals the minimum of the digits already
removed (with `9` acting as the identity/minimum over the empty set), and `N` holds the
unprocessed prefix.

- Base: zero digits removed -> minimum over an empty set is conventionally `+inf`; using
  `9` is safe because every digit is `<= 9`.
- Step: removing digit `d` extends the set, and `min(smallest, d)` is exactly the `if`.
- Exit: all digits consumed, so `smallest` is the minimum over the whole number.

The correctness argument leans on the precondition "at least one digit exists". With
`N >= 1` that holds. With `N = 0` it fails, and the algorithm returns its identity element
rather than a real answer — the standard failure mode of sentinel initialization.

## Complexity

- Time: O(d), `d <= 10` for `int`; each step is O(1).
- Space: O(1).
- Early exit: if `smallest` reaches `0` you may `break`, since no digit can be below `0`.
  In the best case that turns a scan into a few steps (`N = 20` hits the zero on the
  second iteration); the worst case is still O(d).

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| 7 | 7 | single digit; the bound is replaced |
| 909 | 0 | zero digit present -> answer 0 |
| 999 | 9 | all ties; the bound happens to be correct output |
| 5831 | 1 | ordinary case |
| 1111 | 1 | all ties at 1 |
| 1000 | 0 | zeros win |
| 2147483647 | 1 | smallest digit of `INT_MAX` |
| 0 | 0 (intended) / current code prints 9 | loop never runs |
| -5831 | 9 (current), undefined by statement | loop never runs on negatives |

## Common mistakes

- `smallest = 0` — every answer becomes `0`.
- `smallest = INT_MAX` combined with no guard: prints `2147483647` for `N = 0`, which at
  least makes the bug loud instead of silent.
- Flipping only the comparison (`<`) but keeping the maximum's bound `0`.
- Resetting `smallest` inside the loop.
- Forgetting to consume `N`.
- Believing zeros are ignorable because they do not change a sum; for a minimum they are
  decisive.
- Printing `smallest` with `char` casting that turns `0` into a NUL byte.

## Variants and follow-ups

- **Largest digit**: bound `0`, comparison `>`. See folder 19.
- **Both at once**: track `lo` and `hi` in one pass, two comparisons per digit.
- **Digit frequency array**: `int freq[10] = {0}; freq[N % 10]++;` then scan `0..9` for the
  first non-zero entry — the general answer to min/max/mode questions, at O(1) space and
  O(10) extra time, and it also handles `N = 0` if you special-case it.
- **Remove the smallest digit**: needs a second pass or a recursive digit rebuild.
- **Smallest non-zero digit**: skip `0` inside the comparison; bound stays `9`.
- **String input** for numbers with more than 19 digits: iterate characters and use
  `min` on the characters directly.

## Key takeaways

- A sentinel must be checked by a precondition, not assumed. "The loop runs at least once"
  is a real obligation.
- Choose extremum bounds from the domain's opposite end.
- `0` is the most dangerous digit: it is invisible to maxima and sums, and dominant in
  minima and products.
- One scalar per statistic is enough because `min`/`max` fold associatively.

## Current-code review

**Defect: `N = 0` prints `9`.** `smallest` is initialized to `9` and the loop
`while (N > 0)` never executes for zero, so no digit is ever examined and the sentinel is
printed as the answer. The smallest digit of `0` is `0` (its only digit). The README labels
`N` a positive integer, so this is an out-of-domain input rather than a contradiction of
the stated task — but the failure is silent and easy to trip over in testing.

Minimal fix:

```cpp
if (N == 0) { cout << 0; return 0; }
```

or, without a special case, use a "seen a digit yet" flag:

```cpp
int smallest = 9; bool seen = false;
while (N > 0) { int d = N % 10; if (!seen || d < smallest) { smallest = d; seen = true; } N /= 10; }
```

Second, out-of-domain: negative `N` also prints `9`, because the loop never runs.

Everything else is correct: strictly-positive input yields the true minimum digit, ties do
not corrupt the state, and complexity is optimal O(d) time / O(1) space.
