# How to Think About It

## 1. Restate the task

Given one integer `N`, walk over its decimal digits and return their **product**. Not
the sum, not the count. A single `0` digit annihilates the whole answer.

## 2. Spot the pattern

This is the same skeleton as "count digits" and "sum digits" with a different fold:

| Question | Identity | Fold step |
| --- | --- | --- |
| how many digits? | `0` | `count += 1` |
| sum of digits? | `0` | `sum += d` |
| product of digits? | `1` | `product *= d` |
| largest digit? | `0` (or `-1`) | `best = max(best, d)` |
| smallest digit? | `9` | `best = min(best, d)` |

"Identity" means the value that leaves the fold unchanged, so the first real element
replaces it cleanly. Pick the wrong identity and every answer is wrong the same way.

The digit primitive never changes:

```cpp
int d = N % 10;   // lowest digit
N = N / 10;       // shift the number right one decimal place
```

In base 10, `% 10` is the remainder below the next power of ten (the last digit) and
`/ 10` shifts the decimal point — the C++ equivalent of `N >> 1` in binary.

## 3. Derive the algorithm

1. Read `N`.
2. Set `product = 1`.
3. While `N > 0`:
   a. `d = N % 10`
   b. `product = product * d`
   c. `N = N / 10`
4. Print `product`.

No digit is stored: this is a streaming fold, so O(1) memory is enough. No array, no
string, no recursion.

## 4. Dry run

`N = 5831`

| step | `N` before | `N % 10` | `product` after | `N` after |
| --- | --- | --- | --- | --- |
| 1 | 5831 | 1 | 1 | 583 |
| 2 | 583 | 3 | 3 | 58 |
| 3 | 58 | 8 | 24 | 5 |
| 4 | 5 | 5 | 120 | 0 |
| 5 | 0 | - | loop ends | 0 |

Output `120`. Check: `5*8*3*1 = 120`. Correct.

`N = 203`

| step | `N` before | digit | `product` after |
| --- | --- | --- | --- |
| 1 | 203 | 3 | 3 |
| 2 | 20 | 0 | 0 |
| 3 | 2 | 2 | 0 |

Output `0`. Once the accumulator hits zero it cannot recover — a property of
multiplication, not a bug.

`N = 7` (single digit): one iteration, `product = 7`, then `N` becomes `0`. Output `7`.

`N = 1000`: digits `0, 0, 0, 1`; product is `0` after the first step and stays `0`.

## Progressive hints

1. How do you get the last digit of a positive integer? (`% 10`)
2. How do you delete the last digit? (`/ 10`)
3. What must the accumulator start at so the first multiply does not distort the value?
   (`1` — the multiplicative identity)
4. When is the number exhausted? (`N == 0`)
5. What does `N = 100` produce, and why? (`0`; a zero digit kills the product)
6. What is the largest product possible from an `int`-sized input? (`9^9 = 387420489`)

## Traps

- Initializing `product = 0`: the answer is `0` for every input.
- Expecting `N = 0` to print `0`; this code prints `1` because the loop body never runs
  (empty product). See `## Current-code review` in notes.md.
- Adding instead of multiplying, or multiplying `N` instead of the extracted digit.
- Forgetting `N /= 10` — infinite loop, because the loop condition never changes.
- Mixing types: `long long N` with `int product` overflows silently for long inputs.
- Negative input: `N > 0` is false immediately, and in C++ `-7 % 10 == -7`, so negatives
  fall through with the empty product `1`.
- Printing a label such as `Product: 120` when the expected output is a bare number.

## Self-check

- State the identity element for `+`, `*`, `max`, `min`, and a boolean `AND`/`OR`.
- Trace `N = 1000` and `N = 909` by hand; both must print `0`.
- Trace `N = 1` and `N = 9`; both must print the digit itself.
- Explain why extracting left-to-right would give the same answer (commutativity).
- Explain precisely where `long long` would become necessary and why it is not needed
  for `int` input here.
