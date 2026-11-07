# Ideas and Hints

## Hint

- Extract one digit with `N % 10`.
- If that digit is zero, remember that zero was found.
- Remove the digit with `N /= 10`.
- At the end, print `YES` if the flag was set.

## Traps

- A flag means "was it found?", not "how many were found?".
- If you need the count, use `counter++` every time the digit matches.
- Stop early when zero is found if you only need `YES` or `NO`.
- `N = 0` is a special case: its only digit is zero.
- If negative numbers are allowed, process the absolute value or define the
  sign behavior clearly.
