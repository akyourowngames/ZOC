# How to Think About It

## 1. Restate the task

Three integers come in; the biggest one goes out. Duplicates are possible, and
they must not break the answer.

## 2. Spot the pattern

This is a selection problem with a tiny candidate set. Two standard shapes:

- **case analysis:** decide which variable holds the maximum;
- **accumulation:** carry a current best and update it as values arrive.

The second shape is the one that scales, so learn it here where you can check
every step by hand.

## 3. Derive the algorithm

1. Read `A`, `B`, `C`.
2. Set `maxValue = A`. This is correct so far: one value, and it is the maximum
   of the values seen.
3. If `B > maxValue`, set `maxValue = B`. The invariant now holds for the first
   two values.
4. If `C > maxValue`, set `maxValue = C`. The invariant holds for all three.
5. Print `maxValue`.

If you prefer the case analysis, every guard must be "greater than **or equal
to**" both others, and the last branch must be chosen only after the first two
have been ruled out.

## 4. Dry run

Input `4 11 7`:

| Step | `maxValue` | Test |
| --- | --- | --- |
| init | `4` | - |
| compare `B = 11` | `11` | `11 > 4` true |
| compare `C = 7` | `11` | `7 > 11` false |
| output | `11` | |

Input `5 5 3` (the tie case):

| Step | `maxValue` | Test |
| --- | --- | --- |
| init | `5` | - |
| compare `B = 5` | `5` | `5 > 5` false, no update |
| compare `C = 3` | `5` | `3 > 5` false |
| output | `5` | |

The strict `>` is harmless in the running form: an equal value is already in
`maxValue`, so skipping the update preserves correctness.

Input `-3 -8 -5`:

| Step | `maxValue` | Test |
| --- | --- | --- |
| init | `-3` | - |
| compare `-8` | `-3` | false |
| compare `-5` | `-3` | `-5 > -3` false |
| output | `-3` | |

## Progressive hints

1. If you had only two numbers, how would you find the larger? Reuse that
   answer twice.
2. Call the answer-so-far `maxValue` and start it at the first input, not at
   `0`.
3. Ask what happens on a tie: does the update need to fire? No, because the
   equal value is already stored.
4. Now write the three-way `&&` chain and test it on `5 5 3`. If it prints `3`,
   explain exactly which guard should have fired.
5. Compare your output with the statement: only the number, no words.

## Traps

- Starting from `0`: breaks every all-negative input.
- Strict comparisons in an `&&` chain: `A == B > C` makes both guards false,
  and the `else` prints `C`, the minimum.
- `if (A > B && A > C) ... else if (B > A && B > C) ... else C` looks
  exhaustive but is not; "A is not the strict max" and "B is not the strict
  max" do not imply "C is the max".
- Confusing `&&` with `||`: `A > B || A > C` is nearly always true.
- Printing the position (`0`, `1`, `2`) or a sentence instead of the value.
- Forgetting to read all three values before deciding.

## Self-check

- What does the running maximum print for `7 7 7`?
- What does the strict-chain version print for `5 5 3`? Why?
- Why is initialising `maxValue = A` safer than `maxValue = 0`?
- If a fourth number were added, how many lines of code change?
