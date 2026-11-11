# Deep Notes

## Core logic

Two loops, two different invariants.

**Outer loop** (`while (N >= 10)`): iterate until the value is a single digit.
Invariant: `N` is the result of applying the digit-sum map some number of times
to the original input, and `N >= 10` means more rounds are required.

**Inner loop** (`while (N > 0)`): one complete digit-sum pass, exactly as in
folder `26`. Invariant: `sum` holds the sum of digits already stripped, `N`
holds the remaining digits.

**Hand-off**: `N = sum` transfers the inner loop's output into the outer loop's
state. This single line is what makes the construct a fixed-point iteration
rather than two unrelated loops.

Three preconditions for correctness:

1. `sum` is reset to `0` at the top of every outer round.
2. `N = sum` executes exactly once, after the inner loop ends.
3. The outer test is checked before the first round (`while`, not `do-while`),
   because single-digit input needs zero rounds.

Termination: for any `N >= 10` with digits `d_i`,

`N - s(N) = sum over i >= 1 of d_i * (10^i - 1)`,

and the leading digit `d_{k-1}` alone contributes `10^{k-1} - 1 > 0`, so
`s(N) < N`. Each round strictly decreases the value, and a strictly decreasing
sequence of non-negative integers cannot be infinite. Hence the loop stops, and
it stops exactly when `N < 10`.

## Code walkthrough

```cpp
int N, digit, sum;
cin >> N;                  // e.g. 5329

while (N >= 10) {          // more than one digit -> another round

    sum = 0;               // RESET: each round starts from nothing

    while (N > 0) {        // one digit-sum pass
        digit = N % 10;    //   isolate
        sum += digit;      //   accumulate
        N = N / 10;        //   consume (N hits 0 here)
    }

    N = sum;               // feed the result back in
}

cout << N;                 // single digit, or 0 for input 0
return 0;
```

The nested block is indented only to the outer level in the source file, which
makes the inner `while` look like it belongs outside — a readability defect
worth fixing mentally even though the braces are correct.

## Why it works

Define `s(n)` as the decimal digit sum. The outer loop computes
`s^k(N)` until `s^k(N) < 10`. That value is by definition the digital root.

Two facts make this well-defined:

- `s(n) < n` for all `n >= 10`, so the sequence strictly decreases and must
  reach a value below `10`.
- For `0 <= n <= 9` we have `s(n) = n`, so single digits are exactly the fixed
  points. The loop therefore stops precisely at the fixed point, never
  overshooting.

The hand-off `N = sum` is valid because `s` is a function of the *value*, and
the inner loop has already computed that value in `sum`; `N` was consumed only
as scratch space.

The digital root also has a closed form for `N > 0`:
`dr(N) = 1 + (N - 1) % 9`, with `dr(0) = 0`. Reason: `10 ≡ 1 (mod 9)`, so
`N ≡ s(N) (mod 9)`; repeated summation preserves the residue, and the single
digit in `1..9` with a given residue is unique. The `N - 1` shift maps residue
`0` to `9` instead of `0`.

## Complexity

- Outer iterations: at most 3 for 32-bit input (a 10-digit number yields at
  most `90`, then at most `18`, then a single digit).
- Inner work per round is proportional to the digits of the current value:
  `d`, then `<= 2`, then `<= 2`. Total `O(d)`.
- Space: `O(1)` — three scalars. No string conversion, no recursion.
- The closed form is `O(1)`, but it teaches nothing about loops; know both.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `5329` | `1` | `19 -> 10 -> 1`, the stated example |
| `0` | `0` | zero rounds; `0 >= 10` is false |
| `7` | `7` | zero rounds, already single digit |
| `10` | `1` | one round |
| `38` | `2` | `11 -> 2` |
| `99` | `9` | `18 -> 9` |
| `999999999` | `9` | `81 -> 9` |
| `2147483647` | `1` | sum `46`, then `10`, then `1` |
| `-19` | `-19` in this code | out of domain; no loop runs, not a digit |

## Common mistakes

- **`sum` initialised outside the outer loop.** Totals accumulate across rounds;
  `N` may stop decreasing and the loop can spin or produce a wrong digit.
- **`N = sum` placed inside the inner loop.** The digit stream is truncated at
  the first digit and the result is wrong (e.g. `5329 -> 9`).
- **Forgetting `N = sum` entirely.** The inner loop leaves `N = 0`, the outer
  test fails, and every input prints `0`.
- **`do-while` on the outside.** Semantically wrong (a single digit should need
  zero rounds); numerically harmless here, which makes it a bad habit to
  acquire.
- **Stopping after one pass.** `5329` is `19`, not `1`.
- **Recursion without a base case** in the recursive variant: `dr(n) = dr(s(n))`
  with `n < 10` as the base.
- **Mixing up the two meanings of "until a single digit":** this is a fixed
  point, not "add the digits of the answer" repeated a fixed number of times.

## Variants and follow-ups

1. **Closed form**: `N == 0 ? 0 : 1 + (N - 1) % 9` — `O(1)`, ideal for huge
   inputs read as strings (sum the digits once, then apply the formula).
2. **Recursive**: `int dr(int n) { return n < 10 ? n : dr(digitSum(n)); }` —
   same rounds, no explicit state.
3. **Print the chain** `5329 -> 19 -> 10 -> 1`, or count the rounds.
4. **Multiplicative persistence**: repeat *digit products* until one digit —
   longer chains, identical skeleton.
5. **Base `b` digital root**: `1 + (N - 1) % (b - 1)`, the general mod-`(b-1)`
   fact behind the mod-9 trick and the divisibility-by-9 test.

## Key takeaways

- Fixed-point loops: `while (not done) x = f(x);` — the body may be a whole
  algorithm.
- Reset accumulators at the correct scope; a misplaced `sum = 0` changes the
  meaning of the loop.
- Termination arguments need a decreasing measure; speed of decrease bounds the
  number of rounds.
- `while` vs `do-while` expresses "may run zero times" vs "runs at least once" —
  get that decision right even when the numbers happen to agree.

## Current-code review

The nested-loop logic is correct for the stated non-negative domain. The
following are worth recording.

**1. Negative input produces a non-digit output (domain gap).**

```cpp
while (N >= 10) { ... }
cout << N;
```

For `N = -19`, the condition `-19 >= 10` is false on entry, so the loop never
runs and `-19` is printed. The README's contract is "print a single digit".
If negative input is possible, either take `abs(N)` first or reject it. This is
a genuine contradiction between "output is one digit" and what the code emits
for a negative value.

**2. Misleading indentation (cosmetic, not a logic error).**

The inner `while (N > 0)` body is indented at the same level as the inner
`while` itself, and the closing brace is misaligned:

```cpp
        while(N > 0) {
        digit = N % 10;
        sum += digit;
        N = N / 10;
    }
```

The braces are balanced and the semantics are correct; the indentation makes
the nesting hard to verify at a glance. Since this file's whole point is nested
loops, that is a teaching defect.

**3. No whitespace around operators** (`N = N/10`, `N%10` elsewhere in the
repo) — style only.

Verified correct by trace: `5329 -> 19 -> 10 -> 1`; `0 -> 0`; `9 -> 9`;
`10 -> 1`; termination always occurs because `s(N) < N` for `N >= 10`.
