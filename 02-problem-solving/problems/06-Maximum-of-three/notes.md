# Deep Notes

## Core logic

A maximum is characterised by "no other value is larger". The running-maximum
loop maintains the invariant

```text
maxValue == max(values processed so far)
```

which is true for one value, stays true after each strict-`>` update, and gives
the answer after the last value. Ties never need a special rule because an
equal value is already represented.

## Code walkthrough

1. `int A, B, C;` — three candidates.
2. `cin >> A >> B >> C;` — order matters; the names map to the input positions.
3. `if (A > B && A > C)` — fires only when `A` is the **unique** maximum.
4. `else if (B > A && B > C)` — fires only when `B` is the unique maximum.
5. `else` — assumed to mean "`C` is the maximum". That inference is invalid
   when `A == B > C`: neither strict guard fires, and `C` is the minimum.
6. `return 0;` — single number printed, no newline.

## Why it works

For distinct values, exactly one of the three is the maximum, and exactly one
guard (or the final `else`) names it: if `A` is strict max, guard 1 fires; else
if `B` is strict max, guard 2 fires; else `C` is strict max. With duplicates
the trichotomy "A max / B max / C max" is not a partition of the strict-max
cases, so the `else` receives inputs it was not designed for. That is the whole
bug, and it is exactly why the running maximum is the pattern worth memorising.

## Complexity

Two comparisons and at most two assignments: O(1) time, O(1) extra space. A
general running maximum over `n` values is O(n) time, O(1) space.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `4 11 7` | `11` | README sample, unique max |
| `-3 -8 -5` | `-3` | all negative, largest is closest to zero |
| `1 2 3` | `3` | increasing order |
| `3 2 1` | `3` | decreasing order |
| `7 7 7` | `7` | all equal |
| `5 5 3` | `5` | tie for max, code prints `3` (bug) |
| `3 5 5` | `5` | tie for max, code prints `5` (correct by luck) |
| `5 3 5` | `5` | tie for max, code prints `5` (correct by luck) |
| `0 -1 -2` | `0` | maximum is zero; a `0` initial value would also pass here |
| `2 9 9` | `9` | tie between `B` and `C` |
| `-5 -5 -9` | `-5` | tie for max, code prints `-9` (bug) |

## Common mistakes

- Writing an `&&` chain with strict `>` and assuming the `else` is safe.
- Starting the maximum at `0` "because numbers are positive" without a
  constraint that says so.
- Using `=` inside the condition (`if (A > B && A = C)`), which either fails to
  compile or changes a value.
- Mixing `&&` and `||` without parentheses; precedence is `&&` before `||`, so
  `A > B || A > C && B > C` is not the three-way test it looks like.
- Printing all candidates on separate lines "so the judge can pick".
- Reading only two values and letting `C` stay uninitialised.

## Variants and follow-ups

- **General `n`:** read values in a loop, update `m = max(m, x)`; this is the
  same invariant with more iterations.
- **Maximum and minimum together:** one pass, two running variables.
- **Second largest:** keep two slots and shift on update; ties need a policy.
- **`std::max({a, b, c})`** with `<algorithm>` and an initializer list.
- **Max with index:** store `bestIndex` alongside `bestValue`; the first
  occurrence is kept by using strict `>`.

## Key takeaways

1. Ties are not an afterthought; they decide whether a branch chain is
   exhaustive.
2. Running maximum is O(1) state, O(n) comparisons, and trivially verifiable.
3. Never initialise a maximum to a value outside the input range.
4. `else` is only a safe catch-all when the preceding guards partition the
   input space.

## Current-code review

The program is wrong for one family of inputs. Running `5 5 3` prints `3`;
`-5 -5 -9` prints `-9`. Both should print the maximum.

Mechanism: `A > B && A > C` fails when `A == B` (strict `>`), and
`B > A && B > C` fails for the same reason, so control falls into `else` and
prints `C`, which is the smallest value. The guards describe "unique maximum",
but the `else` assumes "`C` is the maximum" — an invalid inference.

Minimal fixes, in order of preference:

```cpp
// 1. running maximum (recommended)
int m = A;
if (B > m) m = B;
if (C > m) m = C;
cout << m;

// 2. keep the chain, relax the guards
if (A >= B && A >= C)      cout << A;
else if (B >= A && B >= C) cout << B;
else                       cout << C;
```

A third, compact option is `cout << max(A, max(B, C));` after
`#include <algorithm>`.

No other defects: output is a bare number with no label, and the two sample
cases in the README pass.
