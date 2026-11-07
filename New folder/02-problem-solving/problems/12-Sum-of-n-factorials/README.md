# Sum of the First N Factorials

## Task

Read `N` and calculate:

```text
1! + 2! + 3! + ... + N!
```

## Example

```text
Input: 3
Output: 9
```

Because `1! + 2! + 3! = 1 + 2 + 6 = 9`.

## Solution

See [`solution.cpp`](./solution.cpp).

## Complexity

The current solution updates the factorial instead of recalculating it, so it
uses `O(N)` time and `O(1)` extra space.
