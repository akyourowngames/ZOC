# How to Think About It

## 1. Restate the task

Given `N`, output `0 + 1 + 2 + ... + N`. The terms are consecutive integers,
the lower end is fixed at `0`, and the upper end is the input.

## 2. Spot the pattern

Two independent facts matter:

- The terms are an arithmetic progression with difference `1`.
- The answer is built by repeatedly applying the same update, `sum += i`.

That second fact is the accumulator pattern. You do not need to know the
formula to solve it; you only need a variable that remembers the partial sum and
a counter that walks the range.

A useful sanity check comes from a tiny case: `N = 3` gives `0+1+2+3 = 6`, and
the formula `3*4/2 = 6` agrees, so the endpoint is included.

## 3. Derive the algorithm

1. Read `N`.
2. `sum = 0` — the identity for addition, the correct "nothing added yet" value.
3. `i = 0` — the first term. Starting at `1` is also fine here; the `0` term is
   a no-op.
4. While `i <= N`: `sum = sum + i`, then `i = i + 1`.
5. Print `sum`.

The loop invariant is: at the top of each iteration, `sum` holds
`0 + 1 + ... + (i - 1)`. Initialisation makes it true (`i = 0`, empty sum), the
body restores it after the increment, and termination at `i = N + 1` leaves
`sum = 0 + ... + N`.

## 4. Dry run

`N = 5`:

| iteration | `i` | `sum` before | `sum` after | `i` after |
| --- | --- | --- | --- | --- |
| 1 | 0 | 0 | 0 | 1 |
| 2 | 1 | 0 | 1 | 2 |
| 3 | 2 | 1 | 3 | 3 |
| 4 | 3 | 3 | 6 | 4 |
| 5 | 4 | 6 | 10 | 5 |
| 6 | 5 | 10 | 15 | 6 |
| exit | 6 | 15 | — | — |

Condition `6 <= 5` is false, so the loop stops and `15` is printed. Six
iterations for `N = 5`, because `0` through `5` is six values.

Second run, `N = 0`: one iteration adds `0`, then `i` becomes `1`, condition
`1 <= 0` fails, output `0`.

Third run, `N = 4` starting at `i = 1`: `1+2+3+4 = 10`, same as
`4*5/2`. Confirms the start value does not matter with `<=`.

## Progressive hints

1. Which variable should hold the answer so far, and what value means "no terms
   added yet"?
2. Which loop condition includes the input value itself?
3. What single line must appear at the end of the body so the loop cannot run
   forever?
4. Once it works, try the closed form `N * (N + 1) / 2` and compare on `N = 10`.

## Traps

- `while (i < N)` drops the term `N`. For `N = 5` that gives `10`, not `15`.
- Omitting `i++` produces an infinite loop; the program appears to hang.
- Declaring `sum` without `sum = 0` adds garbage from an uninitialised stack slot.
- `sum` as `int` overflows at `N = 65536`; the printed value becomes negative
  even though the logic is right.
- `N * (N + 1) / 2` with `int` overflows *inside* the multiplication, before the
  division can shrink it: `65536 * 65537` is already too big.
- Assuming the loop is "the slow way" is wrong at this scale; both are fine for
  small `N`, and the loop is easier to debug.

## Self-check

- What does the program print for `N = 1`? (`1`)
- How many iterations run for `N = 100`? (`101`)
- At which `N` does the `int` result first become wrong? (`65536`)
- If the loop were `i < N`, what would `N = 5` print? (`10`)
- Why is `sum = 0` the only correct starting value for a sum?

If you want extra practice, run the same program on paper for `N = 7` (expected
`28`) and trace both the loop and the formula side by side. The two must agree
on every input, and any disagreement points to an endpoint error rather than a
typo.
