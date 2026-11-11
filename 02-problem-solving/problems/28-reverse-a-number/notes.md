# Deep Notes

## Core logic

The extraction half is the standard primitive:

```cpp
digit = N % 10;   // least significant digit
N     = N / 10;   // remove it
```

The new half is the **positional append**:

```cpp
rev = rev * 10 + digit;
```

Multiplying by the base shifts the already-built value one decimal place to
the left; adding the digit fills the units column. After `k` iterations, `rev`
is the integer formed by the `k` digits removed so far, in reverse order.

Invariant:

> at the top of each iteration, `rev` holds the reverse of the digits already
> stripped from the original number, and `N` holds the digits not yet stripped.

`rev = 0` makes it true initially (the reverse of no digits is the empty
number, value `0`). Each iteration strips one digit and appends it, preserving
it. When `N = 0`, no digits remain, so `rev` is the full reverse.

Note the asymmetry with the digit sum: there, the order of accumulation did not
matter; here it is the entire problem, which is why a positional update (`*10`)
is required instead of a plain `+=`.

## Code walkthrough

```cpp
int N, digit, reverse;      // 'reverse' shadows std::reverse; 'rev' is clearer

cin >> N;
reverse = 0;                // empty digit sequence

do {
    digit = N % 10;              // 1. least significant digit
    reverse = reverse * 10 + digit;  // 2. shift left, append
    N = N / 10;                  // 3. consume
} while (N > 0);

cout << reverse;            // integer print -> leading zeros vanish
```

For `N = 1204` the sequence of `reverse` values is `4, 40, 402, 4021`, which
matches the dry run in [`idea.md`](./idea.md).

Two details worth noting:

- `do-while` is safe because every `N` in `[0, INT_MAX]` has at least one
  digit; for `N = 0` a single pass leaves `reverse = 0`.
- `reverse * 10` is the only operation whose result can exceed the type; the
  extraction itself is always in range.

## Why it works

Let the digits of `N` be `d_0` (units) up to `d_{k-1}`. After iteration `t`
the code has appended `d_0 .. d_{t-1}` and the accumulator equals

`R_t = d_0 * 10^{t-1} + d_1 * 10^{t-2} + ... + d_{t-1}`

which is the integer whose decimal digits are `d_{t-1} ... d_1 d_0`. Induction:
`R_{t+1} = 10 * R_t + d_t` shifts every existing digit left one place and puts
`d_t` last, producing `d_t d_{t-1} ... d_0`. After `k` steps, `R_k` reads the
original digits backwards. Since integer arithmetic is exact (absent overflow),
the reconstruction loses nothing.

Termination depends only on `N`, which strictly decreases by the `/ 10` step;
the accumulator's growth cannot prevent it.

## Complexity

- Time: `O(d)` iterations, `d = floor(log10(N)) + 1 <= 10`. Each iteration is
  one `%`, one `*`, one `+`, one `/` — all constant time for machine integers.
- Space: `O(1)`. No string, no stack — this is the main advantage over the
  string-reversal approach, which needs `O(d)` memory.
- Output size: `O(d)` characters.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `1204` | `4021` | the stated example |
| `1200` | `21` | trailing zeros become leading zeros and disappear |
| `0` | `0` | single zero digit |
| `5` | `5` | single digit, reverse is itself |
| `1000` | `1` | three zeros dropped |
| `-123` | `-321` | outside the stated domain; sign propagates |
| `1999999999` | overflow | reverse `9999999991 > INT_MAX`; UB in the active code |
| `2147483647` | overflow | reverse `7463847412 > INT_MAX` |

## Common mistakes

- **Missing the `/ 10` update.** The loop never progresses.
- **Writing `reverse = reverse + digit * 10`.** Appends a tens digit to the
  existing value rather than shifting; for a two-digit `ab` it produces
  `10(a + b)`, e.g. `12 -> 30`, so it is wrong even in the smallest case.
- **`reverse = digit * 10 + reverse`** — same category of error, produces a
  scrambled result.
- **Ignoring overflow.** This is the most damaging mistake because the code
  looks correct and fails only on 10-digit inputs. Signed overflow is
  undefined behaviour, so the compiler may do anything.
- **Expecting leading zeros in the output.** They are not representable in an
  `int`.
- **Naming the accumulator `reverse`.** Shadows `std::reverse` under
  `using namespace std`, so a later `reverse(v.begin(), v.end())` call will not
  compile in this scope.

## Variants and follow-ups

1. **Check without printing**: palindrome test — folder
   [`29-palindrome-number`](../29-palindrome-number/).
2. **Reverse as a string**: `string s = to_string(N); reverse(s.begin(),
   s.end());` — keeps leading zeros, `O(d)` space, no overflow.
3. **Overflow-safe reverse**: accumulate in `long long`, or check
   `rev > (INT_MAX - digit) / 10` before multiplying.
4. **Reverse the last `k` digits**, in blocks of `k`, or an array in place with
   two pointers — the same idea on another container.
6. **Palindrome in base `b`**: same algorithm with `% b`, `/ b`, and a
   base-`b` comparison.

## Key takeaways

- `value = value * 10 + digit` is the canonical "append a digit" operation in
  any base; swap `10` for the base.
- Traversal direction is dictated by `% 10`, so the *build* direction must
  compensate — that is what the `* 10` does.
- Input fitting in a type does not mean the output will. Digit reversal is the
  first place this trap appears.
- `do-while` plus "every number has at least one digit" removes the zero
  special case cleanly.

## Current-code review

The arithmetic is correct for inputs whose reverse also fits in `int`, and the
implementation matches the README. There is one latent defect:

```cpp
int N, digit, reverse;
...
reverse = reverse * 10 + digit;   // can overflow for 10-digit input
```

`reverse * 10` is evaluated in `int`. For `N = 1999999999` (a perfectly valid
`int`) the accumulator must hold `9999999991`, which exceeds `INT_MAX =
2147483647`. Signed overflow is undefined behaviour in C++, so the printed
value is unpredictable rather than merely wrapped.

- Affected inputs: any `N` whose decimal reverse exceeds `2 147 483 647`,
  e.g. `1999999999`, `2147483647`, `1000000009`.
- Not affected: everything up to 9 digits (`<= 999 999 999`), whose reverse is
  also at most 9 digits.
- Minimal fixes: declare `reverse` as `long long`, or reject/pre-clamp such
  inputs, or emit the result as a string.

Secondary observations, not bugs:

- The variable name `reverse` collides conceptually with `std::reverse` under
  `using namespace std`.
- `N` is destroyed by the loop. That is fine here because the reverse is the
  only output; it would not be fine for a palindrome check without saving the
  original first (folder `29` does save it).
- No trailing newline is printed.
