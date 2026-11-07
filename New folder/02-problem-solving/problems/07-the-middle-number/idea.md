# Ideas and Hints

## Hint 1: place one value

Ask whether `B` lies between `A` and `C`:

```cpp
(A < B && B < C) || (C < B && B < A)
```

If it does, `B` is the answer. Then perform the same idea for `A`; if neither
is between the other two, `C` is the answer.

## Hint 2: sort

Copy the three values into a small array, sort it, and print the middle
position. This is often easier to read, but learn the comparison version too.

## Traps

- "Middle" means numerical order, not the value typed second.
- Strict `<` comparisons assume all values are different.
- Equal values need a separate rule; test them if the constraints allow ties.
- Be careful with `&&` and `||`; parentheses make the intended logic clear.
- Test increasing order, decreasing order, and all six possible orderings.
