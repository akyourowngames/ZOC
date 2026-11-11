# How to Think About It

## 1. Restate the task
Two numbers in. One comparison that answers "which is bigger", printed. Then the numbers
trade places, and the new order is printed. The two halves are deliberately independent, so
you can build and test them separately.

## 2. Spot the pattern
- "Which one is bigger?" is a **predicate-like selection**: it returns one of the inputs and
  changes nothing. That is a value function with an `if`.
- "Make the caller's two variables trade places" is a **dual in-place mutation**: it needs
  two reference parameters, because one return value cannot update two objects.

A useful test: draw the caller's variable boxes. If the function must write into more than
one of them, it needs references and a `void` return.

## 3. Derive the algorithm
1. Read `N` and `M` with one `cin >> N >> M;` — extraction handles the whitespace.
2. `maximum(a, b)`: if `a > b` return `a`, otherwise return `b`. The `else` branch covers
   equality and the smaller case, so ties are handled without a separate test.
3. Print the maximum and end the line.
4. `swapNumbers(a, b)`: copy `a` into `temp`, overwrite `a` with `b`, overwrite `b` with
   `temp`. The order matters — overwrite `a` before `b`, but only after saving `a`.
5. Print the swapped pair.

The swap's correctness is a three-line proof: after step 4, `b` holds the original `a`
(saved in `temp`), and `a` holds the original `b`. Assignment is destructive, so exactly one
temporary is needed.

## 4. Dry run
Input `4 9`.

| Step | Code | `N` | `M` | `temp` | Printed |
| --- | --- | --- | --- | --- | --- |
| 1 | `cin >> N >> M;` | `4` | `9` | — | |
| 2 | `maximum(4, 9)`: `a > b` → `4 > 9` false | `4` | `9` | — | |
| 3 | `return b;` → `9` | `4` | `9` | — | `9\n` |
| 4 | `swapNumbers`: `temp = a` | `4` | `9` | `4` | |
| 5 | `a = b` | `9` | `9` | `4` | |
| 6 | `b = temp` | `9` | `4` | `4` | |
| 7 | `cout << N << " " << M;` | `9` | `4` | — | `9 4` |

Input `7 7`: `7 > 7` is false, `return b` gives `7`; the swap copies `7` into `temp`, `7`
into `a`, `7` into `b` — no visible change, output `7` then `7 7`.

Input `-3 -8`: `-3 > -8` is true, so `return a` gives `-3`. This is the case that catches
people who compare absolute values by habit.

## Progressive hints
1. Equality is not a special case if you write `if (a > b) return a; else return b;`.
2. A swap needs somewhere to park the first value; you cannot hold two numbers in one place.
3. If `N` still prints its old value after `swapNumbers`, look for a missing `&`.
4. Check the newline: the first output ends a line, the second does not.

## Traps
- `swapNumbers(int a, int b)` without `&`: compiles, runs, prints the pair unchanged.
- `a = a + b; b = a - b; a = a - b;` — elegant-looking, but `a + b` overflows for large
  `int`s (signed overflow is undefined behaviour), so it is worse than `temp`.
- Overwriting `b` before saving `a` in `temp`, which duplicates one value.
- Using `>=` in `maximum` and expecting a different answer: the returned *value* is identical
  for ties, so only the choice of which variable is returned changes, not the number.
- Printing the maximum but forgetting the second stage, or printing the swapped pair before
  the maximum.
- Confusing `maximum(a, b)` (does not modify) with something like `sortTwo(a, b)` (would).

## Self-check
- Why does `maximum` not need `&`, while `swapNumbers` cannot work without it?
- With `N = 5, M = 2`, what are the two output lines?
- Can you swap without `temp` using `std::swap`? Which header provides it?
- What breaks if you call `swapNumbers` twice — is the output wrong, or just back to the start?
