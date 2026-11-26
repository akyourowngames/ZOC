# How to Think About It

## 1. Restate the task

Two numbers go in. Print them in the opposite order — not sorted, not
reversed as digits, but exchanged position by position.

## 2. Spot the pattern

Three assignments, two variables. The obstacle is that the first assignment
destroys information the later ones need. This is the first exercise where
**state sequencing** matters: you must reason about what each variable holds
after every line, not just at the end.

## 3. Derive the algorithm

Temporary-variable version (safe by construction):

1. Read `A`, `B`.
2. `temp = A` — save the value that is about to be lost.
3. `A = B` — overwrite `A` with the other value.
4. `B = temp` — restore the saved value into `B`.
5. Print `A`, then a space, then `B`.

Arithmetic version (what the active code does):

1. Read `A`, `B`.
2. `A = A + B` — `A` now holds the sum, `B` still holds the old `B`.
3. `B = A - B` — subtract the old `B` back out, so `B` becomes the old `A`.
4. `A = A - B` — subtract the new `B` (old `A`) from the sum, leaving old `B`.
5. Print `A` and `B`.

XOR version, for completeness: `a ^= b; b ^= a; a ^= b;`. Same idea, valid
only for integers.

## 4. Dry run

Input `5 9`, arithmetic version:

| Line | `A` | `B` | Meaning |
| --- | --- | --- | --- |
| start | `5` | `9` | old values |
| `A = A + B` | `14` | `9` | `A` holds 14 = 5 + 9 |
| `B = A - B` | `14` | `5` | `14 - 9 = 5`, old `A` recovered |
| `A = A - B` | `9` | `5` | `14 - 5 = 9`, old `B` recovered |
| output | `9` | `5` | swapped |

Input `5 9`, temporary version:

| Line | `A` | `B` | `temp` |
| --- | --- | --- | --- |
| start | `5` | `9` | unset |
| `temp = A` | `5` | `9` | `5` |
| `A = B` | `9` | `9` | `5` |
| `B = temp` | `9` | `5` | `5` |
| output | `9` | `5` | |

Both end in the same state. Note the temporary version never does arithmetic,
so it cannot overflow.

## Progressive hints

1. Try `A = B; B = A;` on paper with `5 9`. What are `A` and `B` afterwards?
   You will find both are `9`; the `5` is gone.
2. What do you need to remember before overwriting `A`? One value. Store it.
3. For the sum trick, write down what `A` and `B` hold after each line. If you
   can recover the old `B` from the sum, you are done.
4. Print `A` and `B` with a separating space; check the order against the
   sample.
5. Test equal values, zero, and negatives.

## Traps

- `A = B; B = A;` — the copy destroys the value it needs.
- Printing the originals because the swap happened after the `cout`.
- Arithmetic swap overflow. `A + B` must fit in the type; with `int` and
  `1,500,000,000` each, the sum is undefined behaviour. (On the two's-complement
  build used to verify this file it happened to print correctly, which is
  exactly what makes UB dangerous: it *looks* right.)
- Using `unsigned` and assuming the XOR swap is portable; it is only for
  integers, not for `double` or `string`.
- Swapping through a reference to a non-existent variable, or calling
  `swap(A, A)` with the XOR trick, which zeroes the value.
- Forgetting the space, or printing a trailing sentence after the numbers.

## Self-check

- After `A = A + B; B = A - B;`, what does `B` hold, symbolically?
- Why does the temporary version need no arithmetic at all?
- What is the largest `A + B` your type can hold, and are both inputs within
  that visible bound?
- Does the output match `9 5` exactly — order, separator, one line?
