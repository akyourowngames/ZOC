# How to Think About It

## 1. Restate the task

Given `N`, report the smallest single digit that appears in it. `5831` -> `1`. If any
digit is `0`, the answer is `0` immediately.

## 2. Spot the pattern

The digit skeleton is unchanged; only the fold differs:

```cpp
while (N > 0) {
    int d = N % 10;
    if (d < best) best = d;   // running minimum
    N /= 10;
}
```

Pair it with the largest-digit version and compare the two knobs:

| | Largest digit | Smallest digit |
| --- | --- | --- |
| initial `best` | `0` (a lower bound) | `9` (an upper bound) |
| comparison | `d > best` | `d < best` |
| killer digit | none (zeros are harmless) | `0` (instantly wins) |

Rule of thumb: initialize an extremum with the value that is hardest to beat *from the
wrong side*. For `max`, that is the smallest possible element; for `min`, the largest.

## 3. Derive the algorithm

1. Read `N`.
2. `smallest = 9` — upper bound over decimal digits.
3. While `N > 0`:
   a. `digit = N % 10;`
   b. `if (digit < smallest) smallest = digit;`
   c. `N /= 10;`
4. Print `smallest`.

Why `9` and not `0`? Because `0` would never be replaced: `digit < 0` is false for every
digit, so the program would report `0` no matter what the input was. The bound must be
reachable from the correct side.

Why not `INT_MAX`? Also valid, but then printing `smallest` for an empty digit stream
would print `2147483647`, an even more obviously wrong answer. `9` keeps the failure mode
inside the digit alphabet, which is why the `N = 0` bug slips through unnoticed.

## 4. Dry run

`N = 5831`, `smallest = 9`

| step | `N` before | `digit` | test | `smallest` | `N` after |
| --- | --- | --- | --- | --- | --- |
| 1 | 5831 | 1 | `1 < 9` yes | 1 | 583 |
| 2 | 583 | 3 | `3 < 1` no | 1 | 58 |
| 3 | 58 | 8 | `8 < 1` no | 1 | 5 |
| 4 | 5 | 5 | `5 < 1` no | 1 | 0 |
| 5 | 0 | - | loop ends | 1 | 0 |

Output `1`.

`N = 4027`, `smallest = 9`

| step | `N` before | `digit` | test | `smallest` |
| --- | --- | --- | --- | --- |
| 1 | 4027 | 7 | `7 < 9` yes | 7 |
| 2 | 402 | 2 | `2 < 7` yes | 2 |
| 3 | 40 | 0 | `0 < 2` yes | 0 |
| 4 | 4 | 4 | `4 < 0` no | 0 |

Output `0`. Once `0` is seen, no later digit can change the answer — an early-exit
opportunity if you only need the value.

`N = 0`: the loop body never runs; `smallest` remains `9`. Output `9`, which is wrong for
the usual definition ("the smallest digit of `0` is `0`"). This is the case the current
code mishandles.

## Progressive hints

1. What is the largest possible decimal digit? (`9`) Why does that make a good initial
   bound for a minimum?
2. What would happen with `smallest = 0`? (`digit < 0` is never true, so the output is
   always `0`)
3. Which comparison direction do you need? (`<`)
4. If a digit is `0`, can the answer ever change afterwards? (no — safe to `break`)
5. What if `N` is a single digit? (one iteration; the digit replaces the bound)
6. What if `N = 0`? (no iteration at all — the bound leaks into the output)

## Traps

- `smallest = 0` — the classic wrong bound; answer is always `0`.
- Copying the maximum code and forgetting to flip `<` to `>` (or vice versa) and the bound.
- Comparing `N` (the shrinking number) rather than the extracted `digit`.
- Forgetting `N /= 10` — infinite loop.
- Treating `N = 0` as "smallest digit is 9" because the loop never ran.
- Forgetting that a zero digit is real: `1200` must give `0`, not `1`.
- Using `>=` and then wondering why ties overwrite; harmless here but a bad habit when you
  track positions.
- Negative input silently prints `9`.

## Self-check

- Trace `2024` -> answer `0`.
- Trace `7777` -> answer `7` even though the update never fires.
- Explain why the answer for `N = 0` should be `0` and what single line fixes it.
- Write the corrected version with an explicit `if (N == 0) { cout << 0; return 0; }`
  guard placed before the loop.
- Rewrite the fold using `min()` from `<algorithm>` and confirm identical behaviour.
