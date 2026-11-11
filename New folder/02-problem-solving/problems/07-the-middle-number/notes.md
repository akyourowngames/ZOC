# Deep Notes

## Core logic

For three distinct values the median is the one value that has one smaller and
one larger neighbour. That gives a direct predicate:

```text
between(x, p, q)  <=>  (p < x && x < q) || (q < x && x < p)
```

The predicate must accept both orientations, because the outer pair can be
given in either order. Applying it to `B`, then to `A`, leaves `C` as the only
remaining candidate.

## Code walkthrough

1. `int A, B, C; cin >> A >> B >> C;` — three values in input order.
2. `if ((A < B && B < C) || (C < B && B < A))` — two ways for `B` to sit
   between the outer values. `&&` groups are joined by `||`; the outer
   parentheses make the whole disjunction the `if` condition.
3. `cout << B;` — first branch output.
4. `else if ((B < A && A < C) || (C < A && A < B))` — the same predicate with
   `A` as the middle candidate. Note the inner pairs change accordingly.
5. `else { cout << C; }` — the fallback. Justified only when values are
   distinct.
6. `return 0;` — one number, no newline.

Total: up to four short-circuit comparisons in the first test, two more in the
second on failure.

## Why it works

For three distinct values exactly one is the median. If that value is `B`, one
of `A < B < C` or `C < B < A` holds, so branch 1 fires. If it is `A`, one of
`B < A < C` or `C < A < B` holds, so branch 2 fires. Since branch 1 failing
rules out `B` and branch 2 failing rules out `A`, only `C` remains, and it must
be the median. Every output is therefore the median and exactly one is printed.

The argument uses "exactly one is the median", which is false with duplicates:
`3 3 5` has two copies of the median value and the branch logic silently
returns the maximum instead.

## Complexity

Constant work: at most six comparisons, one write. O(1) time, O(1) space. The
sorting variant is also effectively O(1) here (three elements, at most three
comparisons) but would be O(n log n) in general.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `9 2 6` | `6` | README sample, fallback branch |
| `1 2 3` | `2` | ascending, `B` between |
| `3 2 1` | `2` | descending, `B` between |
| `2 1 3` | `2` | `A` between |
| `2 3 1` | `2` | `A` between, other orientation |
| `3 1 2` | `2` | fallback, `C` is median |
| `-5 -1 -3` | `-3` | negatives ordered normally |
| `3 3 5` | `3` under sorted-median | code prints `5` (limitation) |
| `5 5 3` | `5` under sorted-median | code prints `3` (limitation) |
| `7 7 7` | `7` | all equal; any answer is `7`, so code is fine |

All six orderings of `1 2 3` return `2`; each was traced through the branches
and the program was run on the descending and fallback cases.

## Common mistakes

- Testing only the ascending orientation of "between".
- Applying the predicate to `B` and then to `C`, which leaves the wrong
  fallback.
- Using `A < B < C`, which in C++ parses as `(A < B) < C` — a `bool` compared
  with an `int`, usually `1 < C` or `0 < C`. It compiles and is nonsense.
- Confusing median with mean: `9 2 6` gives `6`, not `5.67`.
- Treating the second input as the middle by position.
- Assuming ties are impossible when the statement does not say so.

## Variants and follow-ups

- **Sorting version:** `int v[] = {A,B,C}; sort(v, v+3); cout << v[1];` — needs
  `<algorithm>`, handles duplicates under the sorted-median definition.
- **Branchless median:** `max(min(A,B), min(max(A,B), C))`; worth deriving once
  to see that median is "the max of the mins".
- **General `n`:** `nth_element` (O(n) average) or sort (O(n log n)).
- **Median of a stream:** two heaps; the natural follow-up once loops and
  containers are familiar.
- **Distinctness check:** `A != B && B != C && A != C` before relying on the
  three-branch logic.

## Key takeaways

1. "Between" is a disjunction of two ordered comparisons; write both.
2. Fallback branches are claims that must be proven from the cases excluded.
3. Sorting converts "find the k-th" into an index, at the cost of including a
   header and losing the explicit case analysis.
4. Tie handling is a specification question first and a coding question second.

## Current-code review

For three **distinct** integers the program is correct: all six orderings of
`1 2 3` were traced and the runs `9 2 6`, `3 2 1` and `2 3 1` return the
median. There is no arithmetic or output-format bug.

The defect appears as soon as duplicates are allowed, which the README flags
as an assumption rather than a guarantee:

1. **Ties return the wrong value.** With input `3 3 5` the two strict predicates
   both fail (`3 < 3` is false) and the program prints `C = 5`, the maximum.
   With `5 5 3` it prints `3`, the minimum. Under the usual definition (sort
   the three values, take position 1) the answers are `3` and `5`. Verified by
   running both inputs.
2. **The failure is silent.** No crash, no diagnostic: the output is a plausible
   number from the input. That makes it worse than a runtime error, because a
   weak test set would not catch it.
3. **The `else` comment is missing.** A one-line comment stating "requires
   distinct values" would document the assumption at the point where it is
   used. If this solution is meant to be general, replace the branch chain
   with the sort-based median, or add an explicit tie rule to the statement.

No other issues: output contains only the number.
