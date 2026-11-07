# Learning Notes

## Reliable pattern

For general input, a running maximum is usually easier to verify than a long
chain of special cases.

```cpp
int maximum = a;
if (b > maximum) maximum = b;
if (c > maximum) maximum = c;
```

## Complexity

Two comparisons: `O(1)` time and `O(1)` extra space.

## Review checklist

- What happens when all three values are equal?
- What happens when every value is negative?
- Does the output contain only the number?
