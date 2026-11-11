# How to Think About It

## 1. Restate and formalize

The repository has no prose statement for this folder, so the model is
reconstructed from `solution.cpp`:

- `N` customers, each with a maximum willingness `a[i]`;
- one price `p` is chosen for everybody;
- customer `i` buys one unit iff `a[i] >= p`;
- revenue is `R(p) = p * |{ i : a[i] >= p }|`;
- maximize `R(p)`.

Input: `N`, then `N` integers. Output: one integer, the maximum revenue.

The brute force enumerates `p` over the input values and counts buyers with a
scan. That is valid only if restricting `p` to input values loses nothing. The
first real task is therefore a lemma about the candidate set, not an
implementation detail.

## 2. Start from brute force

```text
read N, a[0..N-1]
best = 0
for i = 0 .. N-1:
    p = a[i]
    customers = 0
    for j = 0 .. N-1:
        if a[j] >= p: customers++
    best = max(best, customers * p)
print best
```

This is the committed algorithm. Its correctness rests on two claims:

1. Some optimal price is one of the `a[i]`.
2. For a fixed `p`, the inner scan counts buyers exactly.

Claim 2 is immediate from the definition. Claim 1 needs proof; without it, the
program might miss a better price such as `p = 4` for `a = {5, 1, 5, 2}`
(`4 * 2 = 8`, which is less than `10`, but that is a coincidence, not an
argument).

The cost is `O(N^2)`: `N` outer iterations, each scanning `N` values.

## 3. Derive the optimization

### Lemma: an optimal price is a customer value

Sort the distinct values `v1 < ... < vm`. For `p <= v1` all `N` customers buy,
so `R(p) = N*p` rises to `v1`. For `vj < p <= v(j+1)` the buyer set is exactly
those with `a[i] >= v(j+1)`, a constant, so `R(p) = p*c` rises to `v(j+1)`.
For `p > vm` nobody buys. Every interval's best endpoint is a customer value,
so some `a[i]` is optimal; this also holds if real prices are allowed.

### From `O(N^2)` to `O(N log N)`

After sorting ascending, "how many elements are `>= a[i]`" is a suffix
question. For index `i`, positions `i..N-1` all hold values at least `a[i]`,
so there are at least `N - i` buyers. The candidate

```text
a[i] * (N - i)
```

is therefore a lower bound on the true revenue at price `a[i]`.

Every candidate `c_i = a[i] * (N - i)` is at most `R(a[i])`, hence at most
`OPT`, because the suffix omits only earlier elements that are `<= a[i]`
(possibly equal). At the first occurrence of a value `v`, earlier elements are
strictly smaller, so `N - i = C(v)` and `c_i = R(v)`. Since some `v` is
optimal, the maximum candidate is exactly `OPT`. Duplicates undercount later
candidates but never overcount, so they are harmless.

```text
sort(a, a + N)
best = 0
for i = 0 .. N-1:
    best = max(best, 1LL * a[i] * (N - i))
print best
```

The `1LL` cast must happen before the multiplication; casting the product
afterwards is too late.

### Alternative: binary search per price

For each distinct price `p`, the buyer count is `N - lower_bound(a, p)` and the
revenue is `p * that`: `O(N log N)` overall and explicit about first
occurrences. It is the suffix idea with a binary search instead of the index.

## 4. Correctness sketch

**Fixed-price count.** For a chosen `p`, the inner loop increments `customers`
exactly for indices with `a[j] >= p`, so `revenue = customers * p` is `R(p)`;
the brute force evaluates `R` exactly at every candidate.

**Candidate lemma.** Split the positive price axis at the distinct customer
values. On each piece the buyer set is constant, so revenue is linear with a
non-negative slope and is maximized at the right endpoint, a customer value
(or at infinity, where revenue is `0`). Hence some `a[i]` is globally optimal.

**Brute-force correctness.** By the lemma, an optimal price `p* = a[k]` is
among the enumerated candidates. The loop evaluates `R(a[k])` exactly, so
`best >= OPT`. Every evaluated value is a feasible revenue, so
`best <= OPT`. Therefore `best = OPT`.

**Sorted correctness.** Let `c_i = a[i] * (N - i)`. For every `i`,
`c_i <= R(a[i]) <= OPT`, so `max c_i <= OPT`. Let `v` be an optimal price and
`i` its first occurrence; then `c_i = v * (N - i) = R(v) = OPT`, so
`max c_i >= OPT`. Therefore `max c_i = OPT`.

**Ties.** If several prices give the same maximum (`9 5 1` and `1 5 9` both give
`10`), any is fine because only the value is printed; a strict `>` comparison
keeps the first and changes nothing observable.

## 5. Dry run

Input:

```text
4
5 1 5 2
```

**Brute force.** For each `i`, `p = a[i]`, count `a[j] >= p`:

| `i` | `p` | Buyers (`j = 0..3`) | `customers` | Revenue |
|---:|---:|---|---:|---:|
| 0 | 5 | yes, no, yes, no | 2 | 10 |
| 1 | 1 | yes, yes, yes, yes | 4 | 4 |
| 2 | 5 | yes, no, yes, no | 2 | 10 |
| 3 | 2 | yes, no, yes, yes | 3 | 6 |

`max_revenue = 10`.

**Sorted.** `a = [1, 2, 5, 5]`.

| `i` | `a[i]` | `N - i` | Product | Comment |
|---:|---:|---:|---:|---|
| 0 | 1 | 4 | 4 | all buy |
| 1 | 2 | 3 | 6 | buyers are `2,5,5` |
| 2 | 5 | 2 | 10 | first occurrence of 5; exact count |
| 3 | 5 | 1 | 5 | duplicate; undercounts, harmless |

`max = 10`, matching the brute force.

**Order does not matter.** `1 5 9` and `9 5 1` both sort to `1 5 9` and give
products `3, 10, 9`; the answer is `10` either way.

## Progressive hints

1. Raising the price without crossing any willingness keeps the buyer count
   fixed, so revenue rises.
2. Therefore, where can an optimal price live? At a willingness value.
3. With `N` candidates and an `O(N)` count each, you get `O(N^2)`. Can the
   count be answered faster after sorting?
4. In an ascending array, how many elements are `>= a[i]`? At least `N - i`;
   exactly `N - i` when `a[i]` first appears.
5. Do duplicates break the formula? Check `10 10 10`: `30, 20, 10`; still right.
6. Multiply with `1LL` before the product, not after.

## Traps

- Computing `customers * price` in `int`. `3 * 10^9` wraps to a negative
  number and the program prints `0`.
- Sizing the array at `100` and reading more values. Any `N > 100` writes out
  of bounds; the program may crash or silently corrupt memory.
- Initializing the maximum to `0` when negative prices are allowed. Prices are
  positive here, so `0` is a valid lower bound; do not generalize it blindly.
- Using `>` instead of `>=` for buyers. At price equal to willingness, the
  customer still buys; `>=` is required.
- Sorting and then using `N - i` for a non-first occurrence and concluding the
  revenue is wrong. It is an undercount, but the maximum is unaffected.
- Trying prices not in the array and assuming they are needed. The piecewise
  argument shows they are not.
- Forgetting that at a very low price, all `N` customers buy; the revenue is
  `N * min(a)`, not zero.
- Using `int` for `best` after switching to `long long` for the product.
- Reading only one line of prices; `cin >>` skips whitespace, so a short read,
  not a line break, is the real risk.
- Assuming `N > 0`; with `N = 0` the loops produce `0`.

## Self-check

1. Why is `4` not an optimal price for `5 1 5 2`?
   At `p = 4` two customers buy for `8`; at `p = 5` the same two buy for `10`.
2. Why can the answer ignore prices above `max(a)`?
   Nobody buys, so revenue is `0`, which cannot beat `max(a) * 1 >= 1`.
3. For `10 10 10`, what are the sorted candidates?
   `30`, `20`, `10`; the maximum `30` comes from the first occurrence.
4. What is the true revenue at the last `10`, and why is the candidate smaller?
   True revenue is `30`; the one-element suffix gives `10`, an undercount.
5. What is the maximum possible answer for `N = 2 * 10^5` and
   `a[i] <= 10^9`?
   `2 * 10^14`, which needs `long long` but fits comfortably.
6. If prices may be real numbers, does the algorithm change?
   No. The piecewise argument still puts an optimum at a customer value.
