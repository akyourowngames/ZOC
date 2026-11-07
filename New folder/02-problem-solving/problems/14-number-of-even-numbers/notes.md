# Learning Notes

## Important distinction

The sum problem asks for values such as `2 + 4 + 6`. This problem asks only
how many such values exist.

For positive `N`, every pair of numbers contributes one even number, so
`N / 2` gives the answer directly.

## Complexity

The current loop is `O(N)`. The formula `N / 2` is `O(1)` and is preferable
when `N` can be very large.
