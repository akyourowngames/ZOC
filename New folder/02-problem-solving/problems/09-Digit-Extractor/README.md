# Extract the Last Digits

## Task

Read a number `N` and a digit count `K`. Print the last `K` digits of `N`.

## Example

```text
Input: 123456 3
Output: 456
```

## Current implementation

The current [`solution.cpp`](./solution.cpp) calculates `N % 1000`, so it
currently works only when `K` is `3`. It does not yet use the input `K`.

## Intended formula

For a general `K`, use:

```text
N % 10^K
```

Check the original problem constraints before implementing `10^K`.
