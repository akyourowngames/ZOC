# Ideas and Hints

- Save the original number before changing `N`.
- Extract the last digit with `N % 10`.
- Build the reverse with `reverse = reverse * 10 + digit`.
- Remove the digit with `N /= 10`.
- Compare the saved original with the finished reverse.

## Traps

- If you do not save the original, you cannot compare at the end.
- `reverse = reverse * 10 + digit` must multiply before adding.
- Leading zeroes disappear in an integer. Decide how the problem treats them.
- Reverse calculations can overflow if the input is too large.
