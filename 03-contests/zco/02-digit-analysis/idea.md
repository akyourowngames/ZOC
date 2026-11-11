# How to Think About It

## 1. Restate and formalize

We read `N >= 0` and produce three values derived from its decimal digits.

Write `N` with `k` digits as `N = sum(d(i) * 10^i)` for `i = 0..k-1`, where
`d(0)` is the units digit and `d(k-1)` is the most significant digit.

| Quantity | Definition | Example for `N = 1200` |
|---|---|---|
| Digit sum | `S = sum(d(i))` | `1 + 2 + 0 + 0 = 3` |
| Reversal | `R = sum(d(i) * 10^(k-1-i))` | `0*1000 + 0*100 + 2*10 + 1 = 21` |
| Palindrome | `R == N` | `21 != 1200`, so `false` |

`R` is an integer, so any leading zeros of the written reversal are not
represented: the reversed digit string `"0021"` has integer value `21`. A
palindrome still compares correctly because `N` itself has no leading zeros
when `N > 0`.

`N = 0` is a single digit: `S = 0`, `R = 0`, and it is a palindrome.

## 2. Start from brute force

A safe reference converts to a string:

```text
s = to_string(N)
sum = sum of digits of s
r = reverse(s)
print sum, r, (r == s)
```

It is `O(d)` time and `O(d)` space, cannot overflow, and makes the leading-zero
question explicit: the string reversal is `"0021"` for `1200`, while the integer
`21` is what the committed program prints.

The committed code instead peels digits arithmetically with `n % 10` and
`n / 10`, which is the right primitive when integer output is required. Its
two hazards are leading-zero loss and accumulator overflow.

## 3. Derive the optimization

There is no asymptotic optimization to find: any correct algorithm must look
at every digit, so `Omega(d)` is a lower bound. The work is to make one loop do
all the jobs and to make it robust.

### The digit loop invariant

Let `n_t` be the value after `t` iterations, with `n_0 = N`. Each iteration
peels the last digit:

- `digit = n_t % 10` is the `t`-th digit from the right;
- `n_(t+1) = n_t / 10` removes it;
- `sum_t` is the sum of the `t` least significant digits;
- `rev_t` is those `t` digits read in reverse order.

The invariant holds initially (`t = 0`, empty prefix) and is preserved by
`rev = rev * 10 + digit`, which shifts the existing digits one place left and
appends the new one on the right. The loop ends when `n = 0`, i.e.
`t = k`, where `rev = R(N)` and `sum = S(N)`.

### Combining the passes

`sumDigits` and `reverseNumber` traverse the same digits independently. They
can be merged:

```text
sum = 0; rev = 0
while (n > 0):
    d = n % 10
    sum += d
    rev = rev * 10 + d
    n /= 10
```

This halves the loop overhead but not the complexity. Keep them separate if
clarity matters more; the current file has three copies, which is worse than
either choice.

### Palindrome without trusting the reverse

Two alternatives avoid overflow:

1. **String two-pointer.** Convert to a string and compare `s[i]` with
   `s[d-1-i]`. `O(d)` time, `O(d)` space, no arithmetic.
2. **Half reversal.** Reverse only the second half of the digits and compare
   with the first half. This never builds a number larger than `N`, so it is
   overflow-safe even for 64-bit inputs. It is the standard LeetCode-style
   solution and is more intricate than reversal.

The committed `isPalindrome` duplicates the reverse loop and compares with
`int`. It is correct whenever the reversal fits; otherwise the comparison is
meaningless.

### Overflow threshold

`rev = rev * 10 + digit` overflows when the true reversal exceeds
`INT_MAX = 2147483647`. For `N = 1000000007` the reversal is `7000000001`,
which does not fit. On the test build the wrapped value was `-1589934591`;
that is undefined behavior in C++, so no particular value is guaranteed.

## 4. Correctness sketch

**Claim 1 (digit sum).** By the invariant, after `k` iterations `sum` equals
`d(0) + ... + d(k-1)`, which is `S(N)`.

**Claim 2 (reversal).** After `t` iterations, `rev_t = d(0) * 10^(t-1) + ... +
d(t-1)`. Induction: `rev_(t+1) = rev_t * 10 + d(t)`, exactly the definition
for one more digit. At `t = k`, `rev = R(N)`.

**Claim 3 (palindrome).** `isPalindrome` stores `original = N`, mutates a copy
(the parameter is by value), computes `R(N)`, and returns
`original == R(N)`. That is the definition. The function does not leak the
mutation to `main`.

**Claim 4 (termination).** For `n > 0`, integer division by 10 strictly
decreases `n` and preserves non-negativity, so the loop reaches `0` after
exactly `k` iterations. For `n = 0` it performs zero iterations, which is why
`0` prints `0`, `0`, `true`.

The correctness claims are conditional on the reversal fitting in `int`; the
overflow case is a defect, not a valid computation.

## 5. Dry run

### `N = 1200`

| Iteration | `n` before | `digit = n % 10` | `sum` | `rev` | `n` after |
|---:|---:|---:|---:|---:|---:|
| 1 | 1200 | 0 | 0 | 0 | 120 |
| 2 | 120 | 0 | 0 | 0 | 12 |
| 3 | 12 | 2 | 2 | 2 | 1 |
| 4 | 1 | 1 | 3 | 21 | 0 |

Result: `3`, `21`, and `1200 == 21` is `false`.

Note that the two trailing zeros contribute nothing to `rev`: once `rev` is
`0`, multiplying by 10 keeps it `0`. This is the mechanism behind leading-zero
loss.

### `N = 1221`

| Iteration | `digit` | `sum` | `rev` | `n` after |
|---:|---:|---:|---:|---:|
| 1 | 1 | 1 | 1 | 122 |
| 2 | 2 | 3 | 12 | 12 |
| 3 | 2 | 5 | 122 | 1 |
| 4 | 1 | 6 | 1221 | 0 |

Result: `6`, `1221`, `true`.

### `N = 1000000007` (overflow case)

The digit sum is `8`, but the reversal `7000000001` exceeds `INT_MAX`; the
observed `-1589934591` is undefined behavior, and the palindrome verdict is
right only by accident.

## Progressive hints

1. `n % 10` gives the last digit; `n / 10` removes it. Repeat until `n == 0`.
2. To build a number from digits, start at `0` and do `rev = rev * 10 + d`.
3. Save `N` before the palindrome loop; the loop destroys its copy.
4. If `N = 0`, the loop body never runs. Decide what the three outputs should
   be and check that the natural zero values match.
5. If a reversal looks negative or absurdly small, suspect 32-bit overflow.
6. Three copies of the same loop are a maintenance hazard; factor out one
   helper.

## Traps

- Comparing the mutated `n` to the reverse instead of the saved original.
- Writing `rev = rev + digit` or `rev = rev + digit * 10`; both are wrong.
- Expecting `reverse(1200) = 0021` as an integer; integers do not store leading
  zeros.
- Declaring the reverse as `int` when `N` is up to `10^9`; the reversal can be
  about ten times larger.
- Handling negative `N` by running the loop while `n > 0`, which yields zeros.
- Assuming `n % 10` is the last digit for negative `n`; in C++ it is negative
  or zero (e.g. `-121 % 10 == -1`).
- Printing `True` with a capital letter or adding labels.
- Calling `isPalindrome` after the input was already consumed by value; safe
  here, but a reference parameter would make it a bug.
- Forgetting that the third output is on its own line, not appended to the
  reversal.

## Self-check

1. Why must the original be saved before reversing?
   Because the loop drives `n` to `0`; only a saved copy keeps the input.
2. What is `reverse(1000)` and why?
   `1`: the three trailing zeros multiply a zero accumulator by 10 and vanish.
3. Is `10` a palindrome?
   No: its reversal is `1`, and `10 != 1`.
4. Where exactly can overflow occur for `N = 2147483647`?
   In `rev * 10 + digit`; the true reversal `7463847412` exceeds `INT_MAX`.
5. Does reversing twice recover `N`?
   No: `1200 -> 21 -> 12`. Reversal is lossy because of trailing zeros.
6. What changes if the judge wants `"0021"` for `1200`?
   An integer accumulator is wrong; print a zero-padded string of length `d`.
