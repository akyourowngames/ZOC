# Ideas and Hints

- Start `product` at `1`, the multiplication identity.
- Extract each digit with `% 10`.
- Multiply it into `product`.
- Remove the digit with `/ 10`.

## Traps

- Starting at `0` makes every answer zero.
- A zero digit really does make the whole product zero.
- For `N = 0`, decide whether the product of its digits should be `0`; the
  simple `while (N > 0)` loop does not process it.
- The product can overflow for numbers with many digits.
