# Deep Notes

## Core logic
One fixed-size buffer, two linear passes, one accumulator. Pass 1 copies the input stream into
`arr[0 .. N-1]`. Pass 2 folds those elements into a single `int` with `+=`. The identity value
`0` makes the empty array (N = 0) return zero without a special case.

## Code walkthrough
```cpp
int sum, N, arr[100];
sum = 0;
cin >> N;
```
- `arr[100]` is a fixed-size block of 100 four-byte `int`s (400 bytes) allocated in `main`'s
  frame. It is **not** initialised: all 100 elements hold indeterminate values until written.
- `sum = 0;` is a separate statement, which is deliberate: the accumulator must be reset once,
  not per iteration.
- `cin >> N;` — if this fails, `N` holds garbage and the loops take an arbitrary number of
  iterations; the program has no defence against malformed input.

```cpp
for(int i = 0; i < N; i++) {
    cin >> arr[i];
}
```
- `i` is declared in the loop header, so it does not leak into the rest of `main`.
- The condition is `i < N`, so the last write is `arr[N-1]`. Safe for `N <= 100`.
- If the input runs out early, `cin >> arr[i]` sets the stream's fail bit and leaves `arr[i]`
  untouched (uninitialized). The loop keeps spinning with no effect and pass 2 sums garbage.

```cpp
for(int i = 0; i < N; i++) {
    sum += arr[i];
}
cout << sum;
```
- `sum += arr[i]` is `sum = sum + arr[i]`; the addition is done in `int`, so each partial total
  can overflow even if the final answer would have fit.
- `cout << sum;` prints a bare decimal integer, no newline.

## Why it works
The fill loop establishes the post-condition `arr[k]` equals the `(k+1)`-th input token for
every `0 <= k < N`. The fold loop maintains the invariant: after iteration `i`, `sum` equals
`arr[0] + ... + arr[i]`. Base case: before the first iteration, `sum = 0`, the empty sum.
Inductive step: adding the next element extends the sum by exactly that element. When
`i = N - 1` finishes, `sum` is `arr[0] + ... + arr[N-1]`, the required total. Since addition of
integers is associative and commutative, the order of accumulation does not affect the result
(only overflow could, which is why overflow is checked separately).

## Complexity
`O(N)` time: exactly `N` extractions and `N` additions, plus `O(1)` setup. Space is `O(N)` for
the stored elements — `O(100)` in the fixed-declaration sense, i.e. `O(1)` — and `O(1)` extra
for `sum` and `i`. The one-pass variant drops the array and keeps only `O(1)` total space. If
`N` could be large, the fixed buffer would be the binding constraint, not the time.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `5` / `1 2 3 4 5` | `15` | the canonical case |
| `4` / `-2 5 -8 1` | `-4` | accumulator crosses zero; signed type needed |
| `1` / `42` | `42` | single iteration |
| `0` | `0` | empty sum; identity value |
| `3` / `0 0 0` | `0` | zeros contribute nothing |
| `2` / `-2147483648 1` | overflow (UB) | partial sum leaves `int` range |
| `3` / `2000000000 2000000000 1` | overflow (UB) | MSVC prints `-294967295`; needs `long long` |
| `101` + 101 numbers | UB | writes `arr[100]`, past the end of the buffer |
| `-1` | `0` | both loops skipped; malformed input silently accepted |
| `3` / `1 2` (only 2 tokens) | UB | `arr[2]` never assigned, then summed |

## Common mistakes
- `sum = 0;` placed inside the fold loop, printing only the last element.
- `for (i = 1; i <= N; i++)` — misses `arr[0]`, reads `arr[N]`.
- Reading with `cin >> arr[N]` (a constant) instead of `arr[i]`; every token overwrites the
  same slot.
- Using `int arr[N];` with a runtime `N`, then compiling with MSVC and getting an error (or
  with GCC and quietly relying on a non-standard extension).
- Believing the array grows when you read more values — it never does; `N > 100` corrupts
  memory, and the symptom may appear far from this loop.
- Summing into `int` because "the elements are `int`". The total needs its own range analysis:
  `N * max|a[i]|`.
- Forgetting that `cout << sum` with no `'\n'` is fine for judges but merges with the next
  output in interactive use.

## Variants and follow-ups
- **One pass, no array:** `for (i=0;i<N;i++){ int x; cin >> x; sum += x; }` — same answer,
  `O(1)` space, and it cannot overflow the buffer. The preferred solution when the array is not
  needed later.
- **`long long` accumulator:** `long long sum = 0;` keeps 100 elements of up to `9 * 10^16`
  safe; costs nothing and removes a whole class of wrong answers.
- **Product instead of sum:** change the identity to `1` and `+=` to `*=`. Watch for early
  overflow and for the element `0`.
- **Average:** print `sum / N` (integer truncation) or cast to `double` for a real mean; guard
  `N == 0`.
- **Prefix sums:** store `pref[i+1] = pref[i] + arr[i]` to answer any range sum in `O(1)` after
  `O(N)` preprocessing — the natural next step from this fold.
- **Dynamic size:** `std::vector<int> v(N);` removes the 100-element ceiling and is the modern
  replacement for `int arr[100]`.
- **`std::accumulate`:** `accumulate(arr, arr + N, 0LL)` from `<numeric>` does the fold; the
  `0LL` start value is what makes it overflow-safe.

## Key takeaways
- An accumulator is three decisions: start value, update rule, and where the reset happens.
- `0 .. N-1` is the only valid index range; `N` itself is out of bounds.
- Fixed-size arrays have no length information and no bounds checking — `N` is your contract.
- The sum of `N` values needs `log2(N)` more bits than a single value; plan the type before
  submitting.

## Current-code review
The implementation is correct for the documented practice domain (`0 <= N <= 100`, small
elements), but it has real defects outside it, in order of severity:

1. **No bound check on `N`.** `int arr[100]` with `for (i = 0; i < N; i++) cin >> arr[i];`
   writes past the array when `N > 100`. That is a stack buffer overflow (undefined behaviour),
   not merely a wrong answer. Minimal fix: `if (N > 100) return 1;` before the fill loop, or use
   `std::vector<int> arr(N)`.
2. **`N = 0` and negative `N` are accepted silently.** Both print `0`, which is right for `N = 0`
   and conceals malformed input for `N < 0`. A guard would make the failure visible.
3. **`int` accumulator overflow.** `sum += arr[i]` is performed in `int`; with up to 100 elements
   the safe magnitude per element is about `21.4 * 10^6`. Signed overflow is UB. Fix:
   `long long sum = 0;`.
4. **Unchecked extraction.** If fewer than `N` tokens are supplied, `cin` fails, the remaining
   `arr[i]` stay uninitialized, and the fold reads indeterminate values. Checking
   `if (!(cin >> arr[i])) return 1;` makes the failure explicit.
5. **No trailing newline** after `cout << sum;` — cosmetic only.
