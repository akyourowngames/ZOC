# Learning Notes

## Digit-removal pattern

```cpp
digit = n % 10;
n = n / 10;
```

The second line removes the digit just processed. This pattern is used in
almost every basic number-digit problem.

## Complexity

For `d` digits, the loop takes `O(d)` time and `O(1)` extra space.
