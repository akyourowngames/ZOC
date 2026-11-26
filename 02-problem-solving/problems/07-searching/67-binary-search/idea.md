# Ideas and Hints

- Keep a search interval `[low, high]`.
- Check its midpoint.
- If the midpoint value is too small, continue in the right half.
- If it is too large, continue in the left half.
- Stop when found or when `low > high`.

Use `low + (high - low) / 2` to avoid overflow in `low + high`.
