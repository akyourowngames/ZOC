# Deep Notes

## Core logic

Two nested invariants, one for the traversal and one for the count.

Traversal invariant (the digit primitive):

```cpp
digit = N % 10;   // least significant digit, in [0, 9] for N >= 0
N     = N / 10;   // N with that digit removed
```

Counting invariant:

> at the top of each iteration, `counter` equals the number of even digits
> already removed from the original number, and `N` still holds exactly the
> digits not yet examined.

`counter = 0` establishes it (nothing examined, nothing counted). Each
iteration examines one digit, conditionally increments, and shrinks `N`, which
preserves it. When `N` becomes `0` every digit has been classified, so
`counter` is the answer.

Termination: `N / 10 < N` for all `N > 0`, so `N` strictly decreases and
reaches `0` in `d` steps. The parity test cannot stall the loop because it
does not touch `N`.

Loop choice: `do-while` again, because "`N` has at least one digit" is always
true in the domain, including `N = 0`. The cost is that `0` is counted as one
even digit rather than zero digits.

## Code walkthrough

```cpp
int N, digit, counter;
cin >> N;                      // number under inspection

counter = 0;                   // identity for counting

do {
    digit = N % 10;            // 1. isolate last digit
    if (digit % 2 == 0) {      // 2. predicate
        counter += 1;          // 3. gated update
    }
    N = N/10;                  // 4. consume the digit (ALWAYS, not gated)
} while (N > 0);

cout << counter;               // 0 is a valid, expected answer
```

Line 4 is outside the `if` on purpose. It is the loop's progress step; gating
it behind the predicate would leave `N` unchanged whenever a digit was odd,
and the same odd digit would be re-tested forever.

`counter += 1` and `counter++` are identical here; `++` is idiomatic for a
plain count, `+=` for a variable amount.

## Why it works

The decimal expansion of `N` contains exactly `d` digits, and the peel loop
visits each one exactly once. Counts are additive over a partition, so
counting per digit and summing the indicators gives the total. Formally, the
answer is `sum over digits d_i of [d_i % 2 == 0]`.

Parity is preserved by the extraction because `N % 10` has the same parity as
`N` itself: `N = 10*q + N%10` and `10*q` is even, so `N` and its last digit
share parity. This is why a naive `N % 2` test would only ever see the last
digit — the loop is what exposes the rest.

For negative `N`, `digit` is negative or zero, but `digit % 2 == 0` still
correctly identifies evenness: C++ guarantees `(-a) % b == -(a % b)`, so the
magnitude decides and a sign flip cannot turn an even digit odd.

## Complexity

- Time: `O(d)`, `d <= 10` for 32-bit input. Constant work per digit: one
  modulo, one modulo for parity, one branch, one division.
- Space: `O(1)` — three scalars. No array is needed because the answer is a
  single aggregate, not per-digit data.
- If per-digit counts were required (e.g. `freq[10]`), space becomes `O(1)`
  too, since 10 is a constant.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `2481` | `3` | the stated example: 2, 4, 8 |
| `1357` | `0` | all odd; "none" is a real answer |
| `0` | `1` | one digit, and 0 is even |
| `5` | `0` | single odd digit |
| `1000` | `3` | three zero digits, all even |
| `2002` | `4` | all four digits (2, 0, 0, 2) are even |
| `-24` | `2` | out of stated domain; parity still works after truncation |
| `2147483647` | `6` | 2, 4, 4, 8, 6, 4 are even; 1, 7, 3, 7 are not |

## Common mistakes

- **Gating the `/ 10` behind the `if`.** Infinite loop on any input containing
  an odd digit — the most common failure for this problem.
- **Initialising `counter` to something other than 0**, or leaving it
  uninitialised and adding to garbage.
- **Testing `digit % 2 == 1` for oddness.** Works for non-negative digits;
  silently wrong for negatives.
- **Confusing "count of even digits" with "number of even numbers below N"** —
  a different problem entirely.
- **Expecting `0` for input `0`.** Decide the convention with the judge's
  statement, not by intuition; the code's convention counts `0` as one digit.
- **Non-terminating loop from a forgotten update**, which is indistinguishable
  from the gated-update bug above when reading quickly. Check where the `/ 10`
  sits relative to the `if`.

## Variants and follow-ups

1. **Sum of even digits**: `sum += digit` instead of `counter++`.
2. **Count odd digits**: negate the predicate; consider `digit % 2 != 0` for
   robustness.
3. **Count digit `k`**: replace the parity test with `digit == k`; the classic
   "occurrence of a digit" problem.
4. **Frequency array**: `int freq[10] = {0}; freq[digit]++;` answers every
   "how many k's" query in one pass.
5. **String approach**: `for (char c : s) if ((c - '0') % 2 == 0) ++cnt;` —
   preserves leading zeros, uses `O(d)` memory.
6. **Digit DP**: "count numbers in `[1, X]` with exactly `k` even digits" — the
   same predicate, now counted positionally over a range.

## Key takeaways

- Separate traversal from decision; the predicate and the accumulator are
  independent choices.
- The progress step must never be conditional. Only the *effect* of an
  iteration may be conditional.
- Counting starts at `0`; a zero result is data, not failure.
- `0` is an even digit and an ordinary digit — both facts bite at the boundary.
