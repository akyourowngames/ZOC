# How to Think About It

## 1. Restate the task

Three numbers, one answer: the one in the middle when they are arranged in
order. Not the second one typed, not the average — the median value.

## 2. Spot the pattern

"Between" is a two-sided condition, and there are two ways to be between:
larger than the low end going up, or smaller than the high end going down. In
symbols, `x` is between `p` and `q` when

```text
(p < x && x < q) || (q < x && x < p)
```

Once you have that predicate, the algorithm is: test `B`, then test `A`, and
whatever is left must be `C`.

## 3. Derive the algorithm

1. Read `A`, `B`, `C`.
2. Test `B`: is `A < B < C` or `C < B < A`? If yes, print `B`.
3. Test `A`: is `B < A < C` or `C < A < B`? If yes, print `A`.
4. Otherwise print `C`.
5. Print nothing else.

Why is step 4 safe? For three distinct values, the median is one of the three.
If it were `B`, step 2 would have fired. If it were `A`, step 3 would have
fired. So it is `C`.

Alternative derivation (sorting): put the three values in an array, sort,
print `values[1]`. Same answer, less reasoning, handles duplicates for free.

## 4. Dry run

Input `9 2 6`:

| Step | Test | Result |
| --- | --- | --- |
| `B` between? | `(9 < 2 && 2 < 6)` false; `(6 < 2 && 2 < 9)` false | no |
| `A` between? | `(2 < 9 && 9 < 6)` false; `(6 < 9 && 9 < 2)` false | no |
| fallback | print `C` | `6` |

Sorted order `2, 6, 9` confirms `6`.

Input `2 3 1`:

| Step | Test | Result |
| --- | --- | --- |
| `B` between? | `(2 < 3 && 3 < 1)` false; `(1 < 3 && 3 < 2)` false | no |
| `A` between? | `(3 < 2 && 2 < 1)` false; `(1 < 2 && 2 < 3)` true | yes |
| output | `A` | `2` |

Input `3 3 5` (duplicate):

| Step | Test | Result |
| --- | --- | --- |
| `B` between? | `(3 < 3 && ...)` false; `(5 < 3 && ...)` false | no |
| `A` between? | `(3 < 3 && ...)` false; `(5 < 3 && ...)` false | no |
| fallback | print `C` | `5` |

The sorted median is `3`, so the fallback is not safe when ties exist. This is
the one place the reasoning above ("the median is one of the three, and the
first two branches did not fire") breaks down.

## Progressive hints

1. Sort the three numbers on paper. Which position is the answer?
2. Write the condition for "`B` is in the middle" as two `&&` groups joined by
   `||`. Why can it not be a single `&&`?
3. Apply the same predicate to `A`.
4. Convince yourself the remaining value must be `C` — and note the assumption
   you needed (distinct values).
5. Try all six orderings of `1 2 3` on paper; every one should give `2`.

## Traps

- Writing only `A < B && B < C`; that misses the descending case, so `3 2 1`
  would fall through both branches and print `C = 1`, the minimum.
- Using `||` inside a group instead of `&&`: `A < B || B < C` is true almost
  always.
- Missing parentheses around the groups; `&&` binds tighter than `||`, which
  is what you want here, but explicit parentheses prevent misreading.
- Assuming the middle **input** is the answer (`B` by position). `9 2 6` gives
  `6`, not `2`.
- Ignoring duplicates and shipping a solution whose behaviour on `3 3 5` is
  the maximum.
- Printing all three sorted values instead of just the median.

## Self-check

- List all six orderings of `1 2 3`. Which branch fires for each?
- For which tie inputs does the code print a wrong value? Name two.
- What does `sort`-based code print for `3 3 5`, and why is that the natural
  definition of "middle"?
- Is your condition symmetric in the two outer values?
