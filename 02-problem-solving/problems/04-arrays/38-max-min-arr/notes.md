# Deep Notes

## Core logic
Two running best values over a fixed array, seeded from `arr[0]` and updated once per element
with strict comparisons. Because comparisons never do arithmetic, the full `int` range is safe.
The scan starts at index `1` since index `0` provided the seed.

## Code walkthrough
```cpp
int N, max, min;
cin >> N;
int arr[100];
```
- `max` and `min` are declared **before** they are needed and before `N` is read; they are
  uninitialized until the seed line runs.
- The local names `max` and `min` shadow `std::max` / `std::min` because of
  `using namespace std;`. That is legal, but it means `max(N, M)` would not compile in this
  scope — the identifier now names an `int` variable. This is a real obstacle if you later add a
  helper call.
- `int arr[100];` sits on the stack, uninitialized, 400 bytes.

```cpp
for(int i = 0; i < N; i++) {
    cin >> arr[i];
}
```
Fills indices `0 .. N-1`. If `N > 100`, `arr[100]` and beyond are written — undefined behaviour.
If the input is short, the trailing elements stay indeterminate.

```cpp
max = arr[0];
min = arr [0];
```
The seed. Both invariants ("`max` is the largest element seen", "`min` is the smallest element
seen") are true for the single element `arr[0]`. This line also requires `N >= 1`: with `N = 0`,
`arr[0]` was never written, so this is an uninitialized read.

```cpp
for(int i = 1; i < N; i++) {
    if(arr[i] > max) {
        max = arr[i];
    }
    if(arr[i] < min) {
        min = arr[i];
    }
}
```
Two independent `if`s, not `if/else if`. In fact at most one of them can fire in a given
iteration, because `max >= min` always holds, so an element cannot be both above `max` and
below `min`. Writing them as two plain `if`s keeps the code uniform and avoids any reasoning
about which branch is "impossible". The comparisons are strict, so duplicates never reassign —
harmless here, important for variants that track positions.

```cpp
cout << max << endl;
cout << min;
```
Maximum first (the README's order), then minimum, with the second line unterminated.

## Why it works
After `i = 1` completes, `max` is the larger of `arr[0], arr[1]` and `min` the smaller. Assume
after iteration `i` that `max` is the largest of `arr[0..i]`. Iteration `i+1` compares
`arr[i+1]` with that maximum: if it is larger, it becomes the new maximum; if not, the previous
maximum is still the largest of the extended prefix. The result is the largest of
`arr[0..N-1]`, and symmetrically for the minimum. Seeds are the base case, so the induction
starts at one element rather than at zero.

## Complexity
`O(N)` time: the fill loop is `N` reads, the scan is `2(N - 1)` comparisons plus at most
`2(N - 1)` assignments. Space is `O(N)` for the array (`O(1)` if you consider the fixed 100
slots constant) and `O(1)` extra for `max`, `min`, `i`. There is no sorting, so no `O(N log N)`
term — finding an extremum never needs ordering.

`2N - 2` comparisons is asymptotically optimal: every element except the seed must be examined
at least once, and an adversary can force ~`1.5N` comparisons for simultaneous min/max; the
paired-comparison trick in the variants reaches that bound but is not worth it at `N <= 100`.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `6` / `3 9 -2 7 0 5` | `9` then `-2` | canonical mixed signs |
| `4` / `-5 -2 -9 -1` | `-1` then `-9` | all negative; defeats `max = 0` |
| `1` / `7` | `7` then `7` | loop body never runs; seed is the answer |
| `5` / `4 4 4 4 4` | `4` then `4` | strict comparisons never fire |
| `2` / `5 5` | `5` then `5` | duplicate pair |
| `2` / `-2147483648 2147483647` | `2147483647` then `-2147483648` | full range, no arithmetic |
| `3` / `0 -1 1` | `1` then `-1` | zero is neither extreme |
| `0` | unspecified (UB) | reads uninitialized `arr[0]`; may accidentally print `0`/`0` |
| `101` + 101 values | UB | buffer overflow at `arr[100]` |
| `3` / `1 2` | UB | `arr[2]` uninitialized, still compared |

## Common mistakes
- Seeding `max = 0` / `min = 0` and testing only positive arrays.
- Forgetting that `min` starts high and `max` starts low; the seed handles both, so no constants
  are needed at all.
- Writing `if (arr[i] > max) min = arr[i];` — a copy-paste slip that corrupts both answers.
- `for (i = 0; i <= N; i++)` reading `arr[N]`.
- Using `int arr[N]` (VLA) instead of `int arr[100]`; MSVC rejects it, GCC silently allows it.
- Trying to call `std::max` after declaring `int max;` — name shadowing, compile error.
- Printing `min` first, or omitting the newline between the two values so they print as `9-2`.
- Assuming the array must be sorted; it does not, and sorting would cost more.

## Variants and follow-ups
- **Sentinel seed:** `int max = INT_MIN, min = INT_MAX;` from `<climits>`, then loop from `0`.
  Correct for `N >= 1` and avoids touching `arr[0]` before the loop, but still undefined for
  `N = 0` and one arithmetic slip away from overflow if you later compute `max + min`.
- **Streaming, no array:** read each value twice? No — read once into `x`, seed on the first
  iteration with a `bool first = true;` flag, otherwise compare. `O(1)` space, which is the real
  fix for the buffer limit.
- **Positions:** track `maxIndex` / `minIndex` alongside the values; only the first occurrence
  wins with strict comparisons.
- **`std::minmax_element`:** `auto p = minmax_element(arr, arr + N);` returns iterators to both
  extrema in one pass using the optimal paired-comparison strategy.
- **Second largest / second smallest:** needs two variables and careful duplicate handling
  (`>` vs `>=`), a common interview follow-up.
- **Count of extrema / range:** `max - min` is the range of the data — careful, this *does*
  arithmetic and can overflow for extreme values.

## Key takeaways
- Seed running bests from real data; constants are a trap for signed ranges.
- One pass answers both questions; two independent `if`s keep the updates honest.
- Comparisons are overflow-free; arithmetic on extrema is not.
- Fixed-size arrays plus a runtime `N` mean the bound check is your responsibility.

## Current-code review
The algorithm is correct, but the program has one genuine defect and two limitations:

1. **`N = 0` (or `N < 0`) reads an uninitialized element.** `max = arr[0]; min = arr[0];`
   executes before any guarantee that an element exists. With `N <= 0` the fill loop never runs,
   `arr[0]` is indeterminate, and both output lines are unspecified values (undefined behaviour).
   In practice a fresh stack often holds `0` there, so the program may print a tidy `0` / `0` and
   look correct — the most dangerous kind of bug. The statement implicitly assumes `N >= 1` but
   nothing enforces it. Fix: `if (N < 1) return 0;` after reading `N`, or document `N >= 1` as a
   hard input guarantee.
2. **No upper bound check.** `int arr[100]` with `for (i = 0; i < N; i++)` overflows the stack
   buffer for `N > 100`. Fix: `if (N > 100) return 1;` or `std::vector<int> arr(N);`.
3. **`max` / `min` shadow `std::max` / `std::min`.** Legal but hostile with
   `using namespace std;`: any later call to `max(a, b)` in `main` fails to compile. Renaming to
   `mx` / `mn`, or qualifying `std::max`, is the usual cure.

No arithmetic, comparison-direction, or output-order bug was found: the maximum is printed
first, then the minimum, which matches the statement. The only formatting nit is that the last
line has no trailing newline.
