# Learning Notes

## Main lesson

Variables are named storage boxes. Swapping means moving both old values
without losing either one.

Prefer a temporary variable in normal code. It is easier to read, debug, and
prove correct:

```cpp
int temp = a;
a = b;
b = temp;
```

## Beginner checks

- Test equal values.
- Test zero and negative values.
- Check that the output has the required space or newline format.
