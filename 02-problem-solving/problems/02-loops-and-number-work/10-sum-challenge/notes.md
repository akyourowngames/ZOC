# Deep Notes

## Core logic

The answer is a fold over a range: start with the identity of addition (`0`) and
combine each term with `+`. The only decisions are the start of the counter, the
loop condition, and the type of the accumulator.

```cpp
sum = 0;
i = 0;
while (i <= N) {
    sum += i;
    i++;
}
```

After the loop, `sum` is `0 + 1 + ... + N`. The counter becomes `N + 1`, which is
what ends the loop.

## Code walkthrough

```cpp
int N, i, sum;
cin >> N;
```

Three uninitialised locals. Only `N` is filled by `cin`; `i` and `sum` are
assigned explicitly two lines later, so there is no undefined behaviour.

```cpp
i = 0;
sum = 0;
```

The source comment records a real insight: `0` contributes nothing to a sum, so
`i = 0` and `i = 1` give identical results *as long as the condition is `<=`*.
With `i = 1` and `i < N`, the term `N` would be lost. The comment is a note
about endpoint arithmetic, not decoration.

```cpp
while (i <= N) {
    sum += i;
    i++;
}
cout << sum;
```

`sum += i` is `sum = sum + i`; the compound form makes the accumulator role
obvious. `i++` is the progress guarantee. No newline is printed after `sum`.

## Why it works

Invariant: before each test of the condition, `sum == 0 + 1 + ... + (i - 1)`.

- **Initialisation:** before the first test, `i = 0` and `sum = 0`; the empty
  sum is `0`. True.
- **Maintenance:** the body adds `i` and increments `i`, so the range covered
  grows by exactly one term and matches the new `i - 1`. True again.
- **Termination:** `i` increases by one each iteration and `N` is finite, so the
  condition eventually fails at `i = N + 1`. At that moment the invariant reads
  `sum == 0 + 1 + ... + N`.

The loop is a direct transcription of the summation definition, so correctness
follows from the definition rather than from any clever algebra.

## Complexity

`N + 1` iterations, each `O(1)`: `O(N)` time, `O(1)` extra space. The closed
form `N * (N + 1) / 2` is `O(1)` but needs a wider type for large `N`.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `0` | `0` | loop runs once, adds `0` |
| `1` | `1` | `0 + 1` |
| `2` | `3` | `0 + 1 + 2` |
| `5` | `15` | README example |
| `10` | `55` | triangular number |
| `100` | `5050` | triangular number |
| `46341` | `1073767311` | still inside `int` |
| `65535` | `2147450880` | largest safe `int` case |
| `65536` | `2147516416`, exceeds `INT_MAX` | code prints `-2147450880` |
| `-5` | `0` (not defined) | condition fails immediately |
| no input | `0` | since C++11 a failed extraction stores `0` in `N`, then the loop adds one `0` |

## Common mistakes

- `i < N` instead of `i <= N`: off by the final term.
- Forgetting `i++`: infinite loop, often mistaken for a slow program.
- Reusing `i` as the accumulator, which destroys the counter.
- Printing inside the loop: you get every partial sum instead of the total.
- Using `int` when `N` can exceed `65535`; the wrap is silent.
- Writing `N * (N + 1) / 2` in `int` for `N = 100000`: the multiplication
  overflows before the division can help. Cast first: `1LL * N * (N + 1) / 2`.

## Variants and follow-ups

1. **Closed form:** `cout << 1LL * N * (N + 1) / 2;` — `O(1)`, needs `long long`.
2. **Different range:** sum from `a` to `b` is `sumTo(b) - sumTo(a - 1)`.
3. **Different step:** sum of multiples of `3` up to `N`; count the terms as
   `N / 3` and use an arithmetic series, or loop with `i += 3` (see
   `13-sum-of-even-numbers`).
4. **Recursion:** `f(n) = n + f(n - 1)`, `f(0) = 0`. Same recurrence, but
   `O(N)` stack, so bad for large `N`.
5. **Many queries:** precompute prefix sums, or answer each query with the
   closed form in `O(1)`.

## Key takeaways

- An accumulator must start at the identity element of its operation.
- Loop bounds and start values are coupled; reason about them together.
- The sum grows quadratically, so result type matters more than counter type.
- A one-line comment explaining *why* a start value is safe is worth keeping.

## Current-code review

The logic matches the stated task for small non-negative `N`; the loop and the
endpoint are correct. Remaining issues are robustness and style:

1. **Signed overflow above `N = 65535`.** Verified: `65536` prints
   `-2147450880` because `2147516416` wraps past `INT_MAX`. Since the task states
   no limits, this is a latent defect rather than a contradiction. Fix by
   declaring `long long sum = 0;` (safe up to `N = 3037000499`) and printing the
   same variable; the loop itself needs no change.
2. **Negative input is silently accepted.** `N = -5` prints `0`, which is not a
   meaningful sum. Either state `N >= 0` as a precondition or reject it.
3. **No trailing newline** after `cout << sum;`. Cosmetic, but other solutions
   in the repo terminate output with `'\n'`.
4. **`i` and `sum` declared on one line with `N`.** Harmless, but mixing input,
   counter, and accumulator in a single declaration makes the roles less clear
   when reading quickly.
