# How to Think About It

## 1. Restate the task

Say whether the decimal representation of `N` contains the digit `0`. `4027` -> `YES`,
`5831` -> `NO`. One bit of output, so one bit of state should be enough.

## 2. Spot the pattern

Three levels of the same scan, ordered by how much state they need:

| Question | State | Update | Output |
| --- | --- | --- | --- |
| does digit `D` occur? | `bool found` | `if (d == D) found = true;` | `YES`/`NO` |
| how often does `D` occur? | `int count` | `if (d == D) ++count;` | the count |
| which digits occur, how often? | `int freq[10]` | `++freq[d];` | the table |

The active code is the first row with `D` hard-coded to `0`. It is the cheapest form: a
single boolean, and it can stop as soon as the answer is known.

Ask yourself "what is the minimum information I must remember?" before choosing the state.
A flag is weaker than a counter, and weaker state means fewer ways to be wrong.

## 3. Derive the algorithm

1. Read `N`.
2. `flag = 0` — assume no zero until proven otherwise.
3. While `N > 0`:
   a. `digit = N % 10;`
   b. `if (digit == 0) flag = 1;`
   c. `N /= 10;`
4. If `flag` is `1` print `YES`, else print `NO`.

Optional improvement: `break;` immediately after setting the flag. Once you know a zero
exists, no remaining digit can unset it.

## 4. Dry run

`N = 4027`, `flag = 0`

| step | `N` before | `digit` | `digit == 0`? | `flag` | `N` after |
| --- | --- | --- | --- | --- | --- |
| 1 | 4027 | 7 | no | 0 | 402 |
| 2 | 402 | 2 | no | 0 | 40 |
| 3 | 40 | 0 | yes | 1 | 4 |
| 4 | 4 | 4 | no | 1 | 0 |

`flag == 1` -> `YES`.

`N = 5831`, `flag = 0`

| step | `N` before | `digit` | `digit == 0`? | `flag` |
| --- | --- | --- | --- | --- |
| 1 | 5831 | 1 | no | 0 |
| 2 | 583 | 3 | no | 0 |
| 3 | 58 | 8 | no | 0 |
| 4 | 5 | 5 | no | 0 |

`flag == 0` -> `NO`.

`N = 1000`: digits `0, 0, 0, 1` — the first one sets the flag; the scan could break there.
Output `YES`.

`N = 0`: the loop never runs, `flag` stays `0`, output `NO`. Wrong under the usual
definition (the single digit of `0` is `0`), and the case worth fixing.

## Progressive hints

1. What single fact do you need at the end? ("a zero was seen") How many bits is that?
2. What is the "not found yet" value? (`0` / `false`)
3. How do you extract a digit? (`% 10`) How do you advance? (`/= 10`)
4. Do you need to keep scanning after a match? (no — `break`)
5. What changes if the target is `D` instead of `0`? (compare against `D`; read `D`)
6. What changes if you need the count? (replace the flag with `++count`)

## Traps

- Using a counter but printing it as `YES`/`NO` without comparing to zero.
- `if (digit = 0)` — assignment instead of comparison; the expression is `0` (false) and
  `digit` is clobbered. Compilers warn; enable warnings.
- Initializing `flag = 1` ("assume found"), which makes the output always `YES`.
- Forgetting `N /= 10` — infinite loop.
- Testing `N == 0` as the loop condition and concluding "no zero" for the input `0`.
- Thinking a zero digit is impossible inside an integer: `4027 % 10` is `7`, but the third
  extraction is exactly `40 % 10 == 0`.
- Using the commented counting block and expecting it to answer "does 0 occur?" for `N = 0`
  — it also returns `0`.
- Mismatching case: `Yes`/`yes` instead of `YES`.

## Self-check

- Trace `N = 2147483640` -> `YES` (last digit 0).
- Trace `N = 2147483647` -> `NO`.
- Explain why existence needs less state than counting.
- Add the `break` and argue that the answer is unchanged.
- Rewrite the check with a `while (N > 0 && !flag)` loop condition instead of `break`.
- Predict the output of the active code for `N = 0` and explain the discrepancy.
