# Deep Notes

## Core logic

Two accumulators advance in lockstep:

- `factorial` — the current term, maintained as `i!`;
- `sum` — the total of all terms built so far.

The update order encodes the definition: multiply first to create `i!`, then add
that exact term.

```cpp
factorial = 1;
sum = 0;
i = 1;
while (i <= N) {
    factorial *= i;
    sum += factorial;
    i++;
}
```

## Code walkthrough

```cpp
int N, factorial, i, sum;
cin >> N;
factorial = 1;
sum = 0;
i = 1;
```

`factorial` is initialised to the multiplicative identity because the first
multiplication at `i = 1` should leave it at `1`. `sum` starts at the additive
identity. `i = 1` declares that the series starts at `1!`; a `0!` term would need
`i = 0` plus a `+1` correction, since `factorial *= 0` would destroy it.

```cpp
while (i <= N) {
    factorial *= i;
    sum += factorial;
    i++;
}
cout << sum;
```

Three statements in a fixed order. `factorial *= i` converts `(i-1)!` into `i!`;
`sum += factorial` consumes it immediately. If the two lines were swapped, the
loop would add `(i-1)!` and the series would be shifted down by one full term.
No newline is printed.

## Why it works

Invariants at the top of each test:

1. `factorial == (i - 1)!`
2. `sum == 1! + 2! + ... + (i - 1)!`

Base case `i = 1`: `factorial = 1 = 0!` and the sum is empty (`0`), so both hold.

Step: multiplying by `i` gives `i!`, and adding it extends the sum through `i!`.
Incrementing `i` restores the "through `i - 1`" form.

Termination at `i = N + 1` gives `sum == 1! + ... + N!`. Because `i` increases
and `N` is finite, termination is guaranteed.

## Complexity

- **Time:** one multiplication and one addition per iteration → `O(N)`.
- **Space:** two integers → `O(1)`.
- **Comparison:** the nested-loop version costs `sum_{i=1}^{N} i = O(N^2)`
  multiplications. For `N = 20` that is 210 multiplications versus 20 — a factor
  of ten already, and the gap widens quadratically.

With fixed-width integers the multiplications are constant time; with
arbitrary-precision integers the cost per multiply grows with the number of
digits, making the real cost `O(N^2 log N)`-ish in bit operations.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `0` | `0` | empty range, loop never runs |
| `1` | `1` | `1!` |
| `2` | `3` | `1 + 2` |
| `3` | `9` | README example |
| `4` | `33` | `9 + 24` |
| `5` | `153` | `33 + 120` |
| `10` | `4037913` | still small |
| `12` | `522956313` | largest correct `int` total |
| `13` | `6749977113` | code prints `-1839957479` — overflow |
| `20` | `2561327494111820313` | needs `long long` |
| `-3` | `0` (undefined case) | condition false immediately |

## Common mistakes

- Adding before multiplying, producing `0! + 1! + ... + (N-1)!`.
- Recomputing each factorial in an inner loop, making the solution `O(N^2)` for
  no benefit.
- Resetting `factorial = 1` inside the loop so every term becomes `i`.
- Starting `sum` at `1` to "account for `0!`" in a series that never includes it.
- Declaring the accumulators as `int` when the product needs `long long`; the
  product overflows one step before the sum does, but the sum is also doomed, so
  both must be widened.
- Printing inside the loop and reporting a partial sum as the answer.

## Variants and follow-ups

1. **Include `0!`:** initialise `sum = 1` and start `i = 1`, or start `i = 0`
   and make the multiply conditional. Every answer shifts by exactly `1`.
2. **Nested-loop baseline:** useful only to demonstrate the `O(N^2)` cost; keep
   it as an experiment, not as the solution.
3. **Modular version:** `factorial = factorial * i % MOD; sum = (sum + factorial) % MOD;`
   removes overflow entirely and is the standard contest form.
4. **Closed form:** there is no simple closed form for `sum i!`. The identity
   `sum_{i=1}^{N} i * i! = (N+1)! - 1` applies to a different series — do not
   confuse the two.
5. **Recursive form:** `f(n) = f(n-1) + fact(n)`, which recomputes factorials
   unless `fact` is also threaded through the recursion, at the cost of `O(N)`
   stack.

## Key takeaways

- Maintaining a prefix result is the difference between `O(N)` and `O(N^2)`.
- Statement order inside a loop body is part of the algorithm's definition.
- The sum is only 5.3% larger than `N!` at `N = 20`, so the factorial sets the
  practical type limit, not the addition.
- Empty ranges are legitimate: this problem's `N = 0` correctly yields `0`.

## Current-code review

For `0 <= N <= 12` the loop is correct, in the right order, and matches the
README's `1! + ... + N!` definition (it does not accidentally include `0!`).
Issues:

1. **`int` overflow at `N = 13`.** Verified output `-1839957479`; the true total
   is `6749977113`. Both `factorial` and `sum` must be widened together:

   ```cpp
   long long factorial = 1, sum = 0;
   ```

   This is correct through `N = 20` and changes nothing else in the program.
2. **Negative input yields `0`,** which is not a meaningful "sum of factorials".
   The problem domain is `N >= 0`; state it or reject the input.
3. **No trailing newline** after `cout << sum;`.
4. **`i` is declared but only used as the loop counter**; a `for` loop
   (`for (int i = 1; i <= N; ++i)`) would scope it correctly and remove the
   manual increment from the body. Style only, not a bug.
