# Ideas and Hints

## What to think about

1. Read the input values in the order given.
2. Decide whether the answer can become larger than `int`.
3. Print only the requested answer.

## Hints

- For doubling, calculate `n * 2`.
- For a rectangle, calculate `length * width`.
- For the product of two values up to `1,000,000`, the answer can reach
  `1,000,000,000,000`, so use `long long`.

## Beginner traps

- Do not print prompts such as `Enter a number:`.
- Do not print labels such as `Answer:`.
- Do not use `int` just because the input values fit in `int`; the result also
  has to fit.
- A semicolon ends a statement. Missing one causes a compiler error.

## Self-check

Test with zero, a negative number if negatives are allowed, and the largest
allowed values. Ask: "What is the largest possible answer?"
