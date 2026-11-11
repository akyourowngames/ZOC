# How to Think About It

## 1. Restate the task

Walk over the decimal digits of `N`, ask of each "is it even?", and report how
many answered yes. "How many" means a counter, not a sum and not a boolean.

## 2. Spot the pattern

Two independent pieces:

- **Traversal** — the familiar `% 10` / `/ 10` peel, one digit at a time,
  right to left.
- **Decision** — parity, `digit % 2 == 0`.

Because the pieces are independent, this problem is a template: swap the
predicate and you get "count digits greater than 5", "count prime digits",
"count digits equal to 7". Swap the accumulation and you get "sum of even
digits". Recognising the split is more valuable than memorising the code.

The traversal order does not affect a count, so no extra storage is needed.

## 3. Derive the algorithm
1. Read `N`.
2. `counter = 0`.
3. Extract `digit = N % 10`.
4. If `digit % 2 == 0`, increment `counter`.
5. `N = N / 10`.
6. Repeat 3–5 while `N > 0`.
7. Print `counter`.

Note what step 4 is *not*: it is not an `else` branch that decrements, and it
is not an early exit. Digits that fail the test still have to be consumed,
otherwise the loop cannot advance past them.

## 4. Dry run

**`N = 2481`**

| iteration | `N` | `digit` | even? | `counter` | `N` after `/10` | continue? |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 2481 | 1 | no | 0 | 248 | yes |
| 2 | 248 | 8 | yes | 1 | 24 | yes |
| 3 | 24 | 4 | yes | 2 | 2 | yes |
| 4 | 2 | 2 | yes | 3 | 0 | no |

Output `3`. Four digits scanned, three accepted.

**`N = 1000`**

| iteration | `N` | `digit` | even? | `counter` | `N` after `/10` | continue? |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1000 | 0 | yes | 1 | 100 | yes |
| 2 | 100 | 0 | yes | 2 | 10 | yes |
| 3 | 10 | 0 | yes | 3 | 1 | yes |
| 4 | 1 | 1 | no | 3 | 0 | no |

Output `3`. Zeros are digits, and they are even — a frequent source of
off-by-one disagreement with a judge that thinks in terms of "significant"
digits.

**`N = 0`**

| iteration | `N` | `digit` | even? | `counter` | `N` after `/10` | continue? |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 | 0 | yes | 1 | 0 | no |

Output `1`.

**`N = 1357`**

Four iterations, no acceptances, output `0`. Correct, and the loop must still
run: a "no match" answer is computed, not short-circuited.

## Progressive hints

1. Reuse the extraction pair from the digit-sum problem. What is the only new
   line?
2. Is an `else` needed? What would happen to the traversal if a failing digit
   skipped the `N / 10` update?
3. What should the counter start at so that "none matched" prints correctly?
4. Is `0` even? If yes, what does the input `0` produce, and does the judge
   agree?

## Traps

- **Putting `N /= 10` inside the `if`.** Non-even digits are never consumed →
  infinite loop on inputs like `13`.
- **`digit % 2 == 1` as the odd test.** For negative digits `-3 % 2 == -1`, so
  the test silently fails. `!= 0` is the robust odd test; `== 0` is already
  robust for evenness.
- **Counting digits of the number rather than even digits.**
- **`counter` declared but not initialised.**
- **Forgetting that `0` is an even digit**, which changes `N = 0`, `10`, `100`,
  `2002`, and many other cases.
- **Reading `N` as `int` and then expecting leading zeros to be counted**
  (`007` arrives as `7`, one digit).

## Self-check

- For `N = 24680`, what is printed? Five.
- For `N = 5`, what is printed? `0`.
- How many iterations for `N = 0`? One, and that is the whole subtlety.
- If the task were "sum of even digits", which single line changes? The
  accumulator line becomes `sum += digit`.
- If the task were "are all digits even?", what is the cleanest formulation?
  (Count odd digits and test `== 0` at the end, or set a flag and break —
  compare which is easier to reason about.)
