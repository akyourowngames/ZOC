# How to Think About It

## 1. Restate the task

Given `N`, report the biggest single digit appearing in it. `5831` -> `8`. Not the
biggest number, not the most frequent digit: the maximum digit value.

## 2. Spot the pattern

Same skeleton as every digit problem in this section:

```cpp
while (N > 0) {
    int d = N % 10;   // get a digit
    /* fold d into the answer */
    N /= 10;          // consume it
}
```

Only the middle line changes:

| Task | Middle line |
| --- | --- |
| count digits | `count += 1;` |
| sum digits | `sum += d;` |
| product digits | `product *= d;` |
| **largest digit** | `if (d > best) best = d;` |
| smallest digit | `if (d < best) best = d;` |

So the real question is not "how do I loop over digits" but "what do I initialize the
fold with, and what is the fold step".

For a maximum, the initial value must be a value **no real digit can beat downward**:
anything `<= 0` works because digits are `>= 0`. `0` is the natural choice and is also a
digit, so it is both a valid lower bound and a real possible answer. The general-purpose
sentinel is `-1` (or `INT_MIN`), which says "no digit seen yet".

## 3. Derive the algorithm

1. Read `N`.
2. `largest = 0` — lower bound for all decimal digits.
3. While `N > 0`:
   a. `digit = N % 10;`
   b. `if (digit > largest) largest = digit;`
   c. `N /= 10;`
4. Print `largest`.

Notice that no digit is remembered individually. A single scalar carries all the
information needed, because `max` is associative: `max(max(a,b),c) == max(a,max(b,c))`.
That is what makes streaming possible.

## 4. Dry run

`N = 5831`, `largest = 0`

| step | `N` before | `digit` | test | `largest` | `N` after |
| --- | --- | --- | --- | --- | --- |
| 1 | 5831 | 1 | `1 > 0` yes | 1 | 583 |
| 2 | 583 | 3 | `3 > 1` yes | 3 | 58 |
| 3 | 58 | 8 | `8 > 3` yes | 8 | 5 |
| 4 | 5 | 5 | `5 > 8` no | 8 | 0 |
| 5 | 0 | - | loop ends | 8 | 0 |

Output `8`.

`N = 9000`, `largest = 0`: digits `0, 0, 0, 9` -> best stays `0` for three steps, then
`9 > 0` -> `9`. Output `9`. Note the zeros did not lower the maximum, unlike the product
problem where a single zero destroyed the answer.

`N = 1010`: digits `0, 1, 0, 1` -> best `1`. Ties never matter because the update is
strictly `>`.

`N = 7`: one iteration, `7 > 0` -> `7`. Output `7`.

## Progressive hints

1. How do you isolate one digit? (`% 10`)
2. If you only keep one number, what should it represent after each iteration? (the
   largest digit among those already removed)
3. What value guarantees the first real digit replaces the best? (anything `<= 0`)
4. Compare with the smallest-digit problem: what changes in the initialization and the
   comparison direction?
5. Why is `>=` unnecessary? (equal values do not need re-assignment)

## Traps

- Initializing `largest` to `9`: nothing ever beats it, so the answer is always `9`.
- Using `if (digit < largest)` by copying the minimum code without flipping the operator.
- Comparing `N` against `largest` instead of the extracted `digit`.
- Forgetting `N /= 10` — infinite loop.
- Trying to `return` the answer early with `break` — harmless but pointless, since there
  is no way to know a later digit is not larger.
- Assuming negative input returns a meaningful digit; `-5831` prints `0` because the loop
  never runs. Take `abs` first if negatives are in scope.
- Printing a label or a newline that the judge does not expect.
- Using `char` for the digit: `N % 10` is an `int` in `0..9`; storing it in `char` and
  printing gives control characters.

## Self-check

- Trace `N = 2147483647` — the answer should be `8`.
- Trace `N = 1000000000` — the answer should be `1`.
- State the loop invariant precisely.
- Show that `max` is associative and explain why that justifies a one-variable fold.
- Rewrite the loop to also report the *number of times* the max occurs; what extra state
  do you need? (`count`, reset to `1` on a new max, `++` on an equal digit)
