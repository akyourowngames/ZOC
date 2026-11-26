# Deep Notes

## Core logic

A bounded accumulation over `[1, N]` with a parity filter. `sum` starts at the additive
identity and only odd values are folded in. `continue` implements the filter by aborting
the current iteration before the fold line, which is equivalent to wrapping the fold in
`if (i % 2 != 0)`.

The loop is `O(N)` because it inspects every integer, even though only half are used. Two
successive refinements are available: step by `2` to halve the iterations, or apply the
closed form `k^2` for O(1).

## Code walkthrough

```cpp
int N, sum;
cin >> N;                 // upper bound
sum = 0;                  // additive identity

for (int i = 1; i <= N; i++) {   // 1..N inclusive
    if (i % 2 == 0) {
        continue;                // skip the rest of the body for evens
    }
    sum += i;                    // only odd i reach this line
}
cout << sum;              // bare integer
```

- `for (int i = 1; ...)` scopes `i` to the loop; nothing leaks.
- `i <= N` includes `N`. If `N` is odd, `N` is part of the answer; if even, it is skipped.
  An off-by-one here would show up as a missing `N` for odd inputs.
- `continue` transfers control to the increment `i++`, then re-tests the condition. It does
  not skip the increment — this is why `continue` is safe in a `for` but dangerous in a
  `while`.
- `i % 2 == 0` is the even test. `i % 2 != 0` or just `if (i % 2)` would be the odd test;
  the code tests the case it wants to abandon, which reads naturally with `continue`.
- `sum += i` after the filter is the fold.
- `cout << sum;` prints without a newline.

## Why it works

Invariant: at the top of iteration `i`, `sum` equals the sum of all odd integers in
`[1, i - 1]`.

- Base: `i = 1`, the range `[1, 0]` is empty, `sum = 0`. True.
- Step: iteration `i` adds `i` exactly when `i` is odd, so the invariant holds for `i+1`.
- Exit: the loop ends with `i = N + 1`, so `sum` is the sum of odd integers in `[1, N]`.

The closed form is a theorem: the first `k` odd numbers are `1, 3, ..., 2k-1` and their sum
is `k^2` (induction: `k^2 + (2k+1) = (k+1)^2`). The count of odds in `[1, N]` is
`(N + 1) / 2` by integer division, which handles both parities: `N = 7` -> `4`, `N = 8` ->
`4`.

## Complexity

- Time: O(N) iterations, each O(1). With `i += 2` it becomes `ceil(N/2)`; with `k*k` it is
  O(1). For `N = 10^6` the loop is fine; for `N = 10^9` only the formula is.
- Space: O(1) — two integers.
- Overflow threshold: `k^2 <= 2^31 - 1` -> `k <= 46340` -> `N <= 92680`.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| 0 | 0 | empty sum; loop never runs |
| 1 | 1 | single odd term |
| 2 | 1 | `2` skipped |
| 7 | 16 | `1+3+5+7`, also `4^2` |
| 8 | 16 | same terms as `N = 7` |
| 9 | 25 | `5^2` |
| 10 | 25 | `10` skipped |
| 92680 | 2147395600 | largest safe `int` sum (`46340^2`) |
| 92681 | 2147488281 | exceeds `INT_MAX` -> signed overflow |
| -5 | 0 | loop never runs; statement does not define negatives |

## Common mistakes

- Summing even numbers by starting at `0` or testing `i % 2 == 0` for the add branch.
- Counting odd numbers (`sum += 1`) instead of adding the values.
- `continue` inside a `while` without advancing `i` — infinite loop.
- Off-by-one in `i <= N` (using `<` drops the term `N` when `N` is odd).
- `int` accumulator with a large `N`; the sum grows quadratically, so `int` dies long
  before the loop does.
- Assuming `N` must be odd; the answer is identical for `N` and `N-1` when `N` is even.
- Using `i % 2 == 1` in code that might see negative values.

## Variants and follow-ups

- **Sum of even numbers**: `i = 2; i <= N; i += 2` -> `sum = 2 * (1 + ... + floor(N/2))`
  `= m(m+1)` with `m = N/2`.
- **Sum of multiples of `K`**: see folder 23; the same accumulate-with-step pattern.
- **Count of odd numbers instead of sum**: `(N + 1) / 2`.
- **Sum of odd squares**: `k(4k^2 - 1)/3` in closed form.
- **Sum of odd numbers in `[A, B]`**: prefix answer for `B` minus prefix answer for
  `A - 1`, the standard "range via prefix" reduction.
- **No `continue`**: express the filter as an `if` block or by stepping differently; the
  pedagogical value of `continue` is real, but so is the readability cost when a loop body
  grows.

## Key takeaways

- `continue` in a `for` is safe (the increment still runs); in a `while` it can loop
  forever.
- Filter-then-fold is the general accumulation shape; parity is just one predicate.
- Stepping by `2` and closed forms are the two standard ways to cut O(N) work.
- Pick accumulator width from the growth rate: sums of `1..N` grow like `N^2`, so they
  overflow `int` at `N` around 65k-93k depending on the constant.

## Current-code review

No logic defect for the stated task: for every `N` in `0..92680` the loop produces the
correct sum and prints it as a bare integer.

One correctness risk is worth flagging because the problem statement gives no bound for
`N`:

- **Signed overflow for large `N`.** `sum` is `int` while the answer grows as
  `k^2`, `k = (N + 1) / 2`. `N = 92681` already needs `2147488281 > INT_MAX`, so the
  addition overflows — undefined behaviour in C++, and in practice a negative or wrapped
  result. If `N <= 92680` is guaranteed, the code is safe; otherwise use
  `long long sum` and note that even `long long` only buys `k <= 3.04e9`, i.e. `N` up to
  about `6e9`. Since constraints are unstated, the honest reading is "safe for small `N`,
  possibly wrong for large `N`".

Style observations only: the filter could be replaced by `for (int i = 1; i <= N; i += 2)`
to halve the iterations, and `k * (long long)k` gives an O(1) answer. Negative `N` prints
`0` (empty sum) and is out of domain.
