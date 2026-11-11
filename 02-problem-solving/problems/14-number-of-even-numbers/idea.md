# How to Think About It

## 1. Restate the task

Count the even integers in `[1, N]`. Two traps hide in that sentence:

- "even" excludes odd numbers — the answer for `N = 10` is `5`, not `10`;
- "count" excludes summation — the answer is `5`, not `30`.

## 2. Spot the pattern

List the range with parity marked for `N = 7`:

```text
1(odd) 2(even) 3(odd) 4(even) 5(odd) 6(even) 7(odd)
```

Even and odd alternate. Every block of two consecutive integers contributes
exactly one even number. That alternation is the whole insight:

- `N = 2k` gives `k` complete pairs → `k` evens.
- `N = 2k + 1` gives `k` pairs plus a trailing odd → still `k` evens.

Both cases equal `N / 2` under integer division.

## 3. Derive the algorithm

Loop version:

1. Read `N`.
2. `count = 0` — nothing counted yet.
3. `i = 1` — first candidate.
4. While `i <= N`:
   - if `i % 2 == 0`, then `count = count + 1`;
   - `i = i + 1`, always, regardless of the branch.
5. Print `count`.

Formula version: read `N`, print `N / 2`. The loop is the safer first draft
because it generalises to predicates that have no closed form, such as "count
multiples of `7` that are also even".

## 4. Dry run

`N = 10`:

| `i` | `i % 2` | `count` after |
| --- | --- | --- |
| 1 | 1 | 0 |
| 2 | 0 | 1 |
| 3 | 1 | 1 |
| 4 | 0 | 2 |
| 5 | 1 | 2 |
| 6 | 0 | 3 |
| 7 | 1 | 3 |
| 8 | 0 | 4 |
| 9 | 1 | 4 |
| 10 | 0 | 5 |
| exit (11) | — | 5 |

Output `5`. Ten iterations, five increments.

`N = 7`: iterations `1..7`, increments at `2, 4, 6` → `3`, matching `7 / 2 = 3`.

`N = 1`: one iteration, `1 % 2 == 1`, no increment → `0`.

## Progressive hints

1. Which operator tells you whether an integer is even?
2. What should happen to the counter when the test fails? (Nothing.)
3. What must happen to the loop variable on *every* iteration, including the
   failing branch?
4. Before writing code, predict the answers for `N = 5` and `N = 6`; if your
   program disagrees, the bound or the increment is wrong.

## Traps

- Adding `i` instead of `1` — that computes the sum, not the count.
- Counting odd numbers because the condition was written `i % 2 != 0` or `i % 2`.
- Putting `i++` inside the `if` branch only: when the test fails, `i` never
  changes and the program hangs.
- Starting at `0`: `0` is even, so the count becomes `N / 2 + 1`.
- Using `<` instead of `<=`: `N = 10` would count `2, 4, 6, 8` and miss `10`.
- Writing `else { count = count; }`, which is a no-op and hides the fact that
  the `else` is unnecessary.

## Self-check

- What is the answer for `N = 2`? (`1`)
- What is the answer for `N = 3`? (`1`)
- How many iterations run for `N = 100`? (`100`; the formula version runs none)
- Why does `N / 2` match the loop for both parities of `N`?
- Does the count ever overflow `int`? (No: it is at most `N / 2`.)

Extension: count even numbers in `[a, b]` as `b / 2 - (a - 1) / 2`. Check it on
`a = 4`, `b = 9`: evens are `4, 6, 8` → `3`, and `9/2 - 3/2 = 4 - 1 = 3`.
