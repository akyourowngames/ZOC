# Deep Notes

## Core logic

`max(A, B)` can be written as `A < B ? B : A`. The solution is that expression
in statement form: test `A < B`, print `B` when it holds, print `A` otherwise.
The `else` branch correctly covers `A > B` and `A == B`, so ties need no extra
code and cannot produce two lines of output.

## Code walkthrough

1. `int A; int B;` — two separate declarations; either style is fine.
2. `cin >> A >> B;` — reads two whitespace-separated integers. `A` receives
   the first token, `B` the second; order matters.
3. `if (A < B) {` — the only condition. Note it tests `A`, not `B`; testing
   `B > A` is equivalent, but mixing the two forms is how branch pairs get
   inverted.
4. `cout << B;` — the larger value when `B` is strictly bigger. There is a
   trailing space after the semicolon in the source; it sits outside the
   string and has no effect.
5. `else { cout << A; }` — the remaining case: `A >= B`.
6. `return 0;` — normal termination.

No newline is printed. For a single-number answer most judges accept that,
though ending output with `'\n'` is the safer habit.

## Why it works

The integers are totally ordered, so exactly one of `A < B`, `A == B`,
`A > B` holds. The `if` claims the first; the `else` claims the union of the
other two. In the first case `B` is strictly larger; in the union case `A` is
the larger or tied, which is still a correct answer. Hence the printed value
is always a maximum and is always printed exactly once.

## Complexity

One comparison, one write: O(1) time, O(1) extra space. No branch depends on
the magnitude of the numbers.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `8 13` | `13` | README sample, `A < B` |
| `-4 -9` | `-4` | README sample, negative order |
| `5 5` | `5` | tie, `else` prints `A` |
| `0 0` | `0` | tie at zero |
| `-1 0` | `0` | zero is greater than any negative |
| `0 -1` | `0` | `0 < -1` false, prints `A = 0` |
| `2147483647 -2147483648` | `2147483647` | extremes of `int`, no arithmetic performed |
| `-2147483648 -2147483648` | `-2147483648` | smallest `int`, tie |

## Common mistakes

- Printing `A` inside `if (A < B)` — the branches are swapped.
- Writing `if (A = B)`, which assigns and then tests truthiness.
- Using `else if (A > B)` without a final `else`: ties print nothing, and the
  judge sees an empty output.
- Reaching for `(A + B + abs(A - B)) / 2` as a "clever" maximum: it overflows
  near `INT_MAX` and is far harder to verify.
- Forgetting that `-4 > -9`; students who compare digit strings get this wrong.
- Printing a sentence, a comma, or both numbers.

## Variants and follow-ups

- **`std::max(A, B)`** after `#include <algorithm>`: identical result, less
  typing, no control flow to trace.
- **Greater of three:** extend to a running maximum
  (`m = A; if (B > m) m = B; if (C > m) m = C;`), which scales to `n` values.
- **Index of the maximum:** keep the value *and* the position; ties then need
  an explicit rule (first or last occurrence).
- **Return a value instead of printing:** write `int maxOf(int a, int b)` and
  reuse it; this is the first step from scripts to functions.
- **Branchless:** `max = A ^ ((A ^ B) & -(A < B))`; interesting, not clearer.

## Key takeaways

1. One test plus `else` is a complete two-way decision; the second test is
   redundant and a common source of tie bugs.
2. Pick the condition whose true-branch prints the value you can name, and let
   `else` absorb equality.
3. Number order, not digit order, decides comparisons — including negatives.
4. The answer is a value; messages belong to console demos, not submissions.
5. Missing trailing newlines and stray spaces in the source are cosmetic here,
   but adopting `<< '\n'` as a habit avoids future formatting surprises.
