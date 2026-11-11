# Maximum Revenue

**Pattern:** Candidate enumeration, brute force, sorting with suffix counts |
**Difficulty:** Easy to Medium

## Problem statement

This folder contains only `solution.cpp` and compiled artifacts; there is no
prose statement in the repository. The model below is reconstructed from the
variable names (`customers`, `revenue`, `max_revenue`) and the code's logic.
Treat it as the working specification for this practice folder, not as a
quotation from an official contest.

There are `N` customers. Customer `i` will buy one unit if the price is at most
`a[i]`, their maximum willingness to pay. The seller chooses a single integer
price `p` for all customers. The number of buyers at price `p` is

```text
customers(p) = |{ i : a[i] >= p }|
```

and the revenue is `p * customers(p)`. Choose `p` to maximize revenue and
print that maximum.

Two consequences of the model are used by the solutions:

- Every buying customer buys exactly one unit; there is no demand curve beyond
  the threshold.
- The optimal price can be taken from the multiset `{a[i]}`. Charging more than
  the largest willingness sells nothing; between two consecutive willingness
  values the buyer count is constant, so raising the price to the top of that
  interval never hurts. The proof is in `idea.md`.

## Input and output

| Item | Format |
|---|---|
| Input line 1 | integer `N`, the number of customers |
| Input line 2 | `N` integers `a[0] .. a[N-1]`, whitespace-separated |
| Output | one integer: the maximum possible revenue |

No labels, no extra lines. Input is read from standard input. The current code
expects `N <= 100` because the prices are stored in `int arr[100]`.

## Examples

| Input | Output | Best price | Reasoning |
|---|---:|---:|---|
| `4` / `5 1 5 2` | `10` | 5 | 2 buyers at 5, or 3 buyers at 2 for `6` |
| `3` / `10 10 10` | `30` | 10 | all three buy |
| `5` / `1 2 3 4 5` | `9` | 3 | counts `5,4,3,2,1` times prices `1..5` |
| `3` / `9 5 1` | `10` | 5 | `9*1=9`, `5*2=10`, `1*3=3` |
| `3` / `1 5 9` | `10` | 5 | `1*3=3`, `5*2=10`, `9*1=9` |
| `1` / `7` | `7` | 7 | one customer |
| `3` / `1 1 1` | `3` | 1 | 3 buyers at 1 |
| `3` / `1000000000` x3 | `3000000000` expected | 10^9 | current prints `0` from `int` overflow |

The `10^9` row is a failure case, included to show the arithmetic limit; see
`notes.md`.

## Constraints and assumptions

Practice constraints (not specified by a judge):

- `1 <= N <= 100` for the committed code (fixed `arr[100]`).
- `1 <= a[i] <= 10^9`; prices are positive integers.
- One test case.
- Target version: `N <= 2 * 10^5`, answer fits in `long long`
  (`N * max(a) <= 2 * 10^14`).

Assumptions about the story (because no statement exists): each customer buys
at most one unit, all customers are independent, and the seller must pick the
same price for everyone. If the actual task allows price discrimination or
multiple units per customer, this model is wrong. If the actual task allows a
price of `0`, the revenue is `0`, which does not change a maximum over
non-negative prices.

## Approach at a glance

The direct method tries every listed price as the candidate, counts how many
customers accept it, and multiplies. That is `O(N)` candidates times `O(N)`
counting, i.e. `O(N^2)`, which is what the committed code does.

The sorted method sorts the prices ascending. At position `i`, the suffix
`a[i..N-1]` contains `N - i` elements, all at least `a[i]`. The candidate
revenue is `a[i] * (N - i)`. Taking the maximum over `i` covers every distinct
price (the first occurrence of each value produces the exact buyer count), so
the answer is correct in `O(N log N)`.

| Time | Space |
|---|---|
| `O(N^2)` brute force (current) | `O(1)` extra, `O(N)` for the array |
| `O(N log N)` sort plus one linear pass | `O(N)` for the array, `O(log N)`-`O(N)` sort stack depending on implementation |
| `O(N + V)` with counting sort when prices are bounded by `V` | `O(V)` |

## Solution

[`solution.cpp`](./solution.cpp)

The brute force is correct for `N <= 100` when `N * price` fits in `int`. It
has a hard buffer limit and overflow risk; see `notes.md` for the exact
review and the sorted replacement.

## What this teaches

- When the answer is a product over a discrete choice, enumerate the choice
  set; here only customer willingness values matter, not every integer price.
- A double loop over the same array often collapses after sorting, because
  "how many elements are at least `x`" becomes a suffix length.
- Duplicates need care: the suffix at a repeated value no longer counts the
  earlier equal elements, yet the maximum is still attained at the first
  occurrence.
- Revenue is a product of two `int`s; the result needs `long long`.
- A fixed `int arr[100]` is a specification bug as soon as `N > 100`.

## Contest checklist

- [ ] Confirm what must be read: `N`, then exactly `N` prices.
- [ ] Decide the candidate set and justify it (listed prices suffice).
- [ ] Use `long long` for `customers * price`; cast before multiplying.
- [ ] Handle `N = 0` or `N = 1` explicitly.
- [ ] Do not hard-code a 100-element array; size from `N` or use a vector.
- [ ] Sort with `std::sort` and use a suffix count, or keep the double loop
      only when `N <= 1000`.
- [ ] Break ties correctly: several prices may give the same maximum; only the
      value matters.
- [ ] Test equal prices, increasing prices, decreasing prices, and a single
      price.
- [ ] Print one integer with a newline.
