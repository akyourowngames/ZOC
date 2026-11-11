# Number Analysis with Functions

**Pattern:** Functional decomposition, primality, sqrt divisor pairing | **Difficulty:** Easy

## Problem statement

Read one integer `N` and report three facts about it:

1. whether `N` is prime;
2. how many positive divisors `N` has;
3. whether `N` is perfect.

For `N >= 1`:

- prime means exactly two positive divisors (`1` and `N`);
- the divisor count includes `1` and `N`;
- perfect means the proper divisors sum to `N`, i.e. `sigma(N) = 2N`.

This folder is the refactored variant of `01-number-analysis`: each rule lives
in its own function and `analyzeNumber` combines them.

**Output contract used here.** A strict judge compares tokens, so the target
is one line with three space-separated values:

```text
false 4 true
```

for `N = 6`. The committed `main` prints a labelled, three-line report:

```text
Prime: false
Divisors: 4
Perfect: true
```

That is readable for a human and wrong for a token-comparing judge. The
arithmetic is the same in both layouts; only presentation differs. If the
original task genuinely asked for labels, the labelled layout is correct, but
nothing in the repository states that. The docs assume the strict token
contract, consistent with folder 01, and `notes.md` records the mismatch.

## Input and output

| Item | Target format | Current format |
|---|---|---|
| Input | one line, integer `N` | same |
| Output | `prime divisors perfect` on one line | three labelled lines |
| Prime token | lowercase `true` / `false` | `Prime: true` / `Prime: false` |
| Divisor token | decimal integer | `Divisors: 4` |
| Perfect token | lowercase `true` / `false` | `Perfect: true` |
| Final newline | yes | absent after the last line |

No prompts, no extra whitespace, no explanations. Labels, colons, and line
breaks are content to a judge, not decoration.

## Examples

`N = 6`: divisors `1, 2, 3, 6`; proper sum `1+2+3 = 6`.

| Layout | Output |
|---|---|
| Target | `false 4 true` |
| Current | `Prime: false` / `Divisors: 4` / `Perfect: true` |

`N = 28`: `false 6 true`, because `1+2+4+7+14 = 28`.

`N = 2`: `true 2 false`; `2` is prime but its only proper divisor is `1`.

`N = 1`: `false 1 false`; one divisor, and the proper-divisor sum is `0`.

`N = 12`: `false 6 false`; divisors `1,2,3,4,6,12`, proper sum `16`.

`N = 36`: `false 9 false`; nine divisors, proper sum `55`.

## Constraints and assumptions

Practice constraints (not specified by a judge):

- `1 <= N <= 10^9`, one test case.
- `N` fits in `int`.
- The strict token output is the intended contract, as argued above.
- If `N` exceeds `10^9`, use `long long` for both `N` and divisor sums; the
  current `int` loops would also be far too slow.

The original statement is not in the repository, so the output layout and the
bounds are assumptions used for analysis. The code itself runs for `N = 0`
and negatives but with meaningless answers; those inputs are out of domain.

## Approach at a glance

`isPrime`, `countDivisors`, and `isPerfect` each answer one question and
`analyzeNumber` only prints. This separation is the point of the folder: each
function can be tested in isolation before the output routine is trusted.

Two properties are required for contest correctness:

- `isPrime` must reject `N < 2` explicitly, because the loop cannot do it.
- Divisor scans must stop at `sqrt(N)` and count the square root once.

The current code has the first property and lacks the second. Each helper is
also `O(N)`, and `isPerfect` recomputes the full divisor scan that
`countDivisors` just performed.

| Time | Space |
|---|---|
| `O(N)` per helper as written; `analyzeNumber` is `O(N)` overall | `O(1)` |
| `O(sqrt N)` after divisor pairing; `O(1)` | `O(1)` |

## Solution

[`solution.cpp`](./solution.cpp)

## What this teaches

- One function, one responsibility: computation is testable; printing is not.
- Presentation can be a correctness bug in competitive programming even when
  the numbers are right.
- A guard for `N < 2` is simpler and safer than special-casing inside a loop.
- The same divisor pairing optimizes primality, divisor count, and perfection.
- Recomputing a scan in a second helper silently doubles the running time.

## Contest checklist

- [ ] Confirm whether the judge wants tokens or labels; default to tokens.
- [ ] Print all three answers once, in the specified order, on one line.
- [ ] Reject `N < 2` in `isPrime`; verify `isPrime(0)`, `isPrime(1)`,
      `isPrime(2)`.
- [ ] Stop divisor loops at `i <= n / i` and count a square root once.
- [ ] Exclude `N` from the proper-divisor sum, and reject `N = 0`.
- [ ] Use `long long` for `sigma` when `N` can be large.
- [ ] Test `1`, `2`, `6`, `12`, `28`, `36`, and a large prime.
- [ ] Remove labels, debug output, and trailing spaces.
- [ ] End with a newline and return `0` from `main`.
