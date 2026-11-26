# Deep Notes

## Core logic

An existence question needs a single bit. `flag` starts at `0` ("not seen") and is set to
`1` the first time a digit equals `0`. Nothing else is recorded, so the state is minimal
and the loop is a scan-and-set: read one digit, test it, discard it.

Because the predicate is monotone — once true, it stays true — the scan can terminate
early. That is the practical difference between a flag and a counter: a counter must see
every digit, a flag may stop at the first witness.

## Code walkthrough

The file currently holds two versions: the active one, and an older, fully commented-out
one above it.

**Commented historical version (digit counting, not active):**

```cpp
// int N, D, counter, digit;
// cin >> N; cin >> D;
// counter = 0;
// while (N > 0) {
//     digit = N % 10;
//     if (digit == D) counter += 1;
//     N = N / 10;
// }
// cout << counter;
```

This is a faithful "count occurrences of `D`" solution for `N >= 1`, and it reads two
inputs. It has the same `N = 0` blind spot (prints `0` for `N = 0, D = 0`, where the true
count is `1`) and it destroys `N`. It is kept for study only; `main` comes from the block
below it, so only one `main` is compiled.

**Active version:**

```cpp
int N, digit, flag;
cin >> N;
flag = 0;             // "no zero seen yet"

while (N > 0) {
    digit = N % 10;
    if (digit == 0) {
        flag = 1;     // witness found
    }
    N = N / 10;       // consume the digit
}

if (flag == 1) cout << "YES";
else           cout << "NO";
```

- `flag = 0;` before the loop; the loop never resets it.
- No `break` after setting the flag: correct but does extra work. Adding `break;` inside
  the `if` is a free optimisation.
- `digit` is a separate variable only for readability; `N % 10` inline would work.
- Output has no newline; `"YES"`/`"NO"` are uppercase, matching the README.

## Why it works

Invariant: at the top of each iteration, `flag == 1` if and only if one of the digits
already removed from the original number is `0`.

- Base: no digits removed, `flag = 0`. True.
- Step: the newly removed digit is compared with `0`; the flag is set exactly when a new
  witness appears, and otherwise left untouched.
- Exit: `N == 0`, so every digit was removed. Therefore `flag == 1` iff the original
  number contains a `0`.

The output mapping is a direct restatement: existence -> `YES`, otherwise `NO`.

## Complexity

- Time: O(d) with `d <= 10` for `int`. With the early `break`, best case O(1) (a zero in
  the units place, e.g. `N = 4020`), worst case O(d) (no zero, or a zero in the leading
  position).
- Space: O(1) — three integers, no string.
- Alternative: read as `string` and call `s.find('0') != string::npos` — same time bound,
  O(d) memory, simpler to write but loses the arithmetic practice.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| 4027 | YES | zero in the middle |
| 5831 | NO | no zero digit |
| 1000 | YES | trailing zeros |
| 10 | YES | zero in the units place; early exit possible |
| 0 | YES by the usual definition; current code prints NO | loop never runs |
| 7 | NO | single non-zero digit |
| 2147483647 | NO | `INT_MAX` contains no zero |
| 2147483640 | YES | ends in zero |
| -402 | NO (current) | loop never runs for negatives |

## Common mistakes

- `flag = 1` initially -> always `YES`.
- `if (digit = 0)` -> assignment, not comparison.
- Resetting the flag inside the loop.
- Printing the flag (`0`/`1`) instead of `YES`/`NO`.
- Forgetting to consume `N` — infinite loop.
- Confusing the two problems in this folder: existence (`flag`) versus occurrence count
  (`counter`), and the target digit (`0` here) versus an input digit (`D` in the commented
  block).
- Reading two integers when the active statement defines only one input.

## Variants and follow-ups

- **Count occurrences of a chosen digit `D`**: `if (d == D) ++count;` — the commented block.
- **Count occurrences of every digit**: `int freq[10] = {0}; ++freq[N % 10];` then print the
  table. Melds directly into "first non-repeating digit" and "most frequent digit".
- **Contains a specific digit, early exit**: `break;` on match, or
  `while (N > 0 && digit != D)`.
- **All digits distinct**: flag array of size 10, detect a repeat.
- **Has an even digit**: `if ((d % 2) == 0) found = true;` — a different predicate on the
  same scan.
- **Streaming over a string**: handles numbers beyond 64-bit range and preserves leading
  zeros, which matter for "does the number contain 0" when the input is `0007`.

## Key takeaways

- Match the state to the question: existence -> flag, count -> counter, distribution ->
  array. Over-strong state invites over-strong claims.
- Predicates that are monotone (once true, always true) permit early termination.
- Destructive scans force you to copy or store if you need more than one answer.
- `0` is easy to miss in tests; every digit problem needs a case with an internal or
  trailing zero.

## Current-code review

Three observations; the first is the only behavioural defect.

1. **`N = 0` answers `NO`, which contradicts the natural reading.** The loop
   `while (N > 0)` never executes for zero, so `flag` stays `0` and the program prints
   `NO`. The single decimal digit of `0` *is* `0`, so `YES` is the correct answer. The
   README restricts `N` to a positive integer, so this is an out-of-domain edge rather
   than a contradiction of the stated task; still, it is a silent wrong answer. Fix:

   ```cpp
   if (N == 0) { cout << "YES"; return 0; }
   ```

2. **Scope mismatch between the folder name and the active program (documented, not a
   bug).** `21-occurence-of-digits-in-a-number` suggests counting occurrences of a digit;
   the active code only tests whether `0` occurs. The README states this explicitly, so
   behaviour matches the documentation. The commented block is the counting variant; if
   the counting exercise is intended, it should be restored, given a `N == 0` guard, and
   the README updated to match.

3. **Minor efficiency / style.** No `break` after `flag = 1`, so the loop always scans all
   digits even when the answer is already known. Also, `flag` could be `bool` and
   `if (flag == 1)` reduced to `if (flag)`. Neither affects correctness.

Negative input is out of domain and prints `NO` because the loop never runs.
