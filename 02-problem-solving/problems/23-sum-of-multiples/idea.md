# How to Think About It

## 1. Restate the task

Given `N` and `K`, add up `K, 2K, 3K, ...` while the value stays `<= N`. `N = 10, K = 3`
-> `3 + 6 + 9 = 18`.

## 2. Spot the pattern

The candidates form an arithmetic progression with first term `K` and common difference
`K`. Whenever that happens, there are three ways to write the loop:

```cpp
// A. filter a full range (does the most work)
for (int i = 1; i <= N; i++) if (i % K == 0) sum += i;

// B. walk the progression (the active solution)
for (int i = K; i <= N; i += K) sum += i;

// C. closed form (no loop at all)
long long t = N / K;
sum = (long long)K * t * (t + 1) / 2;
```

| Version | Iterations | Needs `K > 0`? | Overflow risk |
| --- | --- | --- | --- |
| A | `N` | yes (`% 0` is UB) | sum only |
| B | `N / K` | yes (infinite loop) | sum only |
| C | `0` | yes (division by zero) | intermediate product |

B is the natural improvement over A: same result, `K` times fewer iterations, no modulo.
C is the asymptotic answer, and the one competitions expect when `N` reaches `10^9`.

Note that B and C agree because `K + 2K + ... + tK = K * (1 + 2 + ... + t) =
K * t(t+1)/2`, with `t = floor(N/K)`.

## 3. Derive the algorithm

1. Read `N` and `K` in that order.
2. `sum = 0`.
3. Start `i` at `K` — the first positive multiple.
4. Continue while `i <= N`, adding `K` each time.
5. Print `sum`.

Termination argument: `i` increases by `K >= 1` per step, so after at most `N/K + 1` tests
`i` exceeds `N`. Break that argument and you break the loop — which is exactly what
happens for `K <= 0`.

## 4. Dry run

`N = 10, K = 3`: `sum = 0`, `i = 3`

| iteration | `i <= 10`? | `sum` after | `i` after |
| --- | --- | --- | --- |
| 1 | yes | 3 | 6 |
| 2 | yes | 9 | 9 |
| 3 | yes | 18 | 12 |
| 4 | no | 18 | loop ends |

Output `18`. Closed form: `t = 10 / 3 = 3`, `3 * 3 * 4 / 2 = 18`. Agrees.

`N = 10, K = 4`: `i = 4` -> sum `4`, `i = 8` -> sum `12`, `i = 12` -> stop. Output `12`.
`t = 2`, `4 * 2 * 3 / 2 = 12`. Agrees.

`N = 5, K = 7`: `7 <= 5` is false on the first test; `sum = 0`. Output `0`.

`N = 10, K = 10`: `10 <= 10` is true, sum becomes `10`; `i = 20` stops. Output `10`. The
bound is inclusive, so a multiple equal to `N` counts.

`N = 10, K = 0`: `i = 0 <= 10` is true and `i += 0` never advances — infinite loop.

## Progressive hints

1. What is the smallest positive multiple of `K`? (`K`)
2. How far apart are consecutive multiples? (`K`) So how do you jump between them?
   (`i += K`)
3. When do you stop? (`i > N`, i.e. the multiple passed `N`)
4. How many terms are there? (`floor(N / K)`)
5. What is `1 + 2 + ... + t`? (`t(t+1)/2`) So what is the sum of the multiples?
   (`K * t(t+1)/2`)
6. What breaks if `K = 0`? (`i += 0` — no progress) What if `K < 0`? (`i` decreases, still
   `<= N` — no progress either)

## Traps

- Starting `i` at `0`: adds a useless zero at best, and with `K = 0` produces an infinite
  loop immediately.
- Using `i < N` instead of `i <= N`, which drops `N` when `N` is itself a multiple.
- `K = 0`: infinite loop. Guard with `if (K <= 0) { ... }`.
- `K < 0`: `for (i = K; i <= N; i += K)` moves away from `N` forever. Same guard.
- Reversing the input order (`cin >> K >> N`) — the statement reads `N` then `K`.
- `int` overflow: for `K = 1`, the sum is `N(N+1)/2`, which exceeds `INT_MAX` at
  `N = 65536`. The closed form `K * t * (t+1) / 2` also overflows if computed in `int`
  because the intermediate `t * (t+1)` is the largest quantity.
- Assuming the multiples must be strictly less than `N`.
- Thinking the loop skips non-multiples by testing; it never tests anything.

## Self-check

- Compute `N = 20, K = 6` by hand. (`6 + 12 + 18 = 36`; `t = 3`, `6*3*4/2 = 36`)
- Compute `N = 20, K = 6` with the closed form and compare.
- Explain why version B does not need `%`.
- Find the smallest `N` for which `K = 1` overflows `int`. (`65536`)
- State the loop invariant: before each test, `sum` is the sum of the multiples of `K`
  strictly below `i`.
- Write the guard that makes the code safe for `K <= 0`, and decide what the mathematical
  answer should be for `K = 0` (arguably `0`, since every number is a multiple of `0` only
  under the trivial convention `0 * m = 0`, so the "positive multiples" set is empty).
