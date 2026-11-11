# Deep Notes

## Core logic

The single idea is the **digit-extraction invariant**:

```cpp
digit = N % 10;   // last decimal digit of N
N     = N / 10;   // N without its last digit
```

For `N >= 0`:

- `N % 10` is in `[0, 9]` and equals the least significant decimal digit;
- `N / 10` is integer division, i.e. floor, so it removes exactly that digit;
- `N / 10 < N` whenever `N > 0`, so `N` is a strictly decreasing non-negative
  measure — the loop *must* terminate.

Loop invariant:

> at the top of each iteration, `sum` equals the sum of all digits that have
> already been stripped off `N`, and the digits still inside `N` are exactly
> the ones not yet counted.

Initially nothing is stripped and `sum = 0`, so the invariant holds. Each
iteration moves one digit from "still inside" to "counted", preserving it.
When `N` reaches `0` no digits remain, so `sum` is the total.

The `do-while` form is legitimate precisely because the body needs no
precondition beyond "`N` is a number", and every number has at least one
digit. Accumulating `0` for the input `0` is correct, not lucky.

## Code walkthrough

```cpp
int N, digit, sum;
cin >> N;             // the number to dismantle

sum = 0;              // additive identity

do {
    digit = N % 10;   // 1. isolate the last digit
    sum  += digit;    // 2. fold it into the total
    N     = N / 10;   // 3. drop it
} while (N > 0);      // 4. stop when no digits remain

cout << sum;          // the fold result
```

Reading order matters: extraction, accumulation, removal. If removal came
first, `digit` would describe the wrong digit; if accumulation came after
removal, the last digit would be lost.

For `N = 0` the body runs once with `digit = 0`, `sum = 0`, `N = 0`; the
condition `0 > 0` is false, so the loop ends. Output `0`. No special case is
required — this is the strongest argument for `do-while` here.

## Why it works

Every non-negative integer has a unique base-10 expansion
`N = d_{k-1} * 10^{k-1} + ... + d_1 * 10 + d_0`. The pair `(% 10, / 10)`
peels `d_0` and yields the quotient with `d_0` removed, i.e. the expansion of
`floor(N / 10)` in one fewer digit. Applying this `k` times yields the digits
in reverse order and leaves `0`.

Because addition is commutative and associative, the reverse order is
irrelevant: the total is the same set of digits summed. This is why the
problem is the friendliest entry point to digit DP-style thinking — the order
of extraction does not constrain the answer.

Termination proof: `N_{t+1} = floor(N_t / 10)`. For `N_t >= 10` this is
`< N_t`; for `N_t < 10` it is `0`, which fails the loop test. So after at most
`floor(log10(N)) + 1` iterations the loop stops.

## Complexity

- Time: `O(d)` where `d = floor(log10(N)) + 1`, so `d <= 10` for 32-bit input
  and `d <= 19` for 64-bit. Each iteration is one modulo, one addition, one
  division — constant work.
- Space: `O(1)` — three `int` scalars, no strings, no arrays.
- Printing cost is `O(log(sum))`, at most three digits.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `5329` | `19` | baseline four-digit case |
| `0` | `0` | single zero digit; `do-while` runs once |
| `7` | `7` | one iteration, sum equals the digit |
| `10` | `1` | trailing zero contributes nothing |
| `1000000000` | `1` | ten iterations, nine zeros |
| `2147483647` | `46` | `2+1+4+7+4+8+3+6+4+7` |
| `-12` | `3` (with `abs`) | out of stated domain; `%` keeps the sign otherwise |

## Common mistakes

- **Missing `N = N / 10`.** The loop never advances; the same digit is added
  forever. Symptom: the program hangs, or `sum` explodes and overflows.
- **`sum` not initialised.** `sum += digit` on an indeterminate `int` is
  undefined behaviour.
- **Dividing before extracting.** `N /= 10` first makes the last digit
  unreachable.
- **Expecting left-to-right digit order.** Extraction is least-significant
  first. Fine for a sum; fatal for a palindrome built naively.
- **Using a `while (N > 0)` and then wondering why `0` prints nothing.** It
  happens to print `0` here only because `sum` starts at `0`; the iteration
  count, not the answer, is what changes.
- **Overflow panic.** Unnecessary for a digit sum: the maximum for 64-bit input
  is `171`.

## Variants and follow-ups

1. **Product of digits** — same loop with `prod = 1` and `prod *= digit`;
   `0` input then yields `0`. See folder `17-product-of-digit-of-a-number`.
2. **Count digits** — `count++` instead of adding; decide explicitly whether
   `N = 0` counts one digit. See folder `15-total-digits-in-number`.
3. **Reverse** — `rev = rev * 10 + digit`, order now matters.
4. **Largest/smallest digit** — fold with `max`/`min`, initialise carefully.
5. **Digital root** — repeat this loop until a single digit remains; folder
   `30-sum-of-digits-until-a-single-digit`.
6. **Digit frequency** — `freq[digit]++` with a 10-element array, `O(1)` space.
7. **No arithmetic at all** — read as `std::string` and sum `c - '0'`; `O(d)`
   time but `O(d)` memory, and it handles leading zeros that `int` input has
   already destroyed.

## Key takeaways

- `digit = n % 10; n /= 10;` is the universal decimal-digit primitive; keep
  the order and the pair together.
- Termination follows from a strictly decreasing non-negative measure.
- `do-while` is the right loop when the body is valid for every input in the
  domain — it removes a special case instead of adding one.
- Choose the accumulator identity by operation: `0` for sums, `1` for
  products.
