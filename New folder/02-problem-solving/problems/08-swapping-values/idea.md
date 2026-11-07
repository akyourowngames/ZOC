# Ideas and Hints

## Safest hint

Use a temporary variable:

```cpp
temp = A;
A = B;
B = temp;
```

## Alternative

The current code uses addition and subtraction to swap. It works for many
small values, but a temporary variable is clearer and avoids arithmetic
overflow.

## Traps

- Save the old value before overwriting it.
- Print the values in their new order.
- `A = B; B = A;` does not swap them; both become the old `B`.
- Arithmetic swapping can overflow when `A + B` is too large.
