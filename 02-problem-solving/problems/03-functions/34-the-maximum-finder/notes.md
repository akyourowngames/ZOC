# Deep Notes

## Core logic
`maximum` is a pure selection between two copies; `swapNumbers` is a simultaneous update of
two caller-owned objects. Neither does arithmetic that can overflow, so the whole `int` range
is safe. The output is a two-stage report: a line for the comparison result, a line for the
post-swap state.

## Code walkthrough
```cpp
int maximum(int a, int b) {
    if(a > b) {
        return a;
    } else {
        return b;
    }
}
```
Both parameters are copies, so the caller's `N` and `M` are untouched. The `else` covers
`a == b` and `a < b`, returning `b`; for ties `a` and `b` hold the same number, so the choice
is unobservable in the output. Every path returns, so no "control reaches end of non-void
function" warning.

```cpp
void swapNumbers(int &a, int &b) {
    int temp;
    temp = a;
    a = b;
    b = temp;
}
```
`a` and `b` are aliases for the caller's `N` and `M`. `temp` is a local that lives only for
the call; it is uninitialized until `temp = a`, which is fine because it is written before it
is read. The three assignments are a cycle rotation, which requires exactly one extra
storage slot.

```cpp
int N, M;
cin >> N >> M;
cout << maximum(N, M) << endl;
swapNumbers(N, M);
cout << N << " " << M;
```
- `cin >> N >> M` reads two whitespace-separated integers; it returns the stream, which is
  why chaining works.
- `endl` writes `'\n'` and flushes the buffer. `'\n'` would be equivalent for output content.
- The final `cout` has no newline; acceptable for judges, slightly untidy for terminals.
- `N` and `M` are declared together but assigned separately by the two extractions, so a
  failed second read would leave `M` uninitialized.

## Why it works
`a > b ? a : b` is the maximum by definition: it is one of the inputs (`a` or `b`) and no
input is larger. The swap works because assignment is destructive but sequential: after
`temp = a`, the original `a` exists twice; after `a = b`, `b`'s original value exists twice;
after `b = temp`, each variable holds the other's original value and `temp` is discarded.
References make the first two assignments write into the caller's storage rather than into
copies, so the effect is visible after the call returns.

## Complexity
Two comparisons at most, three assignments, two reads, three writes: `O(1)` time and `O(1)`
space. No loops, no allocation, no dependence on input magnitude.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `4 9` | `9` then `9 4` | documented example |
| `9 4` | `9` then `4 9` | maximum is the first argument; swap still reverses |
| `7 7` | `7` then `7 7` | equality returns `b`; swap is invisible |
| `-3 -8` | `-3` then `-8 -3` | negatives compare by value, not magnitude |
| `-8 -3` | `-3` then `-3 -8` | mirror of the previous case |
| `0 -1` | `0` then `-1 0` | zero is greater than a negative |
| `2147483647 -2147483648` | `2147483647` then `-2147483648 2147483647` | no arithmetic, so extremes are safe |
| `5` (single token) | UB | `M` never assigned; `maximum` reads garbage |

## Common mistakes
- Missing `&` in `swapNumbers` — the single most common bug in this exercise.
- Using the addition/subtraction swap: overflow makes it wrong (and UB) for large inputs.
- Writing `if (a > b) return a;` with no trailing `return`, which is UB if control falls off.
- Assuming `maximum(4, 9)` returns the *position* or index rather than the value.
- Printing `maximum(9, 4)` after the swap by mistake, so the same number appears twice.
- Confusing "maximum" with "absolute maximum": `-3` beats `-8` here, unlike `abs` values.

## Variants and follow-ups
- **Standard library:** `std::max(N, M)` from `<algorithm>` and `std::swap(N, M)` from
  `<utility>` do the same thing; the hand-written versions teach the mechanics.
- **Maximum of three:** extend to `maximum(a, maximum(b, c))` or use a running best value —
  the fold pattern that generalises to arrays (see folder 38).
- **Return both extrema:** `void minMax(int a, int b, int& lo, int& hi)` — output parameters,
  the style C++ inherited from C.
- **Sort two values:** after the swap, `N <= M` is false for `4 9` (it becomes `9 4`); to sort
  ascending you would swap only when `a > b`.
- **Pointer swap:** `void swapNumbers(int* a, int* b)` called as `swapNumbers(&N, &M)`, for
  comparison with the reference syntax.

## Key takeaways
- The signature tells you whether a function can affect the caller: `int maximum(int, int)` no,
  `void swapNumbers(int&, int&)` yes.
- One temporary is necessary and sufficient to swap two objects.
- Comparison never overflows; arithmetic-based swaps can.
- `endl` = newline + flush; prefer `'\n'` unless you actually need the flush.
