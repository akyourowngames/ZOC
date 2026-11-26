# How to Think About It

## 1. Restate the task

Two numbers arrive: the value `N` and a count `K`. Return the integer made of
the final `K` digits of `N`. Example: `123456` with `K = 3` gives `456`.

## 2. Spot the pattern

Ask what a digit position means. In `123456`:

| digit | 1 | 2 | 3 | 4 | 5 | 6 |
| --- | --- | --- | --- | --- | --- | --- |
| place value | 100000 | 10000 | 1000 | 100 | 10 | 1 |

Keeping the last `K` digits means keeping only the terms whose place value is
below `10^K`. Every such term is smaller than `10^K`, and the kept part is
congruent to `N` modulo `10^K` — which is precisely the definition of the
remainder.

Small cases make the pattern obvious:

- `N % 10` keeps 1 digit.
- `N % 100` keeps 2 digits.
- `N % 1000` keeps 3 digits.

So the divisor is `10^K`, and the answer is `N % 10^K`.

## 3. Derive the algorithm

1. Read `N` and `K` in that order.
2. Set `p = 1`.
3. Repeat `K` times: `p = p * 10`. Now `p == 10^K`.
4. Print `N % p`.

Why a loop instead of `pow(10, K)`? `pow` works in floating point, so at large
`K` the result can be `9999999999.999...` and truncation gives the wrong
divisor. The loop is exact integer arithmetic and costs only `O(K)`.

## 4. Dry run

`N = 987654321`, `K = 5`:

| step | `p` | note |
| --- | --- | --- |
| start | 1 | |
| after 1 multiply | 10 | |
| after 2 | 100 | |
| after 3 | 1000 | |
| after 4 | 10000 | |
| after 5 | 100000 | loop ends |

`987654321 / 100000 = 9876` (integer division), and `9876 * 100000 = 987600000`.
Remainder `= 987654321 - 987600000 = 54321`. Output `54321`.

Second run, `N = 45`, `K = 3`: `p` ends at `1000`, `45 / 1000 = 0`, remainder
`45`. Output `45`, not `045`.

Third run, `N = 1000`, `K = 3`: `1000 % 1000 = 0`. The mathematical answer is
the three-digit string `000`, but as an integer it is `0`. Decide up front
which one the judge wants.

## Progressive hints

1. What single operator can erase the high digits of a number? Try `%` against
   `10`, `100`, `1000` and see which digits survive.
2. Write the divisor as a power of ten in terms of `K`.
3. Build that power with a counter loop, then apply one modulo. No string
   conversion is needed.

## Traps

- The active code hardcodes three multiplications, so it silently ignores `K`.
  Testing only `K = 3` hides the defect.
- `10 ^ K` is bitwise XOR in C++, not exponentiation. `10 ^ 3 == 9`.
- `pow(10, K)` returns `double`; convert with `+0.5` and a cast, or avoid it.
- `10^10` does not fit in `int`; the divisor overflows before `N` does.
- If `K` exceeds the number of digits, nothing is removed — that is correct,
  but fixed-width output would need padding.
- Negative `N` gives a negative remainder in C++, because `/` and `%` truncate
  toward zero.

## Self-check

- Given `N = 2147483647`, `K = 3`, what is printed? (`647`)
- Why is `N % 1000` unable to produce a value above `999`?
- What is the largest `K` that keeps `10^K` inside `int`? (`9`)
- If the judge printed leading zeros, what output would `45 3` need? (`045`)
- How many loop iterations does the divisor loop run, and does it depend on `N`?
  (Exactly `K`; no.)
