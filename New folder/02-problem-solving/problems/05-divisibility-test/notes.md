# Learning Notes

## Core pattern

```cpp
bool divisible = (n % k == 0);
```

The expression inside parentheses is already true or false, so it can be used
directly in an `if`.

## Complexity

One remainder operation: `O(1)` time and `O(1)` space.

## Real-world connection

This same test appears in checking multiples, repeating cycles, even/odd
values, and many number-theory problems.
