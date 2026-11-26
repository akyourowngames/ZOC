# How to Think About It

## 1. Restate the task
Two answers about the same number: its square, and the value after doubling. The square
describes the *original* `N`; the doubled value *is* `N` after the call. So one output is a
snapshot and the other is live state, and the order in which you compute them decides
whether the program is correct.

## 2. Spot the pattern
This is the "value function vs reference function" pairing. Ask of each helper: does the
caller need the result, or does the caller need its own variable changed?

| Need | Helper shape | Call style |
| --- | --- | --- |
| a computed answer | `int square(int n)` | `result = square(N);` |
| modify the caller's variable | `void doubleNumber(int& n)` | `doubleNumber(N);` |

If you can answer that question for each function, the signatures write themselves.

## 3. Derive the algorithm
1. Read `N`.
2. Compute the square into a separate variable first. Do not delay this step: after step 3
   the original value is gone.
3. Call the reference function, which doubles `N` in place.
4. Print the stored square and the current `N`, separated by one space.

The sequencing rule to remember: **snapshot before mutation**. Whenever a later step
overwrites an input that an earlier answer depends on, save the earlier answer first.

## 4. Dry run
Input `N = 7`.

| Step | Code | `result` | `N` |
| --- | --- | --- | --- |
| 1 | `int N, result;` | uninitialized | uninitialized |
| 2 | `cin >> N;` | uninitialized | `7` |
| 3 | `result = square(N);` | `49` | `7` |
| 4 | `doubleNumber(N);` → `n = n * 2` | `49` | `14` |
| 5 | `cout << result << " " << N;` | `49` | `14` |
| output | | | `49 14` |

Input `N = -5`: step 3 gives `25`, step 4 gives `-10`, output `25 -10`.

What if you swap steps 3 and 4 (the classic mistake)? With `N = 7`, `N` becomes `14`, then
`result = square(14) = 196`, and the program prints `196 14` — wrong on the first token,
and the second token still looks plausible, which makes the bug hard to spot by eye.

Now prove the alias: inside `doubleNumber`, `n` and `N` refer to the same four bytes. There
is no copy to forget about. If the parameter were `int n` (no `&`), `n = n * 2` would
modify the copy and `N` would print as `7` — output `49 7`.

## Progressive hints
1. Which of the two helpers must change the caller's variable? Only that one needs `&`.
2. `void` means "no answer returned" — the effect must travel through the parameter.
3. Store `square(N)` in a variable before calling the mutating function; you cannot
   recover the old `N` afterwards.
4. Check the separator: one space, no newline required by the statement, no labels.

## Traps
- Calling `doubleNumber` before storing the square, so both outputs describe the doubled
  number.
- Writing `void doubleNumber(int n)` and wondering why `N` never changes — the copy is
  destroyed at return.
- Printing `square(N)` twice: once before and once after doubling, with only one `result`.
- Forgetting that `n = n * 2` inside a `void` function needs no `return`; adding
  `return n;` in a `void` function is a compile error.
- Ignoring overflow: `N = 1,000,000,000` squares past `INT_MAX`, and doubling it is fine —
  the two helpers have different limits, and the smaller one governs.

## Self-check
- Why does `doubleNumber` need `&` but `square` does not?
- With `N = 3`, what is the output, and which token comes from which function?
- If the statement asked for `square then halve`, what would change? (The helper body, and
  nothing about the ordering discipline.)
- Can you rewrite the pair as a single function returning a `struct` of two values, and say
  which version you find clearer?
