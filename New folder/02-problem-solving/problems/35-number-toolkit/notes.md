# Deep Notes

## Core logic
Three orthogonal questions about one `int`, answered by three functions that differ in
*parameter mode*: read-only value (`isEven`), read-only value with an internal working copy
(`sumDigits`), and write-through reference (`makePositive`). The output order is parity,
digit sum, positive value.

## Code walkthrough
```cpp
bool isEven(int n) {
    return n % 2 == 0;
}
```
`%` on a negative dividend keeps the sign of the dividend (`-3 % 2 == -1`), so the test is
`== 0` rather than `== 1`. `true`/`false` convert to `1`/`0` if printed, but `main` converts
them to words instead.

```cpp
int sumDigits(int n) {
    if (n < 0) {
        n = -n;
    }
    int sum = 0;
    while (n > 0) {
        sum += n % 10;
        n /= 10;
    }
    return sum;
}
```
- The negation writes to the **local copy**, so the caller's `N` is unaffected — compare with
  `makePositive`, where the same statement has an external effect.
- `while (n > 0)` terminates when no digits remain; for `n == 0` the body never runs and the
  function returns `0`, which is the correct digit sum of zero.
- `sum` is initialized inside the function on every call; a `static` here would accumulate
  across calls and produce wrong answers on the second use.
- Digit order is least-significant first, which does not matter for a sum but does matter for
  reversal problems.

```cpp
void makePositive(int& n) {
    if (n < 0) {
        n = -n;
    }
}
```
`int& n` aliases the caller's variable, so the assignment is visible in `main`. For
non-negative input the `if` is skipped and nothing is written — the function is a no-op, not a
copy operation.

```cpp
cin >> N;
cout << (isEven(N) ? "Even" : "Odd") << endl;
cout << sumDigits(N) << endl;
makePositive(N);
cout << N;
```
- The ternary turns a `bool` into the required token without an `if` ladder.
- `sumDigits(N)` runs before the mutation; with a sign-independent sum the order is not
  observable, but writing it before is the safer habit.
- The last print has no trailing newline.
- `using namespace std;` plus `cout << (bool)` would print `1`/`0` — the ternary avoids that.

## Why it works
Parity is decided by whether 2 divides `n`, and `%` reports exactly that regardless of sign.
The digit-sum loop maintains the invariant "`sum` equals the digit sum of the digits already
removed, and `n` holds the not-yet-processed prefix`. Each iteration removes exactly one
decimal digit because `n / 10` shifts the decimal representation right by one place, so the
loop runs `d` times and the invariant plus the empty-prefix condition gives the total. The
in-place modifier works because a reference is the caller's object, not a copy.

## Complexity
`isEven` and `makePositive` are `O(1)`. `sumDigits` is `O(d)` where `d = floor(log10 |n|) + 1`,
at most 10 for a 32-bit `int`, so it is effectively constant. Space is `O(1)`: one accumulator
and a mutated argument. If you write the digit sum recursively, the call depth is `d` and the
stack cost becomes `O(d)`.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `-1234` | `Even`, `10`, `1234` | negative path for all three helpers |
| `7` | `Odd`, `7`, `7` | single digit, already positive |
| `0` | `Even`, `0`, `0` | loop body never executes; `sum` stays `0` |
| `-1` | `Odd`, `1`, `1` | `-1 % 2 == -1`, negation to `1` |
| `-5` | `Odd`, `5`, `5` | sign normalisation then a single digit |
| `1000000007` | `Odd`, `8`, `1000000007` | 10 digits, digit sum `8`, already positive |
| `-2147483647` | `Odd`, `46`, `2147483647` | largest magnitude negative; negation still fits |
| `-2147483648` | UB | `-n` overflows; see Current-code review |

## Common mistakes
- Forgetting `sum = 0` or declaring it `static`, so the second call returns a doubled sum.
- Using `do { } while (n)` — the digit sum of `0` becomes an accidental extra iteration in
  variants where `sum += n % 10` runs before the guard.
- Normalising the sign in `main` instead of inside the helper, so the helper breaks when
  reused elsewhere.
- Writing `void makePositive(int n)` and then being surprised that `N` is unchanged.
- Returning `abs(n)` from `abs` without `<cstdlib>` — or using `abs` on `int` at all when a
  simple comparison suffices.
- Printing `N` before the mutation, so the third line duplicates the first.
- Off-by-one thinking: a number with `d` digits needs exactly `d` iterations, and `0` needs
  zero. `100` needs three (`0`, `0`, `1`), not two.

## Variants and follow-ups
- **Count digits / reverse digits / largest digit:** same skeleton, different accumulator —
  see folders 15, 18, and 19.
- **Digit sum until one digit:** wrap `sumDigits` in a loop while the result is `>= 10`
  (folder 30), or use the digital-root fact `1 + (n - 1) % 9`.
- **Parity without `%`:** `(n & 1) == 0` works for two's-complement negatives, where `-3 & 1`
  is `1`. Faster, arguably less readable.
- **`long long` version:** makes the `INT_MIN` case safe and extends the digit count to 19,
  which is the usual fix when a judge allows `10^18`.
- **`abs` overloading trap:** `abs(int)` lives in `<cstdlib>`, `std::abs` in `<cmath>`; mixing
  them with `using namespace std` occasionally picks the floating-point overload, so hand
  writing the comparison is clearer.

## Key takeaways
- Remainder inherits the dividend's sign; digit code must decide which convention it assumes.
- Pick the parameter mode per function: value to read, reference to rewrite.
- Zero is a legitimate input for digit problems and exercises the loop guard.
- `INT_MIN` is the standard negation trap; one test of `-2147483648` finds it.

## Current-code review
The active code matches the statement for all ordinary inputs, but one input class triggers
undefined behaviour:

1. **Negating `INT_MIN`.** `N = -2147483648` is a valid `int`, and `-n` overflows because
   `2147483648 > INT_MAX`. This happens in two places: `sumDigits` (`n = -n;`) and
   `makePositive` (`n = -n;`). Both are signed overflow, i.e. undefined behaviour. Observed
   result with MSVC: the digit sum prints `0` (the sign never flips, so `while (n > 0)` never
   runs) and the third line still prints `-2147483648` — a plausible-looking but wrong pair of
   answers. Fix: use `long long` for the working copy, e.g. `long long m = n; if (m < 0) m = -m;`
   and accumulate into a `long long`.
2. **No trailing newline** after `cout << N;` — harmless for judges, untidy in a terminal.
3. **`using namespace std;`** at file scope is fine in single-file practice code; in headers
   it is a well-known hazard because it leaks into every includer.
