# Deep Notes

## Core logic

A swap is a permutation of two slots. Any correct implementation must preserve
both old values somewhere until each has been written to its new home. The
temporary version uses an extra slot; the arithmetic version encodes the old
`A` inside the difference `A - B`, so no extra slot is needed.

Let `a0`, `b0` be the original values. The arithmetic sequence yields:

```text
A1 = a0 + b0
B1 = A1 - b0 = a0
A2 = A1 - B1 = (a0 + b0) - a0 = b0
```

so the final state is `(b0, a0)`.

## Code walkthrough

1. `int A, B; cin >> A >> B;` — two 32-bit values.
2. `A = A + B;` — right side evaluated first with the old values, then stored
   in `A`. This intermediate sum is the only place overflow can occur.
3. `B = A - B;` — uses the new `A` (the sum) and the still-old `B`, producing
   the old `A`.
4. `A = A - B;` — uses the sum and the new `B` (old `A`), producing the old `B`.
5. `cout << A << " " << B;` — prints in swapped order, one space, no newline.
6. `return 0;` — end.

The commented block above:

```cpp
// int A, B, temp;
// temp = A;  A = B;  B = temp;
// return 0;
```

is the temporary-variable swap, but it prints nothing — it is a mechanics
demo, not a submission.

## Why it works

Each assignment reads its operands before writing, so the sum temporarily
contains enough information to reconstruct both originals. Subtracting the
known `B` from the sum recovers the old `A`; subtracting that from the sum
recovers the old `B`. Algebraically exact. The practical caveat is that all
three intermediate values are computed in `int`, so the identity is only
guaranteed while no intermediate leaves the representable range.

## Complexity

Three assignments and one write: O(1) time, O(1) space. The temporary version
uses one extra variable; the arithmetic version uses none, which is why it
appears in puzzle material — not because it is better engineering.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `5 9` | `9 5` | README sample |
| `-4 7` | `7 -4` | negative plus positive |
| `3 3` | `3 3` | equal values, swap invisible |
| `0 0` | `0 0` | zeros |
| `0 -5` | `-5 0` | zero and negative |
| `2147483647 -1` | `-1 2147483647` | sum is exactly `INT_MAX`, still defined |
| `2000000000 1500000000` | `1500000000 2000000000` | sum overflows `int`; UB, though the MSVC build happened to print the expected order |
| `-2000000000 -1500000000` | `-1500000000 -2000000000` | negative overflow; same caveat |

## Common mistakes

- `A = B; B = A;` losing one value.
- Reading the inputs in one order and printing in the other before swapping.
- Assuming the arithmetic swap is always safe; it needs `A + B` in range.
- Using `float`/`double` and losing precision for large integers.
- XOR-swapping the same variable (`swap(x, x)` style), which sets it to zero.
- Printing `"After swap: "` when only the numbers are wanted.
- Forgetting the separator, producing `95` instead of `9 5`.

## Variants and follow-ups

- **`std::swap(A, B)`** from `<utility>`: the standard library version, which
  uses move/assignment and is safe for every type.
- **Swap in a function:** `void swapVals(int &a, int &b)` introduces references;
  this is the natural next exercise.
- **Rotate three values:** `A -> B -> C -> A` needs one temporary and a careful
  order; same state-sequencing skill.
- **Reverse an array in place:** two-index swap loop, the first real use of
  repeated swapping.
- **Wide arithmetic swap:** with `long long` the overflow bound moves to about
  `9.2 * 10^18`, which covers every `int` input pair.

## Key takeaways

1. Assignment destroys the old value; save what you still need.
2. Temporaries are the clear, safe default; arithmetic tricks optimise a
   variable that costs four bytes.
3. Algebra can prove a swap correct, but the proof assumes the intermediate
   values are representable.
4. Output formatting (`A` then space then `B`, one line) is part of the task.

## Current-code review

The swap logic is algebraically correct and the output matches the README
(`5 9` -> `9 5`, `-4 7` -> `7 -4`, `3 3` -> `3 3`, all verified by running the
build). One genuine defect and two minor notes:

1. **Signed overflow is undefined behaviour.** `A = A + B` overflows whenever
   `|A + B| > 2,147,483,647`. Running `2000000000 1500000000` printed the
   expected swapped pair on the MSVC build, because two's-complement wraparound
   happened to cancel in the two subtractions. That is luck, not correctness:
   with `-ftrapv`, UBSan, or an optimiser that assumes no overflow, the program
   may crash or misbehave. The README states no bounds, so the safe form is
   `long long` or the temporary-variable swap:

   ```cpp
   int temp = A; A = B; B = temp;
   ```

2. **No newline after the output.** `cout << A << " " << B;` leaves the cursor
   on the same line. Accepted by most judges, inconsistent with the rest of the
   track.

3. **The commented block is misleading.** It shows a correct temporary swap but
   returns without printing, so copying it verbatim produces empty output. If
   it is kept as documentation, add the `cout` line in the comment too.

Nothing else: the operand order, separator and value count match the statement.
