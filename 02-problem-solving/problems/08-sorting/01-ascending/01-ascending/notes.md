# Notes

Sorting an array of `N` values takes `O(N log N)` time. The active source's
range `[arr, arr + N)` is correct, but its comparator makes the order
descending. It uses a fixed array of 101 values.
