# Sum of Array Elements
**Pattern:** read into a fixed array, then fold with an accumulator | **Prerequisites:** arrays, 0-based indexing, `for` loops, `cin` into array elements, accumulator variables

## Problem statement
Read an integer `N`, then read `N` integers into an array, and print the sum of those `N`
elements.

This is the first problem in the set where the data cannot be handled one value at a time by
a running total *immediately* — the brief asks you to store the values in an array first and
sum them in a second pass. That two-pass shape is the point: fill, then fold. The same job can
be done in one pass (see the variants in `notes.md`), and knowing both versions makes it clear
when storage is actually necessary.

The folder name contains a spelling mistake (`elemts`); it is kept so existing paths and links
keep working.

## Input and output
- Input: line 1 contains `N` (the number of elements); line 2 contains `N` space-separated
  integers `a[0] ... a[N-1]`. Line breaks do not matter because `cin >>` skips whitespace.
- Output: one line containing a single integer — the total sum. Empty input of zero elements
  yields `0`.

## Examples
### Example 1
```text
Input:
5
1 2 3 4 5
Output:
15
```
**Why:** `1 + 2 + 3 + 4 + 5 = 15`. The first loop stores all five values, the second loop adds
them one by one into `sum`.

### Example 2
```text
Input:
4
-2 5 -8 1
Output:
-4
```
**Why:** `-2 + 5 = 3`, `3 - 8 = -5`, `-5 + 1 = -4`. Negative elements are ordinary elements;
the accumulator must be able to go below zero, which is why `sum` is a signed `int` and starts
at `0` rather than at the first element.

### Example 3
```text
Input:
1
42
Output:
42
```
**Why:** a single element sums to itself. The second loop runs exactly once
(`i = 0; i < 1`).

### Example 4
```text
Input:
0
Output:
0
```
**Why:** `N = 0` means no elements. Neither loop body executes (`0 < 0` is false), so `sum`
keeps its initial `0`. This is the correct empty-sum convention and the reason `sum` is
initialised before the loops rather than inside them.

## Constraints and assumptions
Practice constraints (not specified by a judge). The code assumes:

- `0 <= N <= 100`. The storage is the fixed declaration `int arr[100]`, so index `100` already
  writes past the array. There is no check; `N > 100` is undefined behaviour (typical result:
  stack corruption, a crash, or a wrong sum).
- Each element fits in a 32-bit signed `int`.
- The running total fits in `int`, i.e. `|sum| <= 2,147,483,647`. With up to 100 elements that
  means the elements must average at most about `21.4` million in magnitude; summing 100 values
  near `10^9` overflows. Use `long long sum` to be safe.
- `N` is non-negative. A negative `N` is not rejected; both loops simply do not run and the
  program prints `0`, silently hiding the malformed input.
- The input actually contains `N` numbers. If it ends early, `cin >> arr[i]` fails and the
  affected elements stay uninitialized; summing them is undefined behaviour.

## Approach at a glance
1. Declare `int sum, N, arr[100];` and set `sum = 0;` **before** any loop. Initialising inside
   a loop would reset the total on every iteration.
2. `cin >> N;`
3. First pass: `for (int i = 0; i < N; i++) cin >> arr[i];` — stores element `i` at index `i`.
4. Second pass: `for (int i = 0; i < N; i++) sum += arr[i];`
5. `cout << sum;`

Two loops, each `N` iterations, both starting at index `0` and stopping **before** `N`
(`i < N`, never `i <= N`).

| Time | Space |
| --- | --- |
| O(N) | O(N) stored, O(1) extra (just `sum`) |

## Solution
[`solution.cpp`](./solution.cpp)

## What this teaches
- Arrays are contiguous blocks indexed `0 .. size-1`; the last valid index of a 100-element
  array is `99`.
- The accumulator pattern: one variable, initialised to the identity element (`0` for addition),
  updated once per item.
- Why `sum = 0` must sit outside the loop, and why `sum += arr[i]` is preferred over
  `sum = sum + arr[i]` only stylistically.
- The difference between "need all values" (mean, min, second largest, reversing) and "need a
  running total" (sum, count, product) — this problem stores data even though a one-pass
  solution exists, to practise indexing.
- Fixed-size arrays in C++ do not know their own length; `N` is your responsibility.

## Checklist
- [ ] I can restate the problem
- [ ] I can derive the loop/condition
- [ ] I can handle the edge cases
- [ ] I can rewrite the solution from memory
