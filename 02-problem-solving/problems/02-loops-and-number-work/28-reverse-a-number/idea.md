# How to Think About It

## 1. Restate the task

Produce a new number whose decimal representation is `N`'s representation read
right to left. Same digits, same multiset, reversed positions.

## 2. Spot the pattern

The extraction half is already familiar: `% 10` gives the digits in reverse
order for free. So the question becomes: **how do I build a number out of
digits arriving in that order?**

Any decimal number is `d_k * 10^k + ... + d_1 * 10 + d_0`. Building it
left-to-right means, at each step: shift everything already built one place to
the left, then place the new digit in the vacated units column. In arithmetic
that is `value = value * 10 + digit`.

So this problem is the digit loop with a *different accumulator*:
`rev * 10 + digit` instead of `sum += digit`. Same traversal, different fold.

## 3. Derive the algorithm
1. Read `N`.
2. `rev = 0` — an empty sequence of digits has value `0`.
3. `digit = N % 10` — the digit that must become the new most significant one.
4. `rev = rev * 10 + digit` — shift the built number and append.
5. `N = N / 10` — consume the digit.
6. Repeat 3–5 while `N > 0`.
7. Print `rev`.

The traversal must be least-significant first. It is, because `% 10` yields
exactly that — which is why no stack, array, or string is needed.

## 4. Dry run

**`N = 1204`**

| iteration | `N` | `digit` | `rev` before | `rev * 10 + digit` | `N` after `/10` |
| --- | --- | --- | --- | --- | --- |
| 1 | 1204 | 4 | 0 | 0*10+4 = **4** | 120 |
| 2 | 120 | 0 | 4 | 4*10+0 = **40** | 12 |
| 3 | 12 | 2 | 40 | 40*10+2 = **402** | 1 |
| 4 | 1 | 1 | 402 | 402*10+1 = **4021** | 0 |

Output `4021`. Watch how the partial answers read: `4`, `40`, `402`, `4021` —
the digits appear on the right and the number grows leftwards.

**`N = 1200`**

| iteration | `N` | `digit` | `rev` | note |
| --- | --- | --- | --- | --- |
| 1 | 1200 | 0 | 0 | `0*10+0 = 0`, still zero |
| 2 | 120 | 0 | 0 | second zero changes nothing |
| 3 | 12 | 2 | 2 | first non-zero digit |
| 4 | 1 | 1 | 21 | |

Output `21`. The two zeros were processed but left no trace, because leading
zeros have no value.

**`N = 5`**

One iteration: `digit = 5`, `rev = 0*10 + 5 = 5`. Output `5`. A `do-while`
handles single digits and `0` without extra branches.

**Overflow check, `N = 1999999999` (fits in `int`)**

| iteration | `digit` | `rev` |
| --- | --- | --- |
| 1 | 9 | 9 |
| 2 | 9 | 99 |
| 3 | 9 | 999 |
| 4 | 9 | 9999 |
| 5 | 9 | 99999 |
| 6 | 9 | 999999 |
| 7 | 9 | 9999999 |
| 8 | 9 | 99999999 |
| 9 | 9 | 999999999 |
| 10 | 1 | 9999999991 — **greater than `INT_MAX`** |

`9999999991` cannot be stored in `int`; the multiplication overflows and the
result is undefined behaviour, not merely a wrong number.

## Progressive hints

1. The digit loop gives digits from the units end. Which end of the answer
   should each new digit go to?
2. How do you multiply a number by 10 without a `*`? (`rev << 3` is 8x, not
   10x — there is no cheap shift; just use `* 10`.)
3. What value of `rev` before the first digit guarantees the first digit lands
   in the units place? (`0`.)
4. Before finishing, ask what the *largest possible* `rev` is for the allowed
   input range. If it exceeds the type, change the type.

## Traps

- **`rev = rev * 10 + N % 10` without the `/ 10`.** Infinite loop.
- **`rev = rev + digit * 10`.** Adds ten times the digit to the accumulator
  instead of appending it.
- **Assuming `rev` fits whenever `N` fits.** A 10-digit number that ends in a
  large digit usually overflows. A very common hidden failure.
- **Expecting `0021`.** Integer output cannot show leading zeros; you need a
  string if the judge demands them.
- **Reversing a negative number and forgetting the sign.** `-120` yields `-21`
  in this code; the statement usually assumes non-negative input.
- **Using the variable name `reverse` with `using namespace std`.** It shadows
  `std::reverse`; legal, but confusing and it breaks if you later call the
  algorithm. `rev` is the usual name.

## Self-check

- `1234` → `4321`? Then `1000` → ? (`1`.)
- Why does the loop terminate when `N` ends in zeros? (Because `N` still divides
  down to `0`; zeros are processed, just invisibly.)
- Which accumulator change turns this into the digit sum? (`sum += digit`.)
- Which change turns it into the digit product? (`prod *= digit`, start at
  `1`.)
- What is the exact condition under which `rev` overflows? (`rev > (INT_MAX -
  digit) / 10` before the update — the check used by `atoi`-style parsers.)
