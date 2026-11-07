# Learning Notes

## Core pattern

Each iteration extracts exactly one digit:

```cpp
sum += n % 10;
n /= 10;
```

This is different from summing the number's place values directly.

## Common mistake

Do not forget to divide `N`; otherwise the same last digit is processed
forever.
