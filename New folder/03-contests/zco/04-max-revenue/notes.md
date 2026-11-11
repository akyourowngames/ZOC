# Deep Notes

## Core logic

The program maximizes `R(p) = p * C(p)` with `C(p) = |{ i : a[i] >= p }|`.

Two ideas carry it. First, an optimal price is one of the willingness values:
between consecutive values the buyer set is fixed and revenue rises with the
price, and above the maximum nobody buys. Second, after sorting ascending, the
suffix length `N - i` equals the buyer count exactly at the first occurrence
of a value.

The committed code uses only the first idea, with a full scan per candidate:
correct but quadratic, plus a fixed 100-element buffer and 32-bit revenue.

## Code walkthrough

Line 5 declares four `int`s; line 7 reads `N`; line 8 is `int arr[100]`, a fixed
buffer that holds at most 100 prices with no check that `N <= 100`; lines 13-15
read the prices; lines 10-11 initialize `revenue` and `max_revenue` to zero.

Lines 17-32 are the double loop: reset `customers`, count `j` with
`arr[j] >= arr[i]` (lines 20-24), compute `revenue = customers * arr[i]`
(line 26), and update `max_revenue` (lines 28-30). The inner loop's indentation
is off, but the braces are correct. Line 34 prints the result with no newline.

Observed behavior:

| Input | Output | Notes |
|---|---:|---|
| `4` / `5 1 5 2` | `10` | correct |
| `3` / `10 10 10` | `30` | correct |
| `5` / `1 2 3 4 5` | `9` | correct |
| `0` | `0` | empty customer set |
| `3` / `10^9 10^9 10^9` | `0` | wrong; true answer `3000000000` |
| `100` / `10^9` x100 | `1215752192` | wrong; true answer `100000000000` |
| `3` / `2147483647` x3 | `2147483645` | wrong; true answer `6442450941` |
| `101` values | no output, exit `127` | out-of-bounds write; undefined behavior |
| `20000` random values | ran in `0.597 s` | undefined behavior; timing is not correctness |

Writing past `arr[100]` can appear to work (the 20000-element run) or abort
(the 101-element run). Both are undefined.

## Why it works (correctness)

**Buyer count is exact.** For fixed `i`, the inner loop visits every index once
and increments `customers` iff `arr[j] >= arr[i]`, so the computed value is
`C(arr[i])` and `revenue` is `R(arr[i])`, absent overflow.

**Candidate lemma.** For distinct values `v1 < ... < vm`: `p <= v1` gives
`C(p) = N`, best at `v1`; `vj < p <= v(j+1)` gives a constant buyer set, so `R`
rises to `v(j+1)`; `p > vm` gives zero. Hence some `a[i]` is globally optimal.

**Brute force.** The outer loop evaluates `R` at every `a[i]`, including an
optimal one by the lemma, so `max_revenue = OPT` (absent overflow and with
`N <= 100`).

**Sorted.** With `a` ascending and `c_i = a[i] * (N - i)`, we have
`c_i <= R(a[i]) <= OPT`. At the first occurrence of `v`, `N - i = C(v)`, so
`c_i = R(v)`; for an optimal `v`, `max c_i = OPT`.

**Duplicates.** Later occurrences undercount (`N - i < C(v)`), which cannot
exceed `OPT`; the first occurrence already gives the exact value. Ties are
irrelevant because only the revenue is printed.

## Complexity

| Version | Time | Space |
|---|---|---|
| Brute force (current) | `O(N^2)` | `O(N)` array |
| Sort + suffix | `O(N log N)` | `O(N)` array |
| Counting sort + suffix | `O(N + V)` | `O(V)` |
| `lower_bound` per value | `O(N log N)` | `O(N)` |

Measured with MSVC defaults: `N = 20000` took `0.597 s` for `4 * 10^8`
comparisons (about `1.5 * 10^9` comparisons per second). Extrapolating,
`N = 10^5` is roughly `10-15 s` and fails a 1-2 second limit, while
`N = 3 * 10^4` is about `0.6 s`; `N <= 100` is instant.

The 100-element bound makes this partly academic. At `N = 2 * 10^5`, sorting
does about `3.6 * 10^6` comparisons plus the sort, and the answer needs
`long long` (up to `2 * 10^14`).

## Edge cases and tests

| Input | Expected | Observed | Reason |
|---|---:|---:|---|
| `1` / `7` | `7` | `7` | one buyer at price 7 |
| `3` / `1 1 1` | `3` | `3` | all buy at price 1 |
| `3` / `10 10 10` | `30` | `30` | all buy at 10 |
| `4` / `5 1 5 2` | `10` | `10` | two buyers at 5 |
| `5` / `1 2 3 4 5` | `9` | `9` | three buyers at 3 |
| `3` / `9 5 1` | `10` | `10` | two buyers at 5 |
| `0` | `0` (or undefined) | `0` | no customers |
| `100` / `10^9` x100 | `100000000000` | `1215752192` | `int` overflow |
| `3` / `10^9` x3 | `3000000000` | `0` | product wraps negative; `max_revenue` stays 0 |
| `101` values | any correct answer | crash, exit `127` | `arr[100]` overflow |

The overflow rows show both failure modes: wrapping to a small positive number
(silently wrong) and wrapping negative (masked by `max_revenue = 0`).

## Common mistakes

- Multiplying two `int`s and storing the product in `int`. Cast first:
  `1LL * customers * arr[i]`.
- Declaring `best` as `int` but computing a `long long` product, then
  truncating on assignment.
- Fixed-size arrays without a bound check; `N > 100` is undefined behavior.
- Using `>` instead of `>=`; a customer whose willingness equals the price
  still buys.
- Believing only prices strictly inside the range are candidates; the optimum
  is at the top of an interval, which is a listed price.
- Taking the minimum price and forgetting that all `N` customers buy there.
- Sorting descending and then using `N - i` as the buyer count; the suffix
  identity requires ascending order (or adjust the formula).
- Applying `N - i` to duplicates and assuming each candidate is exact. It is an
  undercount; the first occurrence is exact.
- Resetting `max_revenue` inside the outer loop, keeping only the last
  candidate.

## Variants and follow-ups

- **Weighted customers.** If customer `i` buys `q[i]` units, revenue is
  `p * sum(q[i] for a[i] >= p)`. Sort and build suffix sums of `q`, then take
  the maximum of `a[i] * suffixQ[i]`. This is the natural generalization and
  still `O(N log N)`.
- **Cost per unit.** With production cost `c`, revenue becomes
  `(p - c) * C(p)` for `p >= c`; the same candidate argument applies because the
  objective is linear on each interval.
- **Frequency / counting sort.** If prices are bounded by a small `V`, count
  frequencies and sweep downward maintaining the number of customers at least
  the current price; `O(N + V)`.
- **Binary search per price.** `customers = N - lower_bound(a, a[i])` for each
  distinct price; useful when you want to keep the original order and avoid
  reasoning about duplicates.
- **Monotone structure.** Revenue as a function of sorted price is not
  generally unimodal (for example `1 5 9` gives `3, 10, 9`), so ternary search
  is not valid. Enumerating all candidates is the safe approach.

## Key takeaways

- Reduce a continuous choice to a finite candidate set with a piecewise
  argument; this is the central contest skill here.
- Sorting converts a nested count into a suffix length, turning `O(N^2)` into
  `O(N log N)`.
- Duplicates turn exact suffix counts into lower bounds, still enough when the
  maximum is taken at a first occurrence.
- Overflow in a product is silent; use `long long` and cast before multiplying.
- A fixed array size can crash before complexity even matters.

## Current-code review

1. **Quadratic double loop (lines 17-32).** For each of `N` prices the code
   scans all `N` customers, which is `O(N^2)`. Sorting and using `N - i`
   reduces this to `O(N log N)` and also removes the duplicate scans.
2. **Fixed buffer `int arr[100]` (line 8).** There is no check that `N <= 100`.
   With `N = 101` the test build exited with `127`; with `N = 20000` it appeared
   to run only because the out-of-bounds writes did not crash. Both are
   undefined behavior. Use `std::vector<int> arr(N)`.
3. **`int` revenue (lines 5, 26).** `customers * arr[i]` is computed in `int`.
   Examples: `3 * 10^9` wraps to a negative value and the answer prints `0`;
   `100 * 10^9` wraps to `1215752192`; `3 * 2147483647` prints `2147483645`
   instead of `6442450941`. Fix: `long long revenue = 1LL * customers *
   arr[i];` and `long long max_revenue`.
4. **`max_revenue` initialized to `0` (line 11).** For positive prices this is
   a harmless lower bound, but it masks overflow: a product that wraps negative
   leaves `0` in place of an error. With a `long long` product it is fine; it
   would be wrong for a variant with negative prices.
5. **Candidate enumeration is correct but not justified in code.** Trying every
   `arr[i]` is valid by the candidate lemma; there is no comment or test
   recording why prices not in the array can be ignored. The sorted version
   should carry that reasoning in the notes and in a comment.
6. **Misleading indentation (lines 20-24).** The inner loop is aligned as if it
   were outside the outer loop. Braces make it correct, but the formatting
   invites a brace error during edits.
7. **Redundant work on duplicates (lines 17-32).** Equal prices recompute the
   same buyer count. Sorting or deduplicating avoids this; it is a constant
   factor, not the asymptotic issue.
8. **No final newline (line 34).** `cout << max_revenue;` emits no `\n`.
   Harmless for most judges, but non-standard.
9. **No input validation (lines 7-15).** `N` is trusted, and a failed extraction
   leaves `arr` partly uninitialized while the loops still read `N` entries;
   this compounds the buffer problem.
10. **Declarations without initialization (line 5).** `revenue` and
    `customers` are assigned before use; initializing at declaration is clearer.

A minimal correct rewrite, without touching the committed file, is:

```cpp
std::vector<long long> a(N);
for (auto &x : a) std::cin >> x;
std::sort(a.begin(), a.end());
long long best = 0;
for (int i = 0; i < N; i++)
    best = std::max(best, a[i] * (N - i));
std::cout << best << "\n";
```

The brute force can also be repaired in place with `long long` products and a
`vector`, but its `O(N^2)` cost remains. No `.cpp` file was modified.
