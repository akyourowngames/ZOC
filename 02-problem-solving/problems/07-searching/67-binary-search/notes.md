# Notes

The current solution assumes ascending sorted input but does not check or
sort it. Duplicates are fine for a yes/no search. For `N = 0`, `high` becomes
`-1`, and the loop correctly does not run.

Time is `O(log N)`; the input array uses `O(N)` space.
