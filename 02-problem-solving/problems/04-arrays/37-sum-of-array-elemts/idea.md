# How to Think About It

## 1. Restate the task
`N` values arrive, then their total is printed. The brief asks for an array, so the shape is:
read the count, fill a buffer, then walk the buffer and accumulate.

Ask yourself which of the two passes actually needs the array. For a sum, neither does — a
single loop reading and adding would work. But the array version is what the exercise wants,
and the second pass is what later problems (searching, reversing, finding a maximum) genuinely
require.

## 2. Spot the pattern
Two standard building blocks stacked:

| Block | Code shape | Purpose |
| --- | --- | --- |
| fill | `for (i = 0; i < N; i++) cin >> arr[i];` | map input position to array index |
| fold | `for (i = 0; i < N; i++) sum += arr[i];` | collapse many values into one |

A fold needs three things: an accumulator, an identity value, and a combining operation. Here
they are `sum`, `0`, and `+`. Change them and the same skeleton computes a product (`1`, `*`),
a count (`0`, `+1` when a condition holds), or a maximum (`arr[0]`, "keep the larger").

## 3. Derive the algorithm
1. Declare `sum` and set it to `0`. This must happen once, before the loops.
2. Read `N`.
3. Loop `i` from `0` to `N - 1`, reading each element into `arr[i]`. Input order maps to index
   order, so the first number lands in `arr[0]`.
4. Loop `i` from `0` to `N - 1` again, adding `arr[i]` to `sum`.
5. Print `sum`.

Both loops use `i < N`. Using `i <= N` reads `arr[N]`, which is outside the used range and,
for `N = 100`, outside the array entirely.

## 4. Dry run
Input:
```text
5
4 -1 7 0 3
```

**Pass 1 — fill.**

| `i` | token read | `arr[i]` |
| --- | --- | --- |
| `0` | `4` | `arr[0] = 4` |
| `1` | `-1` | `arr[1] = -1` |
| `2` | `7` | `arr[2] = 7` |
| `3` | `0` | `arr[3] = 0` |
| `4` | `3` | `arr[4] = 3` |

**Pass 2 — fold.**

| `i` | `arr[i]` | `sum` before | `sum` after |
| --- | --- | --- | --- |
| `0` | `4` | `0` | `4` |
| `1` | `-1` | `4` | `3` |
| `2` | `7` | `3` | `10` |
| `3` | `0` | `10` | `10` |
| `4` | `3` | `10` | `13` |

Output `13`.

Check against the identity property: if `N = 0`, pass 1 and pass 2 both run zero times and the
output is `0`, which is the sum of an empty collection. If `N = 1` with value `42`, the output
is `42` — the accumulator passes the single value through unchanged.

## Progressive hints
1. You need two numbers before the loop body makes sense: where to store, and what to add to.
2. `cin >> arr[i]` works because `arr[i]` is an lvalue — a place to write.
3. Set the accumulator to the *identity* of the operation, not to the first element. Sums start
   at `0`; products start at `1`; maxima cannot start at `0`.
4. Trace `N = 0` by hand before you trust the loop bounds.

## Traps
- `sum` initialised inside the fill loop, so only the last element survives.
- `i <= N` in either loop: one out-of-range access. With `N = 100` this is a genuine buffer
  overflow, not just a wrong answer.
- Confusing `N` (the count) with the last index (`N - 1`).
- Declaring `int arr[N];` where `N` is read at runtime — that is a variable-length array, not
  standard C++ (GCC accepts it as an extension; MSVC rejects it). `arr[100]` is the portable
  choice here.
- Assuming the array is zero-filled. Local arrays are not initialised; every element must be
  written before it is read.
- Summing into `int` when the elements are large: 100 values near `10^9` overflow. `long long`
  costs nothing.

## Self-check
- Why does the code still print a correct answer if you merge the loops into one?
- What is the value of `arr[100]` on a 100-element array, and why must you never touch it?
- With `N = 3` and input `1 2 3`, what is the state of `arr[1]` right after the first loop?
- If the problem asked for the average instead, what else would you need to be careful about?
  (Integer division truncation, and dividing by `N = 0`.)
