# Ideas and Hints

## Key observation

Do not calculate each factorial from the beginning. Keep the previous
factorial:

```text
factorial = factorial * i
sum = sum + factorial
```

## Traps

- Add the factorial after multiplying by `i`.
- Initialize `factorial` to `1` and `sum` to `0`.
- Check whether the task includes `0!`; the current code sums from `1!`.
- Factorials overflow quickly, so inspect the constraints carefully.
