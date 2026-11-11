# Deep Notes

## Core logic

Every integer is congruent to `0` or `1` modulo `2`. `N % 2 == 0` selects the
first class, `else` covers everything else. There is no third case: the
integers are partitioned, so one test is both necessary and sufficient.

For negative numbers C++ uses truncated division, so the remainder carries the
sign of the left operand: `-3 % 2 == -1` and `-4 % 2 == 0`. The comparison is
still correct because it asks only "is this zero?", not "is this one?".

## Code walkthrough

1. `int N; cin >> N;` — one read. Uppercase `N` is just a name; consistency
   matters more than case here.
2. `if (N % 2 == 0) {` — compute the remainder, then compare with `0`. The
   parentheses hold the condition; the braces hold the branch body.
3. `cout << "N is even.";` — prints the two characters `N`, a space, `is even.`
   inside a sentence. Note this is a literal `N`, not the value of the
   variable: a reader never learns the number.
4. `} else {` — no condition; runs for every non-even integer.
5. `cout << "N is odd.";` — same literal-text problem.
6. `return 0;` — standard exit status.

## Why it works

`%` is the remainder of truncated integer division: `N = q*2 + r` with
`|r| < 2`, so `r` is one of `-1, 0, 1`. `r == 0` happens exactly when `2`
divides `N`, which is the definition of even. All other integers are odd, and
`else` handles them. Zero satisfies `0 = 0*2 + 0`, hence even.

## Complexity

One modulo and one comparison, then one write: O(1) time, O(1) space. On real
hardware `% 2` compiles to a bit test or shift; the cost is one instruction.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `8` | `even` | `8 % 2 == 0` (README sample) |
| `7` | `odd` | `7 % 2 == 1` (README sample) |
| `0` | `even` | zero is divisible by `2` |
| `1` | `odd` | smallest positive odd |
| `-3` | `odd` | `-3 % 2 == -1`, still not zero |
| `-4` | `even` | `-4 % 2 == 0` |
| `2147483647` | `odd` | largest `int`, odd |
| `2` | `even` | even and positive, no remainder |

## Common mistakes

- Writing `if (N % 2 = 0)`; the compiler rejects it, or with the wrong
  surrounding context it silently assigns.
- Writing `if (N % 2 == 1)` and then failing on negative inputs only.
- Printing both branches (missing `else`) or dropping the braces and adding a
  second statement that always runs.
- Copying the sentence style from a console demo into a judge submission.
- Forgetting that `endl`/`"\n"` is required between competing outputs in
  larger programs; a missing newline merges `evenodd`.
- Using `double` for `N`, where `%` is invalid and rounding destroys parity.

## Variants and follow-ups

- **Three-way classification:** also test divisibility by `3` or `5`, then a
  chain of `if` / `else if` / `else` is needed and branch order starts to
  matter.
- **Sign and parity:** read the sign with `N < 0` and print `negative even`
  etc.; the parity test is unchanged.
- **Parity of a sum/product:** `(a + b) % 2` is `(a%2 + b%2) % 2`; this
  shortcut reappears in number-theory problems.
- **Bit test:** `(N & 1) == 0` is the same test for two's-complement integers,
  and explains why `% 2` is cheap.

## Key takeaways

1. Divisibility is a remainder question, and parity is divisibility by `2`.
2. When the cases partition the input space, `else` needs no condition.
3. Compare remainders with `0`, never with `1`, if negatives are allowed.
4. The printed string is part of the answer; a sentence can be a wrong answer.

## Current-code review

The condition is correct (`N % 2 == 0` fails only for odd `N`, including
negatives), but the output contradicts the README:

1. **Wrong strings.** The README examples require `even` / `odd`; the code
   prints `N is even.` / `N is odd.`. A judge comparing tokens rejects both
   lines. Verified run: input `8` prints `N is even.`.
2. **Literal `N`.** Even if the task wanted a sentence, the letter `N` is
   hard-coded instead of the value; `8` would produce `N is even.`, not
   `8 is even.`. The variable is never printed anywhere.
3. **Trailing period.** Punctuation is part of the exact output; `even.` is
   not `even`.
4. **Missing newline.** There is no `'\n'` after either string, so the shell
   prompt ends up on the same line. Harmless for most judges but sloppy for a
   published example.

Intended judge-ready form:

```cpp
if (N % 2 == 0) cout << "even";
else            cout << "odd";
```
