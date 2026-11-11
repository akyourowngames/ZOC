# How to Think About It

## 1. Restate the task

Two integers go in. One integer comes out: the bigger one. If they are equal,
print that number once.

## 2. Spot the pattern

This is the smallest possible decision problem: two candidates, pick one.
There is no loop and no accumulation, so the whole algorithm is a single
comparison. The only real design choice is which branch to attach to which
condition.

## 3. Derive the algorithm

1. Read `A` then `B`.
2. Ask: is `B` strictly greater than `A`? Equivalently, is `A < B`?
3. If yes, print `B` and skip the rest.
4. If no, `A` is greater than or equal to `B`; print `A`.
5. Do not print anything else.

The `else` branch is not "the other number is bigger"; it is "the other number
is at least as big". That is why ties cost no extra code.

## 4. Dry run

Input `8 13`:

| Step | Value |
| --- | --- |
| `A`, `B` | `8`, `13` |
| `A < B` | `8 < 13` is `true` |
| branch | `if` |
| printed | `13` |

Input `-4 -9`:

| Step | Value |
| --- | --- |
| `A`, `B` | `-4`, `-9` |
| `A < B` | `-4 < -9` is `false` (further right on the line) |
| branch | `else` |
| printed | `-4` |

Input `5 5`:

| Step | Value |
| --- | --- |
| `A`, `B` | `5`, `5` |
| `A < B` | `5 < 5` is `false` |
| branch | `else` |
| printed | `5` |

## Progressive hints

1. Start by writing the condition as a plain English question: "is B bigger
   than A?"
2. Translate that question literally into code, and print `B` inside it.
3. Whatever remains after that question is "A is not smaller", so print `A`
   outside it.
4. Trace your code on `A = B` before moving on; that is where wrong branch
   pairing shows up.
5. Delete any text in the output that is not the number.

## Traps

- Inverted branches: `if (A < B) cout << A;` prints the smaller value.
- Comparing absolute values, which breaks `-4 -9`.
- Printing both values (`cout << A << " " << B;`) instead of the answer.
- Adding a semicolon after the condition: `if (A < B);` makes an empty body
  and the following statement always executes.
- Using `else if (A > B)` with no final `else`, which prints nothing for a
  tie.
- Printing a message such as `A is greater` when only the number is required.

## Self-check

- For which inputs is `A < B` false?
- What does your program print for `-1 0` and for `0 -1`?
- If the statement asks for the smaller value instead, how many characters of
  your code change?
- Is the output exactly one integer, once, with no wrapped text?
