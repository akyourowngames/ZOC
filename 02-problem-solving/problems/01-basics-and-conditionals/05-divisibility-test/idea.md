# How to Think About It

## 1. Restate the task

Two numbers, `N` and `K`. Decide: does `K` divide `N` evenly? Say `YES` or
`NO`. Nothing else goes into the output.

## 2. Spot the pattern

The word "divisible" appears in many problems, and it always reduces to the
same test: the remainder after dividing by `K` is zero. This is a **predicate**
problem: compute a true/false value, then translate it into the required token.

## 3. Derive the algorithm

1. Read `N` and `K` in that order.
2. If `K == 0`, the question is meaningless; the statement guarantees this
   input does not occur, so no branch is needed in the judged solution.
3. Compute `N % K`.
4. If it equals `0`, print `YES`; otherwise print `NO`.
5. Print nothing else, not even a newline plus a retry prompt.

An equivalent single-expression version:
`cout << (N % K == 0 ? "YES" : "NO");`.

## 4. Dry run

Input `N = 20`, `K = 5`:

| Step | Value |
| --- | --- |
| `20 % 5` | `0` |
| `0 == 0` | `true` |
| printed | `YES` |

Input `N = 22`, `K = 5`:

| Step | Value |
| --- | --- |
| `22 % 5` | `2` |
| `2 == 0` | `false` |
| printed | `NO` |

Input `N = 3`, `K = 9`:

| Step | Value |
| --- | --- |
| `3 % 9` | `3` (dividend smaller than divisor) |
| `3 == 0` | `false` |
| printed | `NO` |

Input `N = -15`, `K = 5`: `-15 % 5` is `0` (the quotient is `-3`), so `YES`.

## Progressive hints

1. How do you check "does 5 divide 20" without a calculator? You subtract 5
   repeatedly and see whether you land exactly on 0. That landing point is the
   remainder.
2. Which operand goes on which side of `%`? The question is "is N a multiple
   of K", so `N` is the dividend.
3. Turn the numeric test into text with a plain `if`/`else` first; a ternary is
   a later refinement.
4. Test a number smaller than `K`, a number equal to `K`, and a negative
   number.
5. Copy the tokens `YES` and `NO` from the statement — case matters.

## Traps

- **Reversed operands.** `K % N` answers a different question; for `20 5` it
  happens to be `0` as well, which hides the bug until a case like `5 20`.
- **Zero divisor.** `N % 0` is undefined; the process dies with a hardware
  exception on x86.
- **Float division.** `(double)N / K` then comparing to a rounded value is
  fragile for large integers; `%` is exact.
- **Wrong token case.** `yes`, `Yes` and `YES ` (trailing space) are all
  different from `YES`.
- **Extra output.** Printing the remainder "for debugging" turns `YES` into a
  wrong answer.
- **`INT_MIN % -1`.** Even in 64-bit code, `LLONG_MIN % -1` is undefined
  behaviour because the quotient is not representable. Extremely unlikely as a
  judge case, but it is the one arithmetic hole in a pure `%` test.

## Self-check

- For `N = 5`, `K = 20`, what should the answer be, and what does `K % N` give?
- Is `0` divisible by `7`? Is `7` divisible by `0`?
- What does your code print for `N = K`? (`YES` — every non-zero number
  divides itself.)
- If the statement wanted `YES`/`NO` on one line with a newline, does yours?
