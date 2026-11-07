# Divisibility Test

## Task

Read integers `N` and `K`. Print `YES` if `N` is divisible by `K`; otherwise
print `NO`.

## Rule

`N` is divisible by `K` exactly when the remainder is zero:

```cpp
N % K == 0
```

## Examples

```text
Input: 20 5
Output: YES
```

```text
Input: 22 5
Output: NO
```

## Constraint warning

`K` must not be zero. Division or remainder by zero is invalid. Check the
problem constraints before writing the solution.

## Solution

See [`divisibility-test.cpp`](./divisibility-test.cpp).
