# How to Think About It

## 1. Restate the task

Given `N >= 0`, output the product `1 * 2 * ... * N`, with `0!` defined as `1`.
Nothing is squared, summed, or divided; every integer up to `N` appears exactly
once as a factor.

## 2. Spot the pattern

Two clues point at a running product:

- The terms are consecutive integers, so a counter can generate them.
- Each term multiplies the previous partial answer, so the state can be a single
  number rather than a list.

Compare with the sum problem: `sum = 0` then `sum += i`; here `product = 1` then
`product *= i`. Same skeleton, different identity element. Recognising that
symmetry is the actual lesson of this folder.

## 3. Derive the algorithm

1. Read `N`.
2. `factorial = 1` — the value of the empty product, so `N = 0` needs no branch.
3. `i = 1` — the first factor. Starting at `2` would also work for `N >= 1`, but
   then `N = 1` would skip the loop and still print `1`, which happens to be
   correct; starting at `1` is simpler to justify.
4. While `i <= N`: `factorial = factorial * i`, then `i = i + 1`.
5. Print `factorial`.

Invariant: at the top of the loop, `factorial == (i - 1)!`. Initially
`1 == 0!`. Each iteration multiplies by `i`, giving `i!`, and increments `i`, so
the invariant is restored.

## 4. Dry run

`N = 5`:

| iteration | `i` | `factorial` before | `factorial * i` | `i` after |
| --- | --- | --- | --- | --- |
| 1 | 1 | 1 | 1 | 2 |
| 2 | 2 | 1 | 2 | 3 |
| 3 | 3 | 2 | 6 | 4 |
| 4 | 4 | 6 | 24 | 5 |
| 5 | 5 | 24 | 120 | 6 |
| exit | 6 | 120 | — | — |

`6 <= 5` is false, so `120` is printed. Note that `factorial` after iteration
`k` equals `k!`, which is why `i` is incremented *after* the multiply.

Second run, `N = 0`: the first test `1 <= 0` fails, so `1` is printed. No
special case needed.

Third run, `N = 13`: the loop computes `6227020800` mathematically, but `int`
only reaches `2147483647`. The printed value is `1932053504`, the low 32 bits of
`6227020800`, which is meaningless.

## Progressive hints

1. What value should the product hold before any factor is multiplied in?
2. Which loop condition includes `N` as the final factor?
3. Why does that choice make `0!` work without an `if`?
4. How large can `N` get before the answer stops fitting in `int`? Multiply by
   hand until you cross `2147483647`.

## Traps

- `factorial = 0` at the start: every answer becomes `0`.
- `i < N` instead of `i <= N`: `5` yields `24`, the factorial of `4`.
- Multiplying before incrementing and also incrementing before multiplying —
  either order works if consistent, but mixing them yields an off-by-one factor.
- Using `int` for `N = 13` or more; the wrap is silent and can even look
  plausible.
- Assuming `long long` is "big enough": it stops at `20!`.
- Negative input prints `1`, because the loop never runs; do not treat that as a
  valid answer.

## Self-check

- What does the program print for `N = 1`? (`1`)
- How many multiplications run for `N = 6`? (`6`)
- What is the largest `N` with a correct `int` result? (`12`)
- Why is `0!` equal to `1` in this implementation? (empty product)
- What does `N = 13` print, and why is that number not `13!`? (low 32 bits of
  `6227020800`, signed overflow)

If you want a harder variant, compute `N!` modulo `10^9 + 7`. The same loop
works; just take the remainder after each multiplication, and the overflow
constraint disappears.
