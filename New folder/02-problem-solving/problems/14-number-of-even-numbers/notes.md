# Deep Notes

## Core logic

Counting is a fold whose accumulator starts at `0` and increases by `1` whenever
a predicate is true:

```cpp
count = 0;
i = 1;
while (i <= N) {
    if (i % 2 == 0) {
        count += 1;
    }
    i++;
}
```

The counter's final value is the number of integers in `[1, N]` satisfying
`i % 2 == 0`. The magnitude of the values never enters the accumulator, only
their membership, which is why the count is small even for huge `N`.

## Code walkthrough

```cpp
int N,i, num;
cin >> N;
i = 1;
num = 0;
```

`i = 1` is the range start; `num = 0` is the empty count. The variable name
`num` is ambiguous — "number of even numbers" would be clearer as `count` — but
its role is fixed by `num += 1`.

```cpp
while (i <= N) {
    if (i % 2 == 0) {
        num += 1;
    } else {
        num = num;
    }
    i++;
}
cout << num;
```

`i % 2 == 0` is the parity predicate. `num += 1` could be written `++num`; both
mean "one more match". The `else` branch assigns `num` to itself — a well-defined
no-op in C++ for a scalar, and a clear sign that the `else` is unnecessary.
Crucially, `i++` sits *outside* the `if/else`, so the loop always advances. No
newline is printed.

## Why it works

Pair the integers `(1, 2), (3, 4), (5, 6), ...`. Each pair has exactly one even
member: the second one. Every integer in `[1, N]` belongs to exactly one pair
(possibly an incomplete final pair), so the number of evens is the number of
complete pairs, which is `N / 2` with truncation.

- `N = 10` → pairs `(1,2) ... (9,10)` → `5`.
- `N = 9` → four complete pairs plus the odd `9` → `4`.
- `N = 1` → no complete pair → `0`.

The loop computes this count one element at a time. Both methods are correct;
the formula is a proof of the loop's output, and the loop is a check on the
formula.

## Complexity

- Loop: `N` iterations, one modulo and one branch each → `O(N)` time, `O(1)`
  space.
- Formula: `O(1)` time, `O(1)` space.
- At `N = 10^9` the loop performs a billion iterations (seconds to tens of
  seconds), while `N / 2` is instant.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `0` | `0` | range empty |
| `1` | `0` | `1` is odd, nothing even `<= 1` |
| `2` | `1` | only `2` |
| `3` | `1` | `2` |
| `4` | `2` | `2, 4` |
| `7` | `3` | README example |
| `10` | `5` | README example |
| `11` | `5` | trailing `11` is odd |
| `100` | `50` | `100 / 2` |
| `2147483647` | `1073741823` | max `int`; count still fits easily |
| `-4` | `0` (undefined case) | condition false immediately |

## Common mistakes

- Summing instead of counting: `sum += i` returns `30` for `N = 10`.
- `i % 2 != 0` counts odd numbers instead of even ones.
- `i % 2` used directly as the condition is correct but inverted in meaning; it
  is true for odd numbers, a classic silent reversal.
- Incrementing `i` only inside the `if`: the loop stalls on the first odd value.
- `i < N` misses `N` when `N` is even.
- Starting at `0` (even) gives one extra.
- Writing the no-op `else { num = num; }`, which compiles cleanly but shows the
  branch was never thought through.

## Variants and follow-ups

1. **Formula:** `cout << N / 2;` — `O(1)`, and the only sane choice for large `N`.
2. **Count multiples of `k`:** `N / k`, or a loop tested with `i % k == 0`.
3. **Count in a range:** `b / k - (a - 1) / k` multiples of `k` in `[a, b]`.
4. **Count digits that are even:** combine this predicate with the digit loop
   from `16-sum-of-digits-of-a-number` (`n % 10 % 2 == 0`).
5. **Count even numbers divisible by `3`:** step by `6` from `6`, or use
   `N / 6`; the predicate version needs `i % 2 == 0 && i % 3 == 0`.

## Key takeaways

- Counting needs `+1` per match, never the value itself.
- Alternating parity means every pair contributes one match; this is the
  simplest example of "count = size of a complete block × blocks".
- The loop variable must advance on every path through the body.
- Dead branches (`else { x = x; }`) are a review signal even when harmless.
- Unlike its sum sibling, this task cannot overflow, because the answer is
  bounded by `N / 2`.
- The active code needs no correction: the loop matches the statement for every
  `N >= 0`. The only cleanups are stylistic — drop the dead
  `else { num = num; }` branch, and add a trailing `'\n'` to the output.
