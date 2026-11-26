# How to Think About It

## 1. Restate the task

Output `1! + 2! + ... + N!`. Each term is a factorial, the terms are not
independent, and `N = 0` produces an empty sum, which is `0`.

## 2. Spot the pattern

Write the first few terms and look for a shortcut:

```text
1! = 1
2! = 1 * 2
3! = 1 * 2 * 3
4! = 1 * 2 * 3 * 4
```

Each line is the previous line multiplied by one new number. Recomputing `i!`
from scratch at every step repeats work: `N` terms each costing up to `i`
multiplications gives `1 + 2 + ... + N = O(N^2)` operations. Keeping the last
factorial turns the whole thing into one multiplication per step.

So there are two quantities moving forward together:

- `factorial`, the current term;
- `sum`, the total so far.

## 3. Derive the algorithm

1. Read `N`.
2. `factorial = 1` (before any term, the product is empty).
3. `sum = 0` (before any term, the total is empty).
4. `i = 1` (first term is `1!`).
5. While `i <= N`:
   - `factorial = factorial * i` — now `factorial == i!`;
   - `sum = sum + factorial` — add the term just built;
   - `i = i + 1`.
6. Print `sum`.

The body order matters. Multiplying first means the term added at step `i` is
`i!`. Swapping the two lines adds `(i-1)!` instead, and the total becomes
`0! + 1! + ... + (N-1)!`.

## 4. Dry run

`N = 5`:

| iteration | `i` | `factorial` after `*=` | `sum` after `+=` |
| --- | --- | --- | --- |
| 1 | 1 | 1 | 1 |
| 2 | 2 | 2 | 3 |
| 3 | 3 | 6 | 9 |
| 4 | 4 | 24 | 33 |
| 5 | 5 | 120 | 153 |
| exit | 6 | 120 | 153 |

Output `153`, matching `1 + 2 + 6 + 24 + 120`.

Second run, `N = 3`: `sum` goes `1`, `3`, `9`; output `9`.

Third run with the two statements swapped, `N = 3`: iteration 1 adds `1`
(`0!`), iteration 2 adds `1` (`1!`), iteration 3 adds `2` (`2!`) → `4`, which is
not the answer. This is the cheapest way to see why order matters.

## Progressive hints

1. How much of `i!` is shared with `(i-1)!`?
2. Which variable should store that shared part so it survives to the next
   iteration?
3. At the moment you add to the sum, should the product already include the
   current `i`?
4. What should `sum` be when `N = 0`, and does the loop give that for free?

## Traps

- Recomputing each factorial inside a nested loop — correct but `O(N^2)`, and it
  invites an inner-loop bound bug.
- Adding before multiplying, which shifts every term down by one.
- Resetting `factorial` to `1` inside the loop, which makes every term `i`.
- Initialising `sum` to `1` because `0! = 1`; this problem starts at `1!`.
- Using `int` for `N >= 13`; the total silently wraps.
- Assuming the total is "about `N!`": it is only slightly larger
  (`sum / N! = 1.0528` at `N = 20`), so both overflow at the same `N`; a wider
  accumulator buys you no extra step.

## Self-check

- What is the answer for `N = 1`? (`1`)
- What is the answer for `N = 4`? (`33`)
- How many multiplications run for `N = 6`? (`6`, one per iteration)
- What would the answer be if the sum started at `0!`? (previous answer `+ 1`)
- Why does `N = 13` print a negative number? (total `6749977113` exceeds `int`)

A useful extension: compute the sum modulo `10^9 + 7` and notice that the
overflow problem disappears while the loop structure stays identical.
