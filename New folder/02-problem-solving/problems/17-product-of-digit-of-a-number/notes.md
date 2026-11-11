# Deep Notes

## Core logic

The program is a fold over the digit stream of `N`:

- State: `product`, initialized to `1`.
- Step: `product *= N % 10`.
- Advance: `N /= 10`.
- Stop: `N == 0`.

Two facts make it correct. First, `N % 10` is exactly the last decimal digit of a
non-negative `N`. Second, `N / 10` removes exactly that digit with no rounding error,
because integer division truncates toward zero and `N >= 0`. After `d` iterations the
original value is fully consumed, so every digit has been multiplied in exactly once.

## Code walkthrough

```cpp
int N, product;      // product is not yet initialized here — this is the risky part
cin >> N;            // read the number
product = 1;         // multiplicative identity

while (N > 0) {      // repeated until the digit stream is empty
    product *= N % 10;   // fold in the current last digit
    N = N / 10;          // drop that digit
}

cout << product;     // bare number, no newline
```

Line-by-line intent:
- `int N, product;` declares but does not initialize `product`. If someone later moves
  the `product = 1;` line below the loop, the accumulator is garbage; declaring
  `int product = 1;` is safer.
- `cin >> N` notes: no prompt string, which is correct for judges (a prompt would land
  in the output).
- `product *= N % 10` is a compound assignment; `%` binds tighter than `*=`, so this is
  `product = product * (N % 10)`.
- `N = N / 10` is the same as `N /= 10` for non-negative values.
- `cout << product;` omits `endl`; the trailing newline is usually optional, but some
  judges are strict about trailing whitespace — a bare number with no newline is the
  safest common choice.

## Why it works

Invariant: at the top of each iteration, `product` equals the product of all digits
already removed from the original number, and `N` still holds the unprocessed prefix.

- Base: before the first iteration no digit has been removed and `product = 1`, the
  empty product. True.
- Step: the loop removes digit `d = N % 10` from the tail and multiplies it in, so the
  invariant holds for the new state.
- Exit: `N == 0` means every digit was removed, so `product` is the product of all
  digits of the original number.

The empty product is `1` by definition (the identity of multiplication), which is why
`N = 0` prints `1` rather than `0`.

## Complexity

- Time: O(d) with `d = floor(log10 N) + 1` digits; each iteration is O(1).
- Space: O(1) — only two integers, no array or string.
- Worst case for `int`: 10 iterations, effectively constant time.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| 5 | 5 | one-digit number; identity does not distort it |
| 1000 | 0 | zero digit absorbs the product |
| 203 | 0 | zero in the middle; `2*0*3` |
| 5831 | 120 | ordinary case |
| 999999999 | 387420489 | largest 9-digit product; fits in `int` |
| 2147483647 | 903168 | worst-case `int` magnitude, still small |
| 0 | 0 (intended) / current code prints 1 | empty product vs "the digit 0" |
| -25 | undefined by statement; current code prints 1 | loop skipped, sign never handled |

## Common mistakes

- Initializing the accumulator to `0` instead of `1`.
- Using `while (N >= 0)` — infinite loop for `N = 0` on the second pass.
- Multiplying `N` (the shrinking number) instead of `N % 10`.
- Forgetting to advance `N`, producing an infinite loop.
- Reading digits into a `vector<int>` when a single accumulator suffices.
- Assuming a zero digit is "ignored" the way it is when counting digits; for a product it
  is fatal.
- Overflow: `int` is fine here, but the pattern breaks the moment input grows past nine
  or ten digits. `long long` is 64-bit and handles up to 18 nines for a product.

## Variants and follow-ups

- **Product of non-zero digits**: skip the `0` digit with `if (d != 0) product *= d;`.
  Now `1000` yields `1` instead of `0`.
- **Sum instead of product**: change the identity to `0` and `*=` to `+=`.
- **Digit product until one digit (multiplicative persistence)**: wrap this loop in an
  outer `while (N >= 10)` loop, an O(log* N) analogue of the additive digital root.
- **Product of the first and last digit**: cheapest with the digit stream plus a stored
  last-digit variable.
- **Reverse, count, largest, smallest digit**: same loop, different fold — see folders
  18 to 20.
- **Recursive form**: `prod(n) = (n < 10) ? n : (n % 10) * prod(n / 10)`, which makes the
  empty-product issue explicit at the base case.

## Key takeaways

- Identity element first, then the fold: the order of those decisions is what makes
  accumulator code easy to get right.
- `% 10` / `/ 10` is the workhorse of every digit problem in this section.
- Absorbing elements (`0` under `*`) mean partial results can be permanently lost.
- Judge output should usually be bare: no prompts, no labels.

## Current-code review

Behaviour for `N = 0`: the loop condition `N > 0` is false at entry, so the program
prints `1` (the empty product). The mathematical "product of the digits of 0" — the
digit `0` raised to one factor — is `0`. The README calls `N` a positive integer, so
this is an out-of-domain edge rather than a contradiction of the stated task, but it is
a real divergence from intuition. Fix if zero must be supported:

```cpp
if (N == 0) { cout << 0; return 0; }
```

Second, out-of-domain input: any negative `N` also prints `1`, because `N > 0` fails
immediately and `%` on negatives yields a non-positive remainder. If negatives are ever
allowed, take `long long m = llabs((long long)N);` first.

No other defect: within the stated domain (positive `int`) the arithmetic is exact and
cannot overflow, and the output format is a bare integer.
