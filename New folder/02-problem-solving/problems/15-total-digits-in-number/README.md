# Count the Digits

## Task

Read a positive integer `N` and print how many decimal digits it contains.

## Example

```text
Input: 5072
Output: 4
```

## Idea

Every integer division by `10` removes one digit. Count how many divisions
are needed before the number becomes zero.

## Edge case

If `N = 0`, the number has one digit, not zero digits. The current loop needs
a special case if zero is allowed.

## Solution

See [`solution.cpp`](./solution.cpp).
