# How to Think About It

## 1. Restate the task

Add up the decimal digits of `N`. For `5072` the digits are `5, 0, 7, 2` and the
answer is `14`. Position does not matter; this is not a place-value sum, where
`5072` would contribute `5072`.

## 2. Spot the pattern

`N % 10` always yields the rightmost digit:

```text
5072 % 10 = 2
 507 % 10 = 7
  50 % 10 = 0
   5 % 10 = 5
```

`N / 10` removes that digit and exposes the next one. Combine the two and you can
walk the number from right to left without ever converting it to a string. Every
iteration does exactly one extraction and one removal, so the loop runs once per
digit.

## 3. Derive the algorithm

1. Read `N`.
2. `sum = 0` — the identity for addition.
3. While `N > 0`:
   - `sum = sum + (N % 10)` — take the last digit and add it;
   - `N = N / 10` — discard that digit.
4. Print `sum`.

The `%` must come first. If you divide first, the last digit is gone before it is
added, and the answer loses the units digit.

## 4. Dry run

`N = 5072`:

| iteration | `N % 10` | `sum` after | `N` after `/10` |
| --- | --- | --- | --- |
| 1 | 2 | 2 | 507 |
| 2 | 7 | 9 | 50 |
| 3 | 0 | 9 | 5 |
| 4 | 5 | 14 | 0 |
| exit | — | 14 | — |

Output `14`. Note how the sum is built in reverse digit order — the arithmetic
result is unaffected.

`N = 0`: no iterations, output `0`.

`N = 99`: `9 + 9 = 18` in two iterations.

`N = 2147483647`: ten iterations, output `46`.

## Progressive hints

1. Which operator gives the last digit without disturbing the rest?
2. Which operator removes that digit so the next one becomes the last?
3. Where should the accumulate step sit relative to the removal step?
4. Why does starting `sum` at `1` break every answer? (It adds a phantom digit.)

## Traps

- Dividing before taking the remainder, which loses the units digit.
- Forgetting `N = N / 10`, causing an infinite loop.
- Using `N % 10` as the loop update (`N = N % 10`), which freezes the number.
- Initialising `sum` to `1` "because something must be there"; the empty sum is
  `0`.
- Summing place values instead of digits: `5072` would give `5072`, not `14`.
- Confusing this with digit counting: `count += 1` versus `sum += N % 10`.
- Assuming the guard handles negatives; `while (N > 0)` prints `0` for `-5072`.

## Self-check

- What is the answer for `N = 7`? (`7`)
- What is the answer for `N = 1000`? (`1`)
- How many iterations for `N = 1000`? (four; the zero digits still iterate)
- Why is `sum` safe as `int`? (at most `9 * 10 = 90` for ten digits)
- What changes if the task is "sum of digits until one digit remains"?
  (Repeat the loop on `sum` while `sum >= 10`.)

Extension: compute the digital root directly with `N == 0 ? 0 : 1 + (N - 1) % 9`,
and verify it against the loop on `5072` (`14 -> 5`, and `1 + 5071 % 9 = 5`).
