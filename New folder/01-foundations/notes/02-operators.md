# Operators

## Logical operators

- `&&` means logical AND: both conditions must be true.
- `||` means logical OR: at least one condition must be true.
- `!` means logical NOT: it reverses a Boolean value.

Example:

```cpp
bool increasing = (a < b) && (b < c);
```

## Bitwise operators

Bitwise operators work on the individual binary bits of integers. They are
different from logical operators and are useful in selected algorithmic
problems.

## Precedence reminder

Use parentheses when combining comparisons, logical operators, and output:

```cpp
cout << ((a < b) && (b < c)) << '\n';
```

This makes the intended order clear and avoids confusing expressions.

## Practice

1. Check whether three numbers are strictly increasing.
2. Check whether a number is outside an inclusive range.
3. Test whether a number is even using `% 2`.
