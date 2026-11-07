# Learning Notes

## Loop structure

```cpp
int i = 0;
while (i <= n) {
    sum += i;
    i++;
}
```

Adding zero does not change the answer, so starting at `1` is also valid for
non-negative input.

## Beginner traps

- `i <= n` includes `n`; `i < n` does not.
- Forgetting `i++` creates an infinite loop.
- Initialize `sum` before using `+=`.
