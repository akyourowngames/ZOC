# Ideas and Hints

## Hint

The last `K` decimal digits are the remainder after division by `10^K`.

Build the power using a loop:

```cpp
power = 1;
repeat K times:
    power *= 10;
answer = N % power;
```

## Traps

- The current code hardcodes three multiplications and ignores `K`.
- `10^K` is not exponentiation in C++; `^` is bitwise XOR.
- A number ending in zero may produce fewer visible digits. Printing `007`
  requires a formatting rule, not just an integer.
- Check whether `N` and `10^K` fit in the chosen integer type.
