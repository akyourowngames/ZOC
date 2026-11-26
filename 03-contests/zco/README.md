# ZCO Practice

Practice set modelled on ZCO-style tasks: one input, one small program, and a
verdict that depends on exact output and on a complexity budget that is easy to
blow with a naive loop. These folders are study material, not official ZCO
statements. Wording, constraints, and required tokens are reconstructed from
practice; always re-read the original problem before submitting anything.

The deep reasoning - number theory, digit invariants, the maximum-revenue
argument, dry runs, and judge discipline - is in
[`./ZCO-LOGIC-GUIDE.md`](./ZCO-LOGIC-GUIDE.md).

## Conventions

Each challenge folder holds up to four files:

| File | Purpose |
|------|---------|
| `README.md` | task, definitions, examples, required output |
| `idea.md` | hints and the intended thought process, deliberately incomplete |
| `notes.md` | traps, complexity, testing notes, mistakes made |
| `solution.cpp` | the current implementation, compiled as-is |

`04-max-revenue` currently has only `solution.cpp`; its statement lives in this
index and in the logic guide. Compiled output (`.exe`, `.obj`, `.pdb`, `.ilk`)
belongs in `99-build-artifacts/contests/zco/`, never beside the source.

## Problems

| # | Folder | Core task | Intended output | Pattern | Complexity | Status |
|---|--------|-----------|-----------------|---------|------------|--------|
| 01 | [01-number-analysis](./01-number-analysis/) | Decide primality, count divisors, decide whether `N` is perfect | three space-separated fields: `true`/`false`, divisor count, `true`/`false` | trial division + divisor scan | O(N) time, O(1) space | Runs, but the third field is wrong - see flag below |
| 02 | [02-digit-analysis](./02-digit-analysis/) | Digit sum, digit reversal, palindrome test | three lines: sum, reverse, `true`/`false` | digit peel, reverse accumulator | O(d) time, O(1) space | Runs, matches the intended output |
| 03 | [03-number-analysis-functions](./03-number-analysis-functions/) | Same three checks as 01, decomposed into functions | labels `Prime:`, `Divisors:`, `Perfect:` on separate lines | function decomposition | O(N) time, O(1) space | Runs, correct values, judge-hostile labels |
| 04 | [04-max-revenue](./04-max-revenue/) | Choose one ticket price to maximise `price * buyers_at_or_above_price` | one integer, the maximum revenue | brute force over candidate prices | O(N^2) time, O(N) space | Runs, but revenue can overflow `int` - see flag below |
| 05 | [05-team](./05-team/) | Count problems supported by at least two of three people | one integer | opinion sum | O(N) time, O(1) space | Scaffolded practice |
| 06 | [06-general-colonel](./06-general-colonel/) | Move the maximum to the front and minimum to the back | one integer | index calculation | O(N) time, O(1) space | Verify duplicate/extreme behavior |
| 07 | [07-next-round](./07-next-round/) | Count positive scores at least as large as rank `K` | one integer | threshold scan | O(N) time, O(1) space | Use score index `K - 1` |
| 08 | [08-I-Wanna-Be-The-Guy](./08-I-Wanna-Be-The-Guy/) | Check whether all levels are covered by two lists | exact sentence | Boolean visited array | O(N) time, O(N) space | Exact output matters |
| 09 | [09-bear-and-big-brother](./09-bear-and-big-brother/) | Simulate two different growth rates until one value is larger | one integer | direct simulation | O(years) time, O(1) space | Continue while weights are equal |
| 10 | [10-wrong-subtraction](./10-wrong-subtraction/) | Apply a digit-dependent operation K times | one integer | bounded simulation | O(K) time, O(1) space | Inspect only the last digit |
| 11 | [11-Youmu-Konpaku -and-the-duel](./11-Youmu-Konpaku%20-and-the-duel/) | Minimize actions under a damage rule | one result per test | search over candidate actions | Constraint-dependent | Verify formulas against the original statement |

`d` is the number of decimal digits of `N`, `N` the numeric bound or array
length. Complexity is per single query.

## Flags before you trust the output

**`01-number-analysis` does not print a perfect-number verdict.** In
`solution.cpp` the third field is produced by

```cpp
if (countDivisiors(N)) {
    cout << "true";
} else {
    cout << "false";
}
```

`countDivisiors` returns at least 1 for every positive `N` (1 always divides
it), so the branch is always taken and the program prints `true` for every
input - including 2, 10, and 12. The intended call is `isPerfect(N)`. The
helper exists and is never used, which is the giveaway. Note also that
`isPrime` in this file has no `n < 2` guard, so `0` and `1` are reported as
prime; `03-number-analysis-functions` fixes exactly that with
`if (n < 2) return false;`.

**`03-number-analysis-functions` prints labels a strict judge will reject.**
Its `analyzeNumber` emits `Prime: true`, `Divisors: 4`, `Perfect: false`. A
token-comparing judge expects bare values in the same order, or one value per
line, and will mark the labels as wrong output. The values themselves are
correct for `N >= 1`; strip the prefixes and keep the order, so `N = 6` should
read `false 4 true` (or the same three values one per line, if that is what
the statement says).

**`04-max-revenue` has two real limits.** Revenue is stored in `int`, so
`N = 1e5` prices near `1e9` overflow (use `long long`), and both the array and
the price domain are hard-coded to 100 elements. The `O(N^2)` scan is correct
but will time out at contest limits; the sorting variant in the logic guide is
`O(N log N)`.

**`02-digit-analysis` is the reference implementation** of the three checks.
Its only limits are overflow of the reversed value for 10-digit inputs and the
fact that a negative `N` leaves every helper's loop unentered, producing
`0`, `0`, `false`.

## How to use this set

1. Read the folder's `README.md`, then close it and write the solution from the
   definitions alone.
2. Compare against `idea.md` - if your approach differs and is still correct,
   keep yours.
3. Read `notes.md` and the matching section of
   [`./ZCO-LOGIC-GUIDE.md`](./ZCO-LOGIC-GUIDE.md).
4. Run the edge table from the guide: 0, 1, 2, a single digit, a power of ten,
   a perfect square, a large prime, and the maximum constraint.
5. Only then compare with `solution.cpp`, and treat it as one correct answer,
   not the correct answer.
