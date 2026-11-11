# How to Think About It

## 1. Restate the task
One integer in, three facts out. Each fact is a separate question, so each one gets a
separate function. Two of the functions only *read* the number; the third must *write* it,
because the third output is the modified variable itself.

## 2. Spot the pattern
Three recognisable shapes:

| Question | Shape | Signature |
| --- | --- | --- |
| is it even? | predicate | `bool isEven(int n)` |
| what is the digit sum? | accumulate over digits | `int sumDigits(int n)` |
| make it positive | in-place modifier | `void makePositive(int& n)` |

The digit sum is the `% 10` / `/ 10` skeleton you have already met when extracting digits:
the last digit is `n % 10`, and removing it is `n / 10`. Everything else in the function is
bookkeeping around that pair.

## 3. Derive the algorithm
1. Read `N`.
2. **Parity:** `N % 2 == 0` is even. Because `%` keeps the dividend's sign, `-3 % 2 == -1`,
   which is not `0`, so odd negatives are classified correctly without any normalisation.
3. **Digit sum:** if `n < 0`, negate it first so `% 10` yields a positive digit. Set
   `sum = 0`. While `n > 0`: add `n % 10`, then `n /= 10`. Return `sum`.
4. **Absolute value:** if `n < 0`, set `n = -n` through the reference.
5. Print the word chosen by the ternary, then the digit sum, then `N`.

The loop in step 3 must be `while (n > 0)`, not `while (n != 0)`, for the sign-normalised
version: once `n` reaches `0` it must stop, and it can never go negative after normalisation.

## 4. Dry run
Input `N = -1234`.

**Parity:** `-1234 % 2` → `0` → `Even`.

**Digit sum** (`n = -1234`):

| Iteration | `n` before | `n % 10` | `sum` | `n /= 10` |
| --- | --- | --- | --- | --- |
| 0 | `1234` (after negation) | — | `0` | — |
| 1 | `1234` | `4` | `4` | `123` |
| 2 | `123` | `3` | `7` | `12` |
| 3 | `12` | `2` | `9` | `1` |
| 4 | `1` | `1` | `10` | `0` |
| 5 | `0` | loop ends | `10` | `0` |

**Make positive:** `N` is `-1234 < 0`, so the reference assignment sets `N = 1234`.

Result:
```text
Even
10
1234
```

Now the same trace *without* the negation, with `n = -1234`. Two different failures appear
depending on the loop guard:

- Keeping `while (n > 0)`: the guard is false immediately, the loop never runs, and the
  function returns `0`. Silent and wrong.
- Switching to `while (n != 0)`: `n % 10` yields `-4` and `n / 10` yields `-123`, so the sum
  drifts to `-4 - 3 - 2 - 1 = -10` before `n` reaches `0`. Also wrong, and the negative sign
  reveals that `%` copied the dividend's sign.

Either way the fix is the same: negate the local copy before the loop, and guard with `> 0`.

## Progressive hints
1. `isEven` is one line; do not write an `if` inside it.
2. To get a digit you need `% 10`; to move to the next digit you need `/ 10`.
3. Ask what `-1234 % 10` is before assuming it is `4`. Run it if you are unsure.
4. The third helper must take `int&`, or `main`'s `N` stays negative.
5. Print `N`, not the argument expression, after `makePositive`.

## Traps
- Keeping the negated value only in a local copy and then printing the original `N` — the
  third line would be negative.
- Using `while (n)` instead of `while (n > 0)` after normalisation: for a negative input the
  loop body would run and generate negative digits.
- Using `n % 10` on a negative number and adding `abs(n % 10)` digit by digit — works, but
  `abs(INT_MIN)` is itself a problem; normalising once is simpler.
- Assuming `int` can hold `-INT_MIN`.
- Forgetting `sum = 0` initialisation, which makes the result garbage.
- Printing `Even`/`odd`/`EVEN` instead of the exact word `Even`/`Odd`.

## Self-check
- Why is `-3 % 2` equal to `-1` and not `1`, and why does that still classify `-3` as odd?
- What does `sumDigits(0)` return, and which line of the function guarantees it?
- Which two of the three helpers would still work if you changed `int` to `unsigned`?
  (`isEven` yes; `sumDigits` yes after the sign branch is removed; `makePositive` becomes
  meaningless.)
- What single test input breaks the program today, and what is the minimal fix?
