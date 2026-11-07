# Learning Notes

## Why the condition is long

A value is between two others in either increasing order or decreasing order.
That is why the check uses two `&&` groups joined by `||`.

## Better verification method

For three distinct numbers, sort them:

```cpp
int values[] = {a, b, c};
sort(values, values + 3);
cout << values[1];
```

This needs `#include <algorithm>`.

## Complexity

For exactly three values, both comparison logic and sorting are effectively
`O(1)` time and `O(1)` extra space.

## Review checklist

- Did you test all orderings?
- Are equal values allowed?
- Does the problem want the middle value or the original middle input?
