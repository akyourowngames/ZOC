# How to Think About It

## 1. Restate the task
`N` numbers arrive; report the largest and the smallest. Two answers, one pass, one array. The
brief gives no hint about initial values, and that omission is the whole difficulty.

## 2. Spot the pattern
This is **running best**: a variable that holds the best value seen so far, updated whenever a
new candidate beats it. The same skeleton appears for maximum, minimum, longest, closest, and
"best of" in general.

The only question that ever matters is: *what value is the answer before the loop starts?*
Three candidates:

| Seed | Correct? | Failure |
| --- | --- | --- |
| `0` | no | all-negative arrays: `0` beats every element, so `max` prints `0` |
| `INT_MIN` / `INT_MAX` | usually | needs `<climits>`; correct for `max`, risky if you later add arithmetic |
| `arr[0]` | yes | needs `N >= 1`; the array supplies its own answer |

Seeding from the data is the robust choice because it cannot be wrong for any element type — no
matter how wide the range, the first element is inside it.

## 3. Derive the algorithm
1. Read `N`.
2. Fill `arr[0 .. N-1]`.
3. `max = arr[0]; min = arr[0];` — both answers are correct for the one element seen so far.
4. For `i = 1` to `N - 1`:
   - if `arr[i] > max`, then `max = arr[i]`;
   - if `arr[i] < min`, then `min = arr[i]`.
5. Print `max`, newline, `min`.

The loop may start at `1` because `arr[0]` was consumed by step 3. Starting at `0` is also
correct — the comparisons would simply be false — but it wastes one iteration and hides the
reasoning.

## 4. Dry run
Input:
```text
6
3 9 -2 7 0 5
```

| `i` | `arr[i]` | `arr[i] > max`? | `max` | `arr[i] < min`? | `min` |
| --- | --- | --- | --- | --- | --- |
| seed | — | — | `3` | — | `3` |
| `1` | `9` | `9 > 3` yes | `9` | `9 < 3` no | `3` |
| `2` | `-2` | `-2 > 9` no | `9` | `-2 < 3` yes | `-2` |
| `3` | `7` | `7 > 9` no | `9` | `7 < -2` no | `-2` |
| `4` | `0` | `0 > 9` no | `9` | `0 < -2` no | `-2` |
| `5` | `5` | `5 > 9` no | `9` | `5 < -2` no | `-2` |

Output `9` then `-2`.

All-negative input `-5 -2 -9 -1`: seed `-5/-5`; `-2` raises `max` to `-2`; `-9` lowers `min` to
`-9`; `-1` raises `max` to `-1`. Output `-1` then `-9`. With `max = 0` seeded instead, the output
would be `0` then `-9` — one wrong line, and only for negative inputs, which is why this bug
survives casual testing on `1 2 3`.

## Progressive hints
1. What if the array has exactly one element? Whatever you initialise with must produce the
   right answer without any iteration.
2. Write the update as a conditional assignment, not as a call to a function you have not
   written yet.
3. `arr[0]` exists whenever `N >= 1`; that is the natural seed.
4. Test with an array of only negatives before you believe your initialisation.

## Traps
- `max = 0`: breaks on all-negative input.
- `max = INT_MIN` but then using `max` in arithmetic such as `max - 1` — overflow at the edge.
- Reading `arr[0]` when `N` could be `0`: uninitialized read, garbage output.
- Looping `i <= N`, which compares against `arr[N]`, one past the last valid element.
- Swapping the comparison directions (`arr[i] < max`) and getting the minimum in the `max`
  variable.
- Printing the minimum first because the loop updates it second.
- Naming the locals `max` and `min` and then trying to call `std::max(a, b)` in the same scope —
  the variables shadow the functions and the call stops compiling.
- Using `>=`/`<=` and expecting a different printed answer for duplicates: the *value* is the
  same either way; only which index "wins" would change.

## Self-check
- Why is `arr[0]` a better seed than `INT_MIN`?
- How many comparisons does the loop perform for `N = 6`, and can you halve that?
- What happens with `N = 0`, and which line of the code is responsible?
- For input `2 5 5`, is the printed maximum `5`, and does it matter which `5` was kept?
