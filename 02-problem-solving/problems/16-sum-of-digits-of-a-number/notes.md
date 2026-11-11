# Deep Notes

## Core logic

Each pass removes the least significant digit and adds it to a running total:

```cpp
sum = 0;
while (N > 0) {
    sum += N % 10;
    N = N / 10;
}
```

After the loop, every digit has been visited exactly once, and `N` is `0`. The
final value of `sum` is the digit sum.

## Code walkthrough

The active program:

```cpp
int N, sum;
cin >> N;
sum = 0;
while (N > 0) {
    sum += N % 10;
    N = N / 10;
}
cout << sum;
```

- `sum = 0` is the empty-sum identity, which is why `N = 0` needs no branch.
- `sum += N % 10` reads the last digit and adds it in one step. The precedence is
  safe: `%` binds tighter than `+=`, so this is `sum += (N % 10)`.
- `N = N / 10` truncates the last digit because both operands are integers and
  the division rounds toward zero.
- No newline after the output.

The commented-out earlier attempt in the same file did the same thing with an
intermediate variable:

```cpp
int N, sum, temp;

cin >> N;
sum = 0;
temp = 0;

while (N > 0) {
    temp = N % 10;
    sum += temp;
    N = N / 10;
}
cout << sum;
```

Two lessons from comparing them:

1. `temp` is redundant when the digit is used exactly once — inlining `N % 10`
   is equivalent and shorter.
2. A named digit becomes necessary as soon as you need it *after* the division,
   for example when building a reversed number (`rev = rev * 10 + digit`). Keeping
   the habit of naming the digit makes those extensions straightforward.

The dead block is fully commented, so it costs nothing at runtime, but leaving a
complete duplicate program in a published `.cpp` is noise; a note in the README
would carry the same lesson more cleanly.

## Why it works

Invariant: at the top of each test, `sum` equals the sum of the digits already
removed from the original `N`, and `N` equals the original number with exactly
those digits truncated.

- Initialisation: nothing removed, `sum = 0`.
- Maintenance: `N % 10` is the last remaining digit; adding it extends the
  covered set by one, and `N / 10` removes exactly that digit.
- Termination: `N` strictly decreases for positive `N` and cannot go below `0`,
  so the loop ends with `N == 0` and every digit accounted for.

## Complexity

`d` iterations for `d` digits, `O(1)` work each: `O(d)` time, `O(1)` space. Since
`d = floor(log10 N) + 1`, this is `O(log N)` in the numeric value and at most 10
iterations for `int`. A string-based solution allocates `O(d)` extra memory, so
the numeric loop is strictly better.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `0` | `0` | digit sum of zero is zero; loop skipped, `sum` stays `0` |
| `5` | `5` | single digit |
| `9` | `9` | largest single digit |
| `10` | `1` | the zero contributes nothing |
| `99` | `18` | `9 + 9` |
| `1000` | `1` | three zero digits still consume iterations |
| `5072` | `14` | README example |
| `123456789` | `45` | `9 * 10 / 2` |
| `2147483647` | `46` | largest `int` |
| `-5072` | `14` if sign ignored | code prints `0` |

## Common mistakes

- Writing `N = N % 10` instead of `sum += N % 10; N /= 10;` — the number stops
  shrinking.
- Dividing before taking the remainder, which silently drops the units digit:
  `5072` would sum to `12`.
- Adding `N / 10` instead of `N % 10`, producing a meaningless value.
- Using `N >= 0` as the guard; `0 / 10` stays `0` and the loop never ends.
- Initialising `sum` to `some digit` or `1` instead of `0`.
- Assuming negative input works; the loop is skipped and the answer is `0`.
- Confusing this with the count problem: `count += 1` counts digits, it does not
  sum them.

## Variants and follow-ups

1. **Repeated digit sum (digital root):** run the loop on `sum` while
   `sum >= 10`, or use `N == 0 ? 0 : 1 + (N - 1) % 9` in `O(1)`.
2. **Sum of squares of digits:** `sum += (N % 10) * (N % 10)`; the basis of the
   happy-number test.
3. **Product of digits:** `prod *= N % 10`, guarding zeros (see
   `17-product-of-digit-of-a-number`).
4. **Reverse the number:** `rev = rev * 10 + N % 10` inside the same loop (see
   `18-reverse-number`).
5. **Sum digits until a condition, or of `N!`:** factorials need big integers, but
   the digit loop itself is unchanged.
6. **String approach:** `for (char c : to_string(N)) sum += c - '0';` — clearer,
   but allocates a string.

## Key takeaways

- `% 10` and `/ 10` are the read-and-remove pair behind almost every digit
  problem.
- The order of the two operations is part of the algorithm, not a style choice.
- A destructive loop is fine when the original value is not needed afterwards.
- The same guard (`N > 0`) is correct here and wrong in digit counting, because
  the digit sum of `0` is `0` while the digit count of `0` is `1`.
- Bounds like `sum <= 9 * 10` make overflow analysis trivial; state them instead
  of guessing.

The active code matches the statement for every `N >= 0`; no correctness fix is
required. The only cleanup is the fully commented-out duplicate earlier attempt,
which could be reduced to a one-line note.
