# Sum of Even Numbers up to N

## Task

Read `N` and calculate the sum of all positive even numbers from `2` through
`N`.

## Example

```text
Input: 8
Output: 20
```

Because `2 + 4 + 6 + 8 = 20`.

## Solution

See [`solution.cpp`](./solution.cpp).

## Complexity

The loop visits only even values, so it uses `O(N / 2)` time and `O(1)` space.
