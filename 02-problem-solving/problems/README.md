# Problem Solving - Problem Index

This folder holds 38 small C++ problems, solved in the order they were learned.
Each folder is self-contained and follows the same four-file convention, so a
problem can be read as a statement, then as a hint sheet, then as a solution,
then as a list of traps.

- `README.md` - the statement, examples, constraints, and the expected output
- `idea.md` - the thinking steps and hints, deliberately incomplete
- `notes.md` - lessons, edge cases, and mistakes made while solving
- one `.cpp` file - the current working solution. The name varies by problem
  (`solution.cpp`, `even-odd.cpp`, `greater-number.cpp`,
  `divisibility-test.cpp`, `maximum-of-three.cpp`, `middle-number.cpp`).

Folder numbers are the intended study order, not a difficulty ranking. Binary
artifacts (`.exe`, `.obj`, `.pdb`, `.ilk`) belong in
`99-build-artifacts/problem-solving/`, never next to the source.

A cross-cutting explanation of the idea behind every problem, grouped by
pattern and with the reasoning spelled out, lives in
[`../PROBLEM-LOGIC.md`](../PROBLEM-LOGIC.md).

Column meanings: `Time` and `Space` are asymptotic in `N` (the numeric bound or
array length) or `d` (the number of decimal digits). `Key trap` is the mistake
that most often costs a wrong answer, not a compile error.

## I/O and arithmetic

| # | Folder | Core idea | Pattern | Time | Space | Key trap |
|---|--------|-----------|---------|------|-------|----------|
| 01 | [01-basic-input-and-arithmetic](./01-basic-input-and-arithmetic/) | Read two integers, print product, quotient, difference, sum, remainder in that fixed order | read-compute-print | O(1) | O(1) | `b / a` and `b % a` require `a != 0`; division truncates toward zero |
| 02 | [02-mid-input-and-arithmetic](./02-mid-input-and-arithmetic/) | Last 1, 2, 3 digits as `num % 10`, `num % 100`, `num % 1000` | modular masking | O(1) | O(1) | C++ `%` keeps the dividend's sign, so negative input prints negative remainders |
| 08 | [08-swapping-values](./08-swapping-values/) | Exchange two values using only `+` and `-` | arithmetic swap | O(1) | O(1) | `A + B` can overflow `int`; the commented `temp` version cannot |
| 32 | [32-square-of-a-number](./32-square-of-a-number/) | Wrap `N * N` in a function and print the return value | function by value | O(1) | O(1) | `N > 46340` overflows a 32-bit `int` even though the code compiles |

## Conditionals

| # | Folder | Core idea | Pattern | Time | Space | Key trap |
|---|--------|-----------|---------|------|-------|----------|
| 03 | [03-even-odd-if-else](./03-even-odd-if-else/) | Parity is the remainder modulo 2 being zero | if/else dispatch | O(1) | O(1) | Prints the sentence `N is even.`, not `EVEN`/`odd`; test `== 0`, never `== 1`, because `-3 % 2 == -1` |
| 04 | [04-greater-number](./04-greater-number/) | One comparison, and the negation is the other case | if/else with tie in `else` | O(1) | O(1) | Ties are silently correct here; negatives need no special case |
| 06 | [06-Maximum-of-three](./06-Maximum-of-three/) | Compare the first two candidates, then the winner against the third | if/else-if ladder | O(1) | O(1) | With `5 5 1` both strict `>` tests fail and the `else` prints `1`; ties break the ladder |
| 07 | [07-the-middle-number](./07-the-middle-number/) | The median is the value that lies strictly between the other two | six interval tests | O(1) | O(1) | Correct only for three distinct values; `3 3 5` falls through to `else` and prints `5` |

## Loops and accumulation

| # | Folder | Core idea | Pattern | Time | Space | Key trap |
|---|--------|-----------|---------|------|-------|----------|
| 10 | [10-sum-challenge](./10-sum-challenge/) | Add every integer from 0 to `N`, inclusive | accumulator loop | O(N) | O(1) | `<=` vs `<` decides whether `N` is counted; large `N` overflows `int` |
| 11 | [11-factorial](./11-factorial/) | Multiply 1..N starting from the multiplicative identity 1 | product accumulator | O(N) | O(1) | `0!` must print `1` (empty loop leaves the seed); `13!` already exceeds `int` |
| 12 | [12-Sum-of-n-factorials](./12-Sum-of-n-factorials/) | Reuse the previous factorial instead of recomputing it | running product plus sum | O(N) | O(1) | Recomputing `i!` inside the loop turns O(N) into O(N^2); overflow comes early |
| 13 | [13-sum-of-even-numbers](./13-sum-of-even-numbers/) | Step by 2 from 2 so only even values are touched | stride loop | O(N/2) | O(1) | The guard `i <= N` handles odd `N`; do not tweak it to `i < N` |
| 14 | [14-number-of-even-numbers](./14-number-of-even-numbers/) | Count integers `i <= N` with `i % 2 == 0` | counting loop | O(N) | O(1) | The answer is exactly `N / 2`; the loop is pedagogically useful but not needed |
| 22 | [22-sum-of-odd-numbers](./22-sum-of-odd-numbers/) | Skip even values with `continue` | filtered summation | O(N) | O(1) | `continue` in a `for` still runs the increment; the sum is `ceil(N/2)^2` |
| 24 | [24-number-triangle](./24-number-triangle/) | Row `i` prints `1..N-i+1` with no separators | nested loops, output shape | O(N^2) | O(1) | Inner bound must be `N - i + 1`; one digit per column, no spaces |
| 25 | [25-num-from-1-to-n-usingdowhile](./25-num-from-1-to-n-usingdowhile/) | Show that `do-while` guarantees one iteration | body-at-least-once loop | O(N) | O(1) | `N = 0` still prints `1`; the `if (N == 0) i = 0;` patch is a symptom, not a fix |

## Digit manipulation

| # | Folder | Core idea | Pattern | Time | Space | Key trap |
|---|--------|-----------|---------|------|-------|----------|
| 09 | [09-Digit-Extractor](./09-Digit-Extractor/) | The last `K` digits of `N` are `N % 10^K` | modular mask | O(1) | O(1) | `K` is read and ignored; the mask is hard-coded to 1000, and `10^K` overflows for `K >= 10` |
| 15 | [15-total-digits-in-number](./15-total-digits-in-number/) | Count how many divisions by 10 are needed to reach 0 | digit-count loop | O(d) | O(1) | `N = 0` prints `0` but has one digit; negative input never enters the loop |
| 16 | [16-sum-of-digits-of-a-number](./16-sum-of-digits-of-a-number/) | Peel `N % 10`, add it, then `N /= 10` | extract-and-accumulate | O(d) | O(1) | Negative input sums to `0` because the loop body never runs |
| 17 | [17-product-of-digit-of-a-number](./17-product-of-digit-of-a-number/) | Same peel, but accumulate with `*=` seeded at 1 | extract-and-accumulate | O(d) | O(1) | `N = 0` prints `1` (empty product) instead of `0`; `9^10` exceeds `int` |
| 18 | [18-reverse-number](./18-reverse-number/) | Build the reverse with `rev = rev * 10 + digit` and compare | reverse accumulator | O(d) | O(1) | Despite the folder name it prints `YES`/`NO`; a 10-digit reverse can overflow |
| 19 | [19-largest-digit-in-a-number](./19-largest-digit-in-a-number/) | Keep a running maximum over the peeled digits | sentinel scan | O(d) | O(1) | Sentinel `0` is safe only because every digit is >= 0 |
| 20 | [20-smallest-digit-in-a-number](./20-smallest-digit-in-a-number/) | Keep a running minimum, seeded with 9 | sentinel scan | O(d) | O(1) | `N = 0` prints `9`; seeding with 0 would make every answer 0 |
| 21 | [21-occurence-of-digits-in-a-number](./21-occurence-of-digits-in-a-number/) | Set a flag if any digit equals 0 | flag / early exit | O(d) | O(1) | The active code answers "contains 0", not "count digit D"; a commented block holds the counting version |
| 26 | [26-sum-of-digits](./26-sum-of-digits/) | Digit sum with a `do-while`, so `0` is processed once | body-at-least-once loop | O(d) | O(1) | Works for `0`, fails for negatives (digit is negative, sum is negative) |
| 27 | [27-count-even-digits](./27-count-even-digits/) | Increment a counter when the digit is even | filtered counting | O(d) | O(1) | Digit `0` is even and must be counted; `N = 0` counts one even digit |
| 28 | [28-reverse-a-number](./28-reverse-a-number/) | Reverse accumulator, printed directly | reverse accumulator | O(d) | O(1) | Trailing zeros vanish (`1200` -> `21`); large reverses overflow |
| 29 | [29-palindrome-number](./29-palindrome-number/) | A palindrome equals its own reverse | reverse then compare | O(d) | O(1) | Reversing `1000000009` overflows before the comparison happens |
| 30 | [30-sum-of-digits-until-a-single-digit](./30-sum-of-digits-until-a-single-digit/) | Repeat the digit sum while the value has two or more digits | repeated folding | O(d * log N) | O(1) | `0` must print `0`, which is why the guard is `N >= 10`; closed form `1 + (N-1) % 9` fails on 0 |

## Arrays

| # | Folder | Core idea | Pattern | Time | Space | Key trap |
|---|--------|-----------|---------|------|-------|----------|
| 37 | [37-sum-of-array-elemts](./37-sum-of-array-elemts/) | Read `N` values into an array, then sum them | array traversal | O(N) | O(N) | Capacity is 100; `N > 100` writes out of bounds and the sum itself can overflow |
| 38 | [38-max-min-arr](./38-max-min-arr/) | Seed both extremes with `arr[0]` and scan from index 1 | running extremes | O(N) | O(N) | Seeding with `0` breaks all-negative arrays; `N = 0` would read an uninitialised `arr[0]` |

## Functions and references

| # | Folder | Core idea | Pattern | Time | Space | Key trap |
|---|--------|-----------|---------|------|-------|----------|
| 31 | [31-print-to-N](./31-print-to-N/) | Move the printing loop into `void printNumbers(int)` | function decomposition | O(N) | O(1) | Prints a trailing space after the last value; `N = 0` prints nothing |
| 33 | [33-number-analyzer-challenge-1](./33-number-analyzer-challenge-1/) | `square` takes a copy, `doubleNumber` mutates through `int&` | by-value vs by-reference | O(1) | O(1) | Call order matters: save `square(N)` before doubling, or the answer becomes `4N^2` |
| 34 | [34-the-maximum-finder](./34-the-maximum-finder/) | Return the larger value, then swap both arguments in place | references as output | O(1) | O(1) | A swap written without `&` compiles and changes nothing the caller can see |
| 35 | [35-number-toolkit](./35-number-toolkit/) | Even/odd, digit sum, absolute value - each in its own function | mixed value and reference | O(d) | O(1) | `sumDigits` takes a copy, so `N` is still negative until `makePositive`; negating `INT_MIN` overflows |
| 36 | [36-number-classiffier](./36-number-classiffier/) | Count how many composite predicates are true | boolean composition | O(1) | O(1) | `isValid` fuses "positive and even" into one property, so the maximum count is 2, not 3 |

## Number theory

| # | Folder | Core idea | Pattern | Time | Space | Key trap |
|---|--------|-----------|---------|------|-------|----------|
| 05 | [05-divisibility-test](./05-divisibility-test/) | `K` divides `N` exactly when `N % K == 0` | modulo predicate | O(1) | O(1) | `K = 0` is undefined behaviour; `long long` is used so large `N` is safe |
| 23 | [23-sum-of-multiples](./23-sum-of-multiples/) | Walk only the multiples `K, 2K, ...` up to `N` | stride loop / AP | O(N/K) | O(1) | `K = 0` loops forever; `K > N` must yield `0`, not an error |

## Pattern to problems

| Pattern | Problems |
|---------|----------|
| read-compute-print | 01, 02, 32 |
| modular mask `% 10^k` | 02, 09 |
| if/else dispatch | 03, 04, 05, 06, 07 |
| ordering and median | 06, 07 |
| swap | 08, 34 |
| sum accumulator | 10, 13, 22, 23, 37 |
| product accumulator | 11, 12, 17 |
| counting loop | 14, 15, 27, 36 |
| stride step | 13, 23 |
| nested loops / output shape | 24 |
| body-at-least-once `do-while` | 25, 26, 27, 28, 29 |
| digit extraction `N % 10`, `N /= 10` | 09, 15, 16, 17, 18, 19, 20, 21, 26, 27, 28, 29, 30 |
| sentinel scan (max/min) | 19, 20, 34, 38 |
| reverse accumulator | 18, 28, 29 |
| repeated folding | 30 |
| flag / early exit | 21 |
| function decomposition | 31, 32, 33, 34, 35, 36 |
| pass by reference | 33, 34, 35 |
| array traversal | 37, 38 |
| running extremes | 34, 38 |
| arithmetic progression | 10, 13, 22, 23 |

## Suggested study order

1. Output and arithmetic: 01, 02, 32.
2. Branching: 03, 04, 06, 08, 05, 07. The pair 06/07 is where tie handling
   first appears; re-read `notes.md` there before moving on.
3. Straight loops: 10, 13, 14, 22, 25, 24.
4. Products and mixed accumulation: 11, 12, 23.
5. Digit extraction, which is the backbone of everything after it:
   15, 16, 26, 09, 17, 19, 20.
6. Digit aggregation: 27, 21, 28, 18, 29, 30.
7. Arrays: 37, 38.
8. Functions and references: 31, 33, 34, 35, 36.

Problems 18 and 29 are the same algorithm written with `while` and `do-while`;
solving them back to back makes the body-at-least-once difference obvious.
Problem 30 is the first problem whose loop bound is a value, not a counter,
which is the habit ZCO problems reward.
