# How to Think About It

## 1. Restate the task

Given one integer, output three numbers: the value formed by its last digit,
its last two digits, and its last three digits. Nothing else.

## 2. Spot the pattern

"Last `k` digits" and `%` are the same idea. In base 10, the number
`d4 d3 d2 d1 d0` equals

```text
d4*10000 + d3*1000 + d2*100 + d1*10 + d0
```

Cutting the number at `10^k` keeps exactly the terms below `10^k`, which is
the block of the last `k` digits.

## 3. Derive the algorithm

1. Read `num` once.
2. Compute `num % 10` and print it.
3. Compute `num % 100` and print it.
4. Compute `num % 1000` and print it.
5. Stop. No loop is needed because the number of digit windows is fixed at
   three; with a variable `k` the loop would appear.

## 4. Dry run

`num = 12345`:

| Step | Expression | Value |
| --- | --- | --- |
| last digit | `12345 % 10` | `5` |
| last two | `12345 % 100` (= `12345 - 123*100`) | `45` |
| last three | `12345 % 1000` (= `12345 - 12*1000`) | `345` |

Printed:

```text
5
45
345
```

A second run, `num = 707`:

| Step | Expression | Value |
| --- | --- | --- |
| last digit | `707 % 10` | `7` |
| last two | `707 % 100` | `7` |
| last three | `707 % 1000` | `707` |

Note the formatting consequence: `7` is printed as `7`, not `07`. The program
returns numbers, not fixed-width digit strings.

## Progressive hints

1. Start from a smaller question: how do you get the last digit of `12345`?
   Repeatedly subtracting `10` until you cannot is exactly `% 10`.
2. Generalise: subtract `100` repeatedly for the last two digits — that is
   `% 100`.
3. Notice the pattern in the divisors: one zero per digit kept.
4. Write the three statements in the same order as the required output.
5. Check a number shorter than the window and a number ending in zeros; both
   are where the "numeric, not padded" behaviour shows up.

## Traps

- Using `/` instead of `%`: `12345 / 100` is `123`, the *other* end of the
  number.
- Expecting `005`-style output. `%` produces an integer; padding needs
  `setw(3) << setfill('0')`, and the statement does not ask for it.
- Thinking `% 100` returns a fraction (`0.45`); it returns `45`.
- Assuming remainders are non-negative for negative inputs. `-12345 % 100` is
  `-45` in C++.
- Reading a 10-digit number into `int`. `cin` fails and the value is not what
  the user typed.
- Printing an extra blank line or a label; the judge compares line by line.

## Self-check

- For `num = 1000`, what are the three outputs, and why?
- Why is the divisor for "last three digits" `1000` and not `999`?
- What changes if the task asks for the last `k` digits with `k` given as
  input?
- Does your program still print three lines for a one-digit input?
