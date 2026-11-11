# How to Think About It

## 1. Restate the task

Given `N`, emit the sequence `1, 2, 3, ..., N` on one line with single-space
separators. The constraint I am imposing on myself: the repetition must be a
`do-while`, i.e. the condition is checked at the bottom.

## 2. Spot the pattern

This is a **counted loop**: the number of iterations is known up front and
equals `max(N, 0)`. The loop variable serves two roles at once — it is the
counter and the value to print. There is no per-iteration state besides the
counter.

A counted loop has three ingredients that must agree:

1. start value (`1`, because the first number to print is `1`);
2. step (`+1`, because consecutive integers);
3. stop test (`i <= N`, because `N` itself must be printed).

## 3. Derive the algorithm
1. Read `N`.
2. If `N < 1`, print nothing and stop — this guard exists because `do-while`
   cannot skip its body.
3. Otherwise set `i = 1`.
4. Print `i` followed by a space.
5. Increment `i`.
6. Repeat from step 4 while `i <= N`.

Step 2 is not decoration. Without it the loop is guaranteed to print at least
one number, so `N = 0` would produce `1` — the exact opposite of the required
"empty" output.

## 4. Dry run

**`N = 3`**

| step | `i` before body | printed | `i` after `i++` | `i <= 3`? |
| --- | --- | --- | --- | --- |
| 1 | 1 | `1 ` | 2 | true |
| 2 | 2 | `2 ` | 3 | true |
| 3 | 3 | `3 ` | 4 | false, stop |

Output `1 2 3 `. Three iterations, three numbers: the count is exactly `N`.

**`N = 0`, with `i = 1` and no guard**

| step | `i` before body | printed | `i` after `i++` | `i <= 0`? |
| --- | --- | --- | --- | --- |
| 1 | 1 | `1 ` | 2 | false, stop |

Output `1 ` — wrong. The body ran before the condition could veto it. This is
the whole lesson in one row of a table.

**`N = 1`**

| step | `i` before body | printed | `i` after `i++` | `i <= 1`? |
| --- | --- | --- | --- | --- |
| 1 | 1 | `1 ` | 2 | false, stop |

Output `1 `. Here `do-while` is exactly the right tool: at least one number is
always required, which is precisely what an exit-controlled loop guarantees.

## Progressive hints

1. What is the first value, and what is the last? Write them down; the start
   value and the stop test follow directly.
2. Translate "print, then advance, then ask whether to continue" into
   `do { ... } while (...);` — the order of those three actions is the order
   of the lines.
3. Put a pencil dot on `N = 0`. Which line executes first, the print or the
   test? If the print is first, can anything stop it?
4. If a `do-while` must be able to run zero times, wrap it in an `if`. Do not
   try to "undo" a print.

## Traps

- **Assuming `do-while` can run zero times.** It cannot. That is its defining
  property, not a quirk.
- **Repairing the wrong place.** Code inside the body runs *after* the print,
  so setting `i = 0` there cannot suppress output that already went to the
  stream.
- **Forgetting the semicolon** after `} while (condition);` — a compile error,
  and a common one.
- **Using `i < N`.** With `N = 5` that prints `1 2 3 4` and omits `5`.
- **Infinite loop from a missing increment.** `i` must change every iteration.
- **Uninitialised counter.** Declaring `int i;` and incrementing before the
  first assignment reads an indeterminate value; always assign `i = 1` first.

## Self-check

- For `N = 5`, how many iterations run? (Five.)
- For `N = 0`, what does a bare `do-while` print? (One number, `1`.)
- Where exactly must the guard go, and why not later? (Before the loop; the
  body has already printed by the time any inside check runs.)
- Rewrite the same loop as `while` and as `for` without changing the output.
  If you can produce all three forms, you understand the difference.
- What single character change turns this into "print `N` down to `1`"?
  (`--i` and the initial value `N`, with condition `i >= 1`.)
