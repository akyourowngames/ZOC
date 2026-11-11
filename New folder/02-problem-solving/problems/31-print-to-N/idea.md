# How to Think About It

## 1. Restate the task

Emit `1, 2, ..., N` with single-space separators. If `N < 1`, emit nothing.
Read once, print once — there is no state to keep beyond the counter.

## 2. Spot the pattern

This is the archetypal **counted loop**. Three facts determine the code:

1. the first value is `1` → initialise `i = 1`;
2. the step is `+1` → `i++`;
3. the last value is `N` and it must be included → test `i <= N`.

Because the range can be empty, zero iterations must be possible. That rules
out `do-while` as the primary form and makes `for` the honest choice: its test
runs before the first iteration, so `N = 0` costs nothing and needs no special
case.

The second pattern is **decomposition**. Printing to a stream is a side effect;
wrapping it in `void printNumbers(int N)` gives the program one
responsibility per function and makes the loop testable in isolation.

## 3. Derive the algorithm
1. Read `N`.
2. Call `printNumbers(N)`.
3. Inside: for `i` from `1` to `N` inclusive, print `i` and a space.

Nothing else. No accumulator, no early exit, no post-processing. If your
solution has more than four lines inside the function, something is being
over-engineered.

## 4. Dry run

**`N = 5`**

| check `i <= 5` | `i` printed | then `i++` |
| --- | --- | --- |
| 1 <= 5 true | 1 | 2 |
| 2 <= 5 true | 2 | 3 |
| 3 <= 5 true | 3 | 4 |
| 4 <= 5 true | 4 | 5 |
| 5 <= 5 true | 5 | 6 |
| 6 <= 5 false | — | loop ends |

Output `1 2 3 4 5 ` (with a trailing space). Five iterations; the counter ends
at `6 = N + 1`.

**`N = 1`**

| check | printed | `i++` |
| --- | --- | --- |
| 1 <= 1 true | 1 | 2 |
| 2 <= 1 false | — | end |

Output `1 `.

**`N = 0`**

| check | printed |
| --- | --- |
| 1 <= 0 false | — |

Output empty. The test runs once and fails; the body never executes. This is
the exact case where the `do-while` version must add an `if (N >= 1)` guard.

**`N = -3`** — same as `0`: `1 <= -3` is false, nothing printed. An empty
range is an empty range regardless of how negative it is.

## Progressive hints

1. What is the first number printed? Put that in the initialisation slot.
2. What is the last? Put a test that is true for it and false for the next
   integer.
3. Which loop form allows the body to run zero times? Choose it.
4. Should the printing code live in `main`? Move it into a function and pass
   `N` by value.
5. For `N = 0`, trace the condition once — no special case should be needed.

## Traps

- **`i < N`.** Prints `1 .. N-1`; omits the endpoint.
- **`i = 0`.** Prints a leading `0`.
- **`do-while` without a guard.** Prints `1` for `N = 0` (folder `25` shows the
  damage).
- **`endl` instead of `" "`.** Forces a flush per number; a newline per value
  also changes the output format entirely.
- **No separator at all.** `123456` instead of `1 2 3 4 5 6`.
- **Declaring `i` globally/outside** when the header form is available; leaking
  the counter invites accidental reuse.
- **`i++` on `INT_MAX`.** If `N` can be `INT_MAX`, the final increment
  overflows; guard with `i < N` plus a special last print, or use a wider type.
- **Unbuffered I/O for huge `N`.** `cout << x << " "` without
  `ios::sync_with_stdio(false)` is slow in the millions.

## Self-check

- How many iterations for `N = 100`? (100.)
- What is `i` after the loop ends? (`N + 1`, if no overflow.)
- For `N = 0`, does the body run? (No — that is the advantage over `do-while`.)
- What does the function print for `N = 3` if the test is `i != N`? (`1 2` and
  then it stops at `3`, missing the endpoint — a classic wrong test.)
- If the output needed to be comma-separated with no trailing comma, which line
  changes? (The print line, plus a conditional for the last element.)
