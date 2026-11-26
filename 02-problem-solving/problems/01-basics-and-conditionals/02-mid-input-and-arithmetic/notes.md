# Deep Notes

## Core logic

For any positive integers `n` and `m`, `n % m = n - floor(n/m) * m` and the
result lies in `[0, m)`. Choosing `m = 10^k` keeps the low `k` decimal digits,
because the discarded part `floor(n / 10^k)` is exactly the "number without its
last `k` digits".

This is the identity that makes the problem trivial:

```text
12345 = 12 * 1000 + 345   ->  12345 % 1000 = 345
12345 = 123 * 100 + 45    ->  12345 % 1000 = 345, 12345 % 100 = 45
12345 = 1234 * 10 + 5     ->  12345 % 10 = 5
```

## Code walkthrough

1. `int num; cin >> num;` — one read. `int` holds up to ten decimal digits
   (`2,147,483,647`), which is enough for the sample-sized inputs.
2. `cout << num % 10 << endl;` — the last digit, then a flush and newline.
3. `cout << num % 100 << "\n";` — last two digits, newline only.
4. `cout << num % 1000 << endl;` — last three digits, newline and flush.

The mixing of `endl` and `"\n"` is stylistic: `endl` also flushes the stream.
For three lines it is irrelevant; the finished habit for judges is `"\n"` only
(or one `'\n'` accepted at the end of the last line).

## Why it works

Decimal position is base-10 place value. `% 10^k` zeroes every term whose
place value is `10^k` or higher and keeps the rest, which is precisely the
suffix of `k` digits, read as a number. Since the suffix is printed as an
integer, any leading zeros inside the window vanish. `7000 % 1000 = 0` is the
extreme case: the suffix is `000`, whose numeric value is `0`.

## Complexity

Three modulo operations and three writes: O(1) time, O(1) extra space. The
cost is independent of `num`'s magnitude for machine integers; if the number
is read as a string, the work becomes O(number of digits).

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `12345` | `5`, `45`, `345` | sample |
| `5` | `5`, `5`, `5` | shorter than every window |
| `0` | `0`, `0`, `0` | zero is a remainder of itself |
| `10` | `0`, `10`, `10` | last digit is zero, prints `0` |
| `7000` | `0`, `0`, `0` | window is all zeros |
| `999` | `9`, `99`, `999` | exact boundary of the largest window |
| `1000` | `0`, `0`, `0` | exactly `10^3` |
| `-12345` | `-5`, `-45`, `-345` | C++ remainder keeps the dividend's sign |
| `2147483647` | `7`, `47`, `647` | largest `int`, no overflow |

## Common mistakes

- Writing `num / 10` and wondering why `1234` appears instead of `5`.
- Trying `num % 100 / 10` for the middle digit and getting the tens digit —
  correct for one digit, but a different question.
- Believing the output should be zero-padded; then failing the sample with
  `005` instead of `5`.
- Assuming `%` handles negatives like Python's `%`; it does not.
- Reading into `int` when the statement allows values above `2,147,483,647`;
  `cin` fails and leaves the variable unset (since C++11 it stores the limit
  value and sets `failbit`).
- Calling the output "the last digits" when the required format keeps leading
  zeros. `7000` must then print `000`, which needs string handling; the README
  asks for numeric remainders instead.
- Forgetting that `% 0` is undefined; a divisor built from input must be
  guarded.

## Variants and follow-ups

- **Variable window size:** read `k`, compute `10^k` in a loop (or with
  `pow(10.0, k)` cast carefully, which is lossy for large `k`), print
  `num % p`.
- **Iterative digit extraction:** `while (n > 0) { int d = n % 10; n /= 10; }`
  visits digits right to left; this is the base of reverse-a-number, digit-sum
  and palindrome problems later in the track.
- **Leading-zero-preserving output:** read the number as `std::string`,
  take `s.substr(s.size() - k)`, and handle `k > s.size()`.
- **Divisibility by `2^k` / `5^k`:** only the last `k` digits matter, which is
  a direct corollary of this remainder identity.

## Key takeaways

1. `n % 10^k` is the last-`k`-digits operator.
2. Remainders are numbers, not digit strings; padding is a formatting choice.
3. `%` truncates toward zero in C++, so negative inputs give negative
   remainders.
4. Fixed three-line output means three straight-line statements are enough;
   loops are for variable-length work.
