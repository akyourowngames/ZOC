# Deep Notes

## Core logic

Two phases with one piece of saved state.

**Phase 1 — snapshot.** `original = N;` before any mutation. The reversal
destroys `N`, and the comparison needs the untouched value.

**Phase 2 — reverse and compare.** The familiar pair

```cpp
digit   = N % 10;
reverse = reverse * 10 + digit;
N       = N / 10;
```

builds the reversed number, then `reverse == original` decides the answer.

Invariant during the loop:

> `original` still holds the input; `reverse` holds the reverse of the digits
> already stripped; `N` holds the digits not yet stripped.

At exit `N = 0`, so `reverse` is the full reversal, and `original` is intact —
the two quantities the comparison needs.

The reverse step is exactly folder `28`; the only conceptual addition is the
realisation that *destructive traversal requires an explicit copy* when the
input must be consulted later.

## Code walkthrough

```cpp
int N, reverse, digit, original;

cin >> N;
reverse  = 0;        // empty reversed sequence
original = N;        // must happen before the loop mutates N

do {
    digit   = N % 10;                    // 1. least significant digit
    reverse = reverse * 10 + digit;      // 2. shift left, append
    N       = N / 10;                    // 3. consume
} while (N > 0);

if (reverse == original) {
    cout << "YES";
} else {
    cout << "NO";
}
```

Ordering notes:

- `original = N` after the loop would store `0`, so every non-zero input would
  print `NO`. This is the classic off-by-placement bug in this exercise.
- `reverse = 0` must also precede the loop; otherwise the first
  `reverse * 10` reads garbage.
- For `N = 0` the `do-while` runs once, `reverse` stays `0`, and `0 == 0` gives
  `YES` — correct, with no special case.

## Why it works

Reversal is an involution on digit strings: reversing twice returns the
original. The loop computes exactly the reversal of `N`'s decimal digits (proof
by induction as in folder `28`: `R_{t+1} = 10 R_t + d_t` appends the next
stripped digit to the right). Therefore

`reverse == original` ⟺ the digit string of `N` equals its own reversal ⟺ `N`
is a palindrome.

Subtle but important: the comparison is on *integers*, so trailing zeros of the
reversal collapse. `N = 1000` reverses to `0001`, i.e. `1`, and `1 != 1000`.
The test remains correct because a genuine palindrome has no trailing zero
unless the number is `0` itself — a positive palindrome's leading digit is
non-zero and equals its trailing digit, so it cannot end in `0` while being
positive. Hence the zero-collapse never turns a non-palindrome into a false
`YES`.

## Complexity

- Time: `O(d)`, `d <= 10`, one modulo, one multiply, one add, one divide per
  digit, plus one comparison.
- Space: `O(1)` — four scalars. The string alternative costs `O(d)`.
- The half-reversal variant below is also `O(d)` time but needs `O(1)` space
  and no overflow.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `1221` | `YES` | the stated example |
| `1234` | `NO` | reverse `4321` differs |
| `0` | `YES` | single digit |
| `7` | `YES` | every one-digit number is a palindrome |
| `1000` | `NO` | reverse collapses to `1` |
| `1001` | `YES` | zeros sit symmetrically |
| `11` | `YES` | even length, both digits equal |
| `10` | `NO` | reverse is `1` |
| `-121` | `YES` here | outside the stated domain; sign cancels on both sides |
| `1999999999` | overflow | reverse `9999999991` exceeds `INT_MAX` |

## Common mistakes

- **Saving `original` after the loop.** Silently makes every answer `NO`
  (except for `0`).
- **Comparing `N` instead of `original`.** After the loop `N` is `0`.
- **Reversing with a faulty accumulator** (`rev + digit * 10`, `digit * 10 +
  rev`), which breaks the comparison for longer inputs.
- **Ignoring overflow.** `int` cannot hold the reversal of some 10-digit
  inputs; signed overflow is undefined behaviour.
- **Wrong output case** (`Yes`, `YES.`).
- **Treating `1000` as a palindrome** because the digit multiset matches.
- **Forgetting `reverse = 0`**, which is uninitialised state in `int reverse;`.

## Variants and follow-ups

1. **Half reversal (overflow-free).** Reverse only the second half:
   ```cpp
   while (N > rev) { rev = rev * 10 + N % 10; N /= 10; }
   return N == rev || N == rev / 10;
   ```
   `rev` never exceeds `N`'s magnitude, so no overflow; also about half the
   iterations.
2. **String comparison.** `s == string(s.rbegin(), s.rend())` — `O(d)` space,
   preserves leading zeros, works for arbitrarily long inputs.
3. **Base `b` palindrome**, "palindrome in both base 10 and base 2", or
   **palindrome permutation** (a frequency-array question, not a reversal).
4. **Next/previous palindrome**, **count palindromes in `[L, R]`** — natural
   bridges to digit DP.

## Key takeaways

- Destructive traversal plus later comparison demands a snapshot; take it
  before the first mutation.
- `transform + compare` is a reusable pattern (sort-and-compare, reverse-and-
  compare, frequency-and-compare).
- Equality of integers is weaker than equality of digit strings whenever
  leading zeros are involved; here it happens not to matter, but you should be
  able to prove that.
- A boolean answer can be corrupted by overflow just as easily as a number.

## Current-code review

The logic matches the README and is correct for all inputs whose reversal fits
in `int`. Two issues are worth flagging.

**1. Potential signed overflow (real defect for 10-digit input).**

```cpp
int reverse;
reverse = reverse * 10 + digit;
```

`reverse * 10` is computed in `int`. For `N = 1999999999` the accumulator must
reach `9999999991`, far beyond `INT_MAX = 2147483647`. Signed overflow is
undefined behaviour, so the printed `YES`/`NO` is meaningless for such inputs —
and a compiler is free to optimise on the assumption that it never happens.
Minimal fixes: `long long reverse;`, or the half-reversal variant, or compare
strings.

Note the interaction with the palindrome property: any palindrome `<= INT_MAX`
reverses to itself, so it happens to be safe; the overflow is triggered by
*non*-palindromic 10-digit inputs, which is exactly why it is easy to miss in
testing.

**2. Negative inputs are accepted as palindromes.**

`-121` produces `reverse = -121` and `original = -121`, so the program prints
`YES`. Whether that is correct depends on the statement; most versions restrict
`N >= 1` and would consider `-121` outside the domain. If negatives must be
rejected or handled, `N = abs(N)` or an explicit guard is needed — the code has
neither.

Non-issues confirmed by inspection: `original` is saved before the loop,
`reverse` starts at `0`, `0` and single digits give `YES`, and the output is
uppercase `YES`/`NO`.
