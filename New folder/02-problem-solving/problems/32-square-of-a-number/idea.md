# How to Think About It

## 1. Restate the task
One number goes in, its square comes out. Nothing else is printed, and the caller's
variable must not change. The only design decision is *where* the multiplication lives:
the brief says inside a function, so `main` becomes a thin I/O wrapper.

## 2. Spot the pattern
This is a **pure function**: same input, same output, no memory of previous calls, no
printing inside the function. Recognising "one in, one out, no side effects" tells you
the signature immediately:

```cpp
int square(int N);   // value parameter, int return
```

Compare with the two other shapes you will meet in this section:

| Shape | Signature example | Caller visible? |
| --- | --- | --- |
| pure value function | `int square(int n)` | no |
| reference modifier | `void doubleNumber(int& n)` | yes, caller's variable changes |
| boolean predicate | `bool isEven(int n)` | no, but answers a question |

## 3. Derive the algorithm
1. Declare an `int` for the input.
2. Read it with `cin`.
3. Call the function with that value.
4. Return `N * N` — one multiplication inside the function.
5. Print the returned value.

No loop is needed. Squaring by repeated addition (`N + N + ... N times`) is possible but
strictly worse: `O(|N|)` instead of `O(1)`.

## 4. Dry run
Input `M = 13`.

| Step | Code | Value after step |
| --- | --- | --- |
| 1 | `int M;` | `M` is uninitialized (garbage) |
| 2 | `cin >> M;` | `M = 13` |
| 3 | call `square(13)` | parameter `N = 13` (a copy) |
| 4 | `return N * N;` | `13 * 13 = 169` |
| 5 | `cout << 169` | terminal shows `169` |
| 6 | `main` ends | `M` is still `13`, unchanged |

Input `M = -13`: step 4 computes `-13 * -13 = 169`. The negative sign cancels exactly
once because the two operands are the same variable.

Input `M = 46341`: step 4 computes a product larger than `INT_MAX`. On most compilers the
printed value is nonsense (often `-2147479015`); the C++ standard calls this undefined
behaviour, so the program is simply invalid for that input.

## Progressive hints
1. The square of `n` is `n` multiplied by itself — one expression, no loop.
2. A function that *returns* a value is called inside another expression, e.g. `cout << square(M);`.
3. Write the signature first (`int square(int N)`), then fill the body with one `return`.
4. Test the function in isolation: `cout << square(0) << " " << square(-5);` should give `0 25`.

## Traps
- `N ^ 2`: `^` is XOR. `4 ^ 2 == 6`, `5 ^ 2 == 7`. This compiles happily and is wrong.
- `pow(N, 2)`: returns a `double`. Printing `pow(7, 2)` may show `49` but large values lose
  exactness, and it drags in `<cmath>` for no reason.
- Returning `N` instead of `N * N` — a one-character bug that only shows up when the
  expected answer differs from the input (`N != 0` and `N != 1`).
- Believing `int` holds any square. It does not; see the `46340/46341` boundary.
- Printing a label such as `Square = 16`. Judges compare tokens, so extra text is a
  Wrong Answer even though the number is right.

## Self-check
- Can you state the exact `|N|` limit where the answer stops fitting in `int`?
- Does your function modify the caller's variable? It must not — there is no `&` in the signature.
- What does `square(square(3))` return, and why is `81` the correct answer rather than `18`?
- If the judge allowed `N` up to `10^9`, what two changes would you make? (Return type and
  parameter type become `long long`; nothing else changes.)
