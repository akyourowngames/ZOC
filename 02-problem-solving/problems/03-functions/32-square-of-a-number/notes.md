# Deep Notes

## Core logic
The whole program is one expression, `N * N`, wrapped in a function so that it can be
reused and tested independently of I/O. There is no state and no loop, so correctness
reduces to two questions: is the arithmetic right, and does the value fit in the type?

## Code walkthrough
```cpp
int square(int N) {
    return N * N;
}
```
- `int N` is a **value parameter**: at the call site the argument is copied. Mutating `N`
  inside would be invisible to the caller.
- `N * N` is integer multiplication of two `int`s; the result type is `int`, so the
  product is computed in 32 bits and can overflow before it is ever returned.
- `return` hands the value back; the function ends immediately, so no `else` is needed.

```cpp
int main() {
    int M;
    cin >> M;
    cout << square(M);
}
```
- `int M;` is uninitialized. If `cin >> M` fails (end of input, or a letter), `M` keeps
  garbage and `square` computes garbage. Competitive solutions usually assume valid input,
  but you should know the failure mode.
- `square(M)` copies `M` into `N`; `M` itself is untouched afterwards.
- `cout << square(M);` prints the returned `int` in decimal with no trailing newline. That
  is normally accepted, but adding `<< '\n'` is safer and costs nothing.
- No `return 0;` in `main` — allowed since C++11, where falling off `main` means success.

## Why it works
Multiplication is defined for all pairs of `int` *mathematically*, but C++ defines the
result only when it fits; when it does not, the operation is undefined. For inputs inside
the range, `N * N` is exactly the square by the definition of multiplication, and since
`x * x = (-x) * (-x)`, the sign of the input never matters. Passing by value means the
answer depends only on the argument, never on earlier calls.

## Complexity
One read, one multiplication, one write: `O(1)` time and `O(1)` space. Output length grows
like `O(log |N|)` digits, which is still constant for fixed-width `int`. There is no
allocation; the only memory is two locals (`M` in `main`, `N` in `square`) plus the return
slot.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `0` | `0` | zero squared is zero; function must not loop or divide |
| `1` | `1` | fixed point of squaring |
| `-1` | `1` | sign cancels |
| `-7` | `49` | negative squared is positive |
| `46340` | `2147395600` | largest `N` whose square fits in `int` |
| `46341` | overflow (UB) | `2,147,488,281 > INT_MAX` |
| `100000` | overflow (UB) | would need `long long` |
| `abc` | undefined | `cin >> M` fails, `M` never assigned |

## Common mistakes
- Using `^` for exponentiation. `N ^ 2` is XOR and produces `6` for `N = 4`; the compiler
  never warns because the expression is perfectly legal.
- Using `pow`. It returns `double`; comparing or printing large results loses precision, and
  `pow(46341, 2)` silently produces an approximation instead of flagging overflow.
- Declaring `long long` only for the return type but leaving the parameter as `int` — the
  multiplication still happens in `int` and overflows before conversion.
- Forgetting that `int` is at least 16 bits in the standard; the exact cutoff `46340` holds
  for the usual 32-bit `int` only.
- Adding a label or trailing words to the output.

## Variants and follow-ups
- **Wider types:** `long long square(long long n)` moves the boundary to `|n| <= 3037000499`.
- **Reference version:** `void squareInPlace(int& n) { n = n * n; }` — same math, but now the
  caller's variable changes; contrast it with the value version to see why `&` matters.
- **Power function:** compute `x^k` in `O(log k)` with binary exponentiation, using
  `long long` and a modulo to avoid overflow (the core of modular-exponentiation problems).
- **Overflow-safe check:** detect overflow before multiplying with
  `if (n > INT_MAX / n)`, or use `__builtin_mul_overflow` on GCC/Clang.
- **Geometric reading:** `N * N` is the area of a square of side `N`, which is where the
  name comes from and a good sanity check for small values.

## Key takeaways
- Put computations in pure functions; keep `main` for I/O.
- The return type decides where overflow happens — widening only the return type is not enough.
- `^` is XOR; `pow` is floating point; multiplication is the correct tool.
- Always ask "what is the largest input for which my arithmetic is still defined?"

## Current-code review
The active code matches the statement: `square` returns `N * N` and the result is printed
once. Two honest limitations rather than deviations, kept here so the file is not read as
a bug-free reference:

1. **No overflow guard.** The product is formed in `int`. For `|N| >= 46341` the program has
   undefined behaviour (typically printing a negative value such as `-2147479015`). The fix
   is `long long` in both the parameter and the return type.
2. **No trailing newline.** `cout << square(M);` leaves the prompt glued to the number in an
   interactive terminal. Judges accept it; humans prefer `<< '\n'`.
