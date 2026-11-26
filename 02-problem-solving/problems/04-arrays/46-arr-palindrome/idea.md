# Ideas and Hints

Compare `arr[i]` with `arr[N - 1 - i]` for `i = 0 ... N/2 - 1`.
Using direct element comparison avoids integer overflow.
