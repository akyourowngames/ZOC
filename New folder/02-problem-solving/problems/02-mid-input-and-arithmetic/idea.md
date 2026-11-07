# Ideas and Hints

## Hints

- `% 10` keeps the last decimal digit.
- `% 100` keeps the last two decimal digits.
- `% 1000` keeps the last three decimal digits.
- Print each result with `'\n'` or `endl`.

## Why it works

For `12345`, division by `100` gives a remainder of `45`. The remainder is
the part left after removing all complete hundreds.

## Traps

- `%` is remainder, not percentage.
- `12345 % 100` is `45`, not `0.45`.
- The program prints numbers, not fixed-width text. A result of `5` prints as
  `5`, not `005`.
- If negative inputs are allowed, C++ can produce a negative remainder. Check
  the constraints before assuming all inputs are positive.
