# Problem Logic Reference

This is the single place where the *idea* behind every problem in
[`problems/`](./problems/) is written down, stripped of story. The per-problem
folders hold the statement, hints, notes, and code; this file holds the
transferable reasoning: what the task reduces to, why the short solution is
correct, and which boundary destroys it.

Read a block after you have attempted the problem, not before. The goal is to
be able to reconstruct the block from memory, in one sentence ("it is a digit
peel with a running maximum"), which is exactly how fast solutions are
recognised during a contest.

Notation: `N` is the numeric bound, `d` the number of decimal digits, `K` a
divisor or digit count. `%` is C++ integer remainder, which truncates toward
zero.

## One-glance cheat sheet

| Pattern | Signal in the problem | Typical code shape |
|---------|----------------------|--------------------|
| read-compute-print | "read n, print ..." with no loop | `cin >> n; cout << f(n);` |
| modular mask | last digits, "last K digits", cyclic pattern | `n % 10`, `n % 1000`, `n % (int)pow(10,k)` |
| parity | even/odd, divisible by 2 | `if (n % 2 == 0) ... else ...` |
| comparison ladder | max/min/middle of a fixed small set | `if (a > b && a > c) ... else if ... else ...` |
| swap | "exchange", "swap", "print after swapping" | `t = a; a = b; b = t;` (or `+`/`-` trick) |
| accumulator loop | "sum/product of 1..N", "total" | `for (i = 1; i <= n; i++) acc += i;` |
| running product | factorial, product of digits | `acc = 1; acc *= i;` |
| counting loop | "how many ... satisfy", "count" | `if (cond) ++cnt;` |
| stride loop | "even numbers", "multiples of K" | `for (i = k; i <= n; i += k)` |
| nested loops | grid, triangle, table | `for i; for j; cout << ...;` |
| body-at-least-once | input may be 0, "print at least once" | `do { ... } while (cond);` |
| digit peel | digits, reverse, palindrome, digit sum | `while (n) { d = n % 10; n /= 10; }` |
| sentinel scan | largest/smallest digit or element | `best = seed; if (x > best) best = x;` |
| reverse accumulator | reverse a number, palindrome check | `rev = rev * 10 + d;` |
| repeated folding | digital root, "repeat until one digit" | `while (n >= 10) n = digitSum(n);` |
| flag / early exit | "does it contain", "any", "at least one" | `bool ok = false; ... if (hit) { ok = true; break; }` |
| function decomposition | "write a function that ..." | `int f(int n) { ... }` then call it |
| references | "modify in place", "return two values" | `void f(int &x)` |
| array traversal | "N values", index-based input | `for (i = 0; i < n; i++) cin >> a[i];` |
| running extremes | max and min in one pass | seed from `a[0]`, scan from 1 |

## I/O and arithmetic

#### [01 Basic input and arithmetic](./problems/01-basic-input-and-arithmetic/)
- **Goal** Read two integers and print product, quotient, difference, sum, remainder, in that order.
- **Logic** Five expressions on the same two values; the only decision is operator order, printed top to bottom.
- **Why it works** Each output is a pure function of `a` and `b`, so no state is needed between lines.
- **Complexity** O(1) time, O(1) space.
- **Trap** `b / a` and `b % a` are undefined when `a == 0`; division truncates, so `7 / 2 == 3`.
#### [02 Mid input and arithmetic](./problems/02-mid-input-and-arithmetic/)
- **Goal** Print the last 1, 2 and 3 digits of a number.
- **Logic** `num % 10^k` deletes everything above the k-th digit, so three masks give the three answers.
- **Why it works** `num = q * 10^k + r` with `0 <= r < 10^k`; the remainder is exactly the low k digits.
- **Complexity** O(1) time, O(1) space.
- **Trap** `%` keeps the sign of the dividend, so `-123 % 100 == -23`, not `77`.
#### [08 Swapping values](./problems/08-swapping-values/)
- **Goal** Exchange two integers and print them in the new order.
- **Logic** `a = a + b`, then `b = a - b` recovers the old `a`, then `a = a - b` recovers the old `b`.
- **Why it works** After line 1, `a` holds the sum; both subtractions are exact inverses of the addition.
- **Complexity** O(1) time, O(1) space.
- **Trap** The sum can overflow signed `int` (undefined behaviour); the `temp` swap has no such failure mode.
#### [32 Square of a number](./problems/32-square-of-a-number/)
- **Goal** Print `N * N` through a function.
- **Logic** `int square(int n) { return n * n; }`, called once from `main`.
- **Why it works** The parameter is a copy, so the caller's `N` is untouched; the return value is the whole result.
- **Complexity** O(1) time, O(1) space.
- **Trap** `N = 50000` gives `2500000000 > INT_MAX`; promotion to `long long` must happen before the multiply.

## Conditionals

#### [03 Even or odd](./problems/03-even-odd-if-else/)
- **Goal** Report the parity of `N`.
- **Logic** One predicate, `N % 2 == 0`, with the else branch covering every odd value.
- **Why it works** The remainder is either 0 or +-1, so "not 0" is exactly "odd"; no second test is needed.
- **Complexity** O(1) time, O(1) space.
- **Trap** Testing `== 1` instead of `== 0` misclassifies negative odds (`-3 % 2 == -1`); the current text output is a sentence, not a judge token.
#### [04 Greater number](./problems/04-greater-number/)
- **Goal** Print the larger of `A` and `B`.
- **Logic** Ask whether `A < B`; if so print `B`, otherwise print `A`.
- **Why it works** `<` is a total order, so the two branches partition all inputs, ties included (tie prints `A`, which equals `B`).
- **Complexity** O(1) time, O(1) space.
- **Trap** Writing `A > B` and forgetting the else leaves ties unprinted.
#### [06 Maximum of three](./problems/06-Maximum-of-three/)
- **Goal** Print the largest of three values.
- **Logic** Test `A` against both others, then `B` against both, letting `C` take the remainder.
- **Why it works** For distinct values exactly one candidate beats the other two, so exactly one branch fires.
- **Complexity** O(1) time, O(1) space.
- **Trap** Strict `>` makes tied maxima fall through: `5 5 1` reaches `else` and prints `1`. Use `>=`, or compare pairwise.
#### [07 The middle number](./problems/07-the-middle-number/)
- **Goal** Print the median of three values.
- **Logic** Six strict orderings are collapsed into three tests: `B` is middle, `A` is middle, else `C`.
- **Why it works** Among three distinct numbers the median is the one strictly between the other two, and the four relevant orderings cover it.
- **Complexity** O(1) time, O(1) space.
- **Trap** Duplicates satisfy no strict condition: `3 3 5` prints `5`. A sort of three values is the tie-proof alternative.

## Loops and accumulation

#### [10 Sum challenge](./problems/10-sum-challenge/)
- **Goal** Compute `0 + 1 + ... + N`.
- **Logic** Start `i = 0`, `sum = 0`; while `i <= N`, add `i` and increment.
- **Why it works** Loop invariant: after `i` iterations `sum = 0 + ... + (i-1)`, so on exit `sum` covers `0..N`.
- **Complexity** O(N) time, O(1) space; closed form `N(N+1)/2` is O(1).
- **Trap** `<` instead of `<=` drops `N`; `sum` overflows `int` past `N = 65535` (`N(N+1)/2` grows quadratically).
#### [11 Factorial](./problems/11-factorial/)
- **Goal** Compute `N!`.
- **Logic** Seed `fact = 1`, multiply by `i` for `i = 1..N`.
- **Why it works** The empty product is 1, which is also the definition of `0!`, so the untouched seed is already correct.
- **Complexity** O(N) time, O(1) space.
- **Trap** Seeding with 0 makes every answer 0; `13! = 6227020800` overflows `int`, so use `long long` (and `unsigned long long` beyond 20).
#### [12 Sum of N factorials](./problems/12-Sum-of-n-factorials/)
- **Goal** Compute `1! + 2! + ... + N!`.
- **Logic** Keep the running factorial and add it to a running sum inside the same loop.
- **Why it works** `i! = (i-1)! * i`, so the previous iteration's product is exactly the factor needed now.
- **Complexity** O(N) time, O(1) space; recomputing each factorial would be O(N^2).
- **Trap** Forgetting that `sum` needs its own seed of 0, and overflow at `N = 13`.
#### [13 Sum of even numbers](./problems/13-sum-of-even-numbers/)
- **Goal** Sum all even integers from 2 through `N`.
- **Logic** Iterate `i = 2, 4, 6, ...` with `i += 2` and stop at `i > N`.
- **Why it works** Every visited `i` is even by construction, and every even value <= N is visited exactly once.
- **Complexity** O(N/2) time, O(1) space; closed form `2 * m(m+1)/2` with `m = N/2` is O(1).
- **Trap** Using `i < N` excludes `N` when `N` is even; using a doubled counter and forgetting to scale it back.
#### [14 Number of even numbers](./problems/14-number-of-even-numbers/)
- **Goal** Count even integers in `1..N`.
- **Logic** Loop and increment a counter when `i % 2 == 0`.
- **Why it works** Each even value contributes exactly 1, so the counter equals `floor(N/2)`.
- **Complexity** O(N) time, O(1) space; the answer is literally `N / 2`.
- **Trap** The `else { num = num; }` branch is dead code; counting from 0 or counting `N` twice shifts the answer by one.
#### [22 Sum of odd numbers](./problems/22-sum-of-odd-numbers/)
- **Goal** Sum all odd integers from 1 through `N`.
- **Logic** Loop `1..N` and `continue` on even values, adding the rest.
- **Why it works** `continue` skips only the addition; the `for` increment still runs, so no value is skipped or repeated.
- **Complexity** O(N) time, O(1) space.
- **Trap** The sum of the first `m` odd numbers is `m^2`, so the answer is `ceil(N/2)^2`; using it avoids overflow only if the type is wide enough.
#### [24 Number triangle](./problems/24-number-triangle/)
- **Goal** Print `N` rows; row `i` contains `1..N-i+1` with no separators.
- **Logic** Outer loop over rows, inner loop from 1 to `N-i+1`, printing `j`; newline per row.
- **Why it works** Row length decreases by exactly one per row, so the shape is a left-aligned triangle of `N(N+1)/2` digits.
- **Complexity** O(N^2) time, O(1) space (output-bound).
- **Trap** `N-i` instead of `N-i+1` shifts every row; buffer the output for large `N`.
#### [25 Numbers from 1 to N with do-while](./problems/25-num-from-1-to-n-usingdowhile/)
- **Goal** Print `1..N`, demonstrating a post-test loop.
- **Logic** `do { print i; i++; } while (i <= N);`
- **Why it works** The guard is checked after the body, so the body runs once even when the range is empty.
- **Complexity** O(N) time, O(1) space.
- **Trap** For `N = 0` it prints `1`, which is wrong for the usual statement; the `if (N == 0) i = 0;` patch hides the bug instead of fixing the loop choice.

## Digit manipulation

#### [09 Digit extractor](./problems/09-Digit-Extractor/)
- **Goal** Print the last `K` digits of `N`.
- **Logic** Build `10^K` by repeated multiplication, then print `N % 10^K`.
- **Why it works** A power of ten mask keeps exactly the low `K` digits; `N % 10^K` is that mask.
- **Complexity** O(K) time (O(1) with `pow`), O(1) space.
- **Trap** `K` is read but unused here (mask fixed at 1000); `int` overflow for `K >= 10`; leading zeros of the suffix disappear.
#### [15 Total digits in a number](./problems/15-total-digits-in-number/)
- **Goal** Print how many decimal digits `N` has.
- **Logic** Count iterations of `N /= 10` until `N` becomes 0.
- **Why it works** Each division removes exactly one digit; the count is the smallest `d` with `N < 10^d`.
- **Complexity** O(d) time, O(1) space.
- **Trap** `N = 0` has one digit but the loop reports 0; negative input never enters the loop. `to_string(N).size()` handles both.
#### [16 Sum of digits of a number](./problems/16-sum-of-digits-of-a-number/)
- **Goal** Sum the decimal digits of `N`.
- **Logic** While `N > 0`: add `N % 10`, then `N /= 10`.
- **Why it works** Extraction is lossless: `N = 10q + r` with `r` the last digit, `q` the remaining prefix.
- **Complexity** O(d) time, O(1) space.
- **Trap** The same loop on a negative number does nothing and prints 0; take `abs` first (mind `INT_MIN`).
#### [17 Product of digits](./problems/17-product-of-digit-of-a-number/)
- **Goal** Multiply all decimal digits of `N`.
- **Logic** Peel digits, `product *= digit`, seeded at 1.
- **Why it works** Multiplication is associative and 1 is neutral, so order of digits is irrelevant.
- **Complexity** O(d) time, O(1) space.
- **Trap** Any 0 digit collapses the product to 0 (correct, but surprises); `N = 0` prints 1; `9^10` exceeds `int`.
#### [18 Number palindrome check](./problems/18-reverse-number/)
- **Goal** Print `YES` if `N` equals its digit reversal, else `NO`.
- **Logic** Build `rev = rev * 10 + digit` while peeling, keeping the original for the comparison.
- **Why it works** The accumulator shifts the built number left by one decimal place per digit, which is exactly the reversal.
- **Complexity** O(d) time, O(1) space.
- **Trap** The folder name suggests printing the reverse, but the code prints the verdict; a 10-digit reverse overflows `int` before the comparison.
#### [19 Largest digit](./problems/19-largest-digit-in-a-number/)
- **Goal** Print the maximum decimal digit of `N`.
- **Logic** Scan digits, update `largest` when `digit > largest`, seeded at 0.
- **Why it works** Digits lie in `0..9`, so 0 is a valid lower bound and every real digit can replace it.
- **Complexity** O(d) time, O(1) space.
- **Trap** The seed 0 is only safe for non-negative input; `N = 0` accidentally prints the right answer because the seed equals the digit.
#### [20 Smallest digit](./problems/20-smallest-digit-in-a-number/)
- **Goal** Print the minimum decimal digit of `N`.
- **Logic** Same scan with `digit < smallest`, seeded at 9.
- **Why it works** 9 is an upper bound for any digit, so the first real digit always improves the sentinel.
- **Complexity** O(d) time, O(1) space.
- **Trap** Seeding at 0 makes every answer 0; `N = 0` prints 9 because the loop never runs.
#### [21 Occurrence of digits](./problems/21-occurence-of-digits-in-a-number/)
- **Goal** Current code: does `N` contain the digit 0? The commented block counts occurrences of a digit `D`.
- **Logic** Scan digits, raise a flag on a match, print `YES`/`NO` from the flag.
- **Why it works** A single witness is enough for an existential question, so the flag never needs to be cleared.
- **Complexity** O(d) time, O(1) space.
- **Trap** Name and behaviour disagree; with counting, `N = 0`, `D = 0` must answer 1, but the loop does not run.
#### [26 Sum of digits with do-while](./problems/26-sum-of-digits/)
- **Goal** Digit sum, written with a post-test loop.
- **Logic** Body peels one digit and adds it, then tests `N > 0`.
- **Why it works** The body runs at least once, so `N = 0` contributes its own digit 0 instead of nothing.
- **Complexity** O(d) time, O(1) space.
- **Trap** For negative `N` the digit and the sum are negative (`-5` yields `-5`); the loop also terminates only because division truncates toward zero.
#### [27 Count even digits](./problems/27-count-even-digits/)
- **Goal** Count decimal digits that are even.
- **Logic** Peel each digit and increment when `digit % 2 == 0`.
- **Why it works** 0 is even by definition, so "last digit in {0,2,4,6,8}" is the complete test.
- **Complexity** O(d) time, O(1) space.
- **Trap** Treating 0 as neither even nor odd undercounts; `N = 0` correctly reports 1 because of the `do-while`.
#### [28 Reverse a number](./problems/28-reverse-a-number/)
- **Goal** Print the digits of `N` in reverse order.
- **Logic** `rev = rev * 10 + N % 10` while `N /= 10`.
- **Why it works** Each step appends the peeled digit at the least significant position of `rev`, producing the reversed sequence.
- **Complexity** O(d) time, O(1) space.
- **Trap** Trailing zeros disappear (`1200` -> `21`); reversing near `INT_MAX` overflows. A string reversal preserves leading zeros.
#### [29 Palindrome number](./problems/29-palindrome-number/)
- **Goal** Decide whether `N` reads the same in both directions.
- **Logic** Reverse fully, then compare with the saved original.
- **Why it works** Reversal is an involution, so `N == rev(N)` is exactly the palindrome condition.
- **Complexity** O(d) time, O(1) space.
- **Trap** Comparing against the mutated `N` (now 0) always says `NO`; overflow hits before the check for 10-digit inputs.
#### [30 Digital root](./problems/30-sum-of-digits-until-a-single-digit/)
- **Goal** Repeat the digit sum until one digit remains.
- **Logic** Outer `while (N >= 10)` folds with an inner digit-sum loop, assigning `N = sum`.
- **Why it works** Each fold strictly decreases a multi-digit number, so the process terminates; the guard `>= 10` stops at one digit.
- **Complexity** O(d log N) time (at most a few folds), O(1) space.
- **Trap** The closed form `1 + (N-1) % 9` is undefined for `N = 0`, which must print 0; negative `N` never enters the outer loop.

## Arrays

#### [37 Sum of array elements](./problems/37-sum-of-array-elemts/)
- **Goal** Read `N` values and print their sum.
- **Logic** Fill `arr[0..N-1]`, then traverse and accumulate.
- **Why it works** Summation is associative and commutative, so input order is irrelevant; one pass suffices.
- **Complexity** O(N) time, O(N) space.
- **Trap** Fixed capacity 100 means `N > 100` corrupts memory; the running sum can exceed `int` for large values.
#### [38 Max and min of an array](./problems/38-max-min-arr/)
- **Goal** Print the largest and smallest element.
- **Logic** Seed both extremes with `arr[0]`, then scan from index 1 updating each.
- **Why it works** After processing prefix `0..i`, both extremes are the true extremes of that prefix - an inductive invariant.
- **Complexity** O(N) time, O(N) space.
- **Trap** Seeding with 0 returns 0 for all-negative arrays; `N = 0` reads an uninitialised element.

## Functions and references

#### [31 Print to N](./problems/31-print-to-N/)
- **Goal** Print `1..N` from inside a function.
- **Logic** `void printNumbers(int N)` owns the loop; `main` only reads and delegates.
- **Why it works** The function has no return value and no hidden state, so its whole effect is the printed sequence.
- **Complexity** O(N) time, O(1) space.
- **Trap** A trailing space after the last number fails strict output comparison; `N = 0` prints nothing at all.
#### [33 Number analyzer: square and double](./problems/33-number-analyzer-challenge-1/)
- **Goal** Print `N^2`, then `N` doubled in place.
- **Logic** Compute and store `square(N)`, call `doubleNumber(N)` through `int&`, print both.
- **Why it works** The reference parameter aliases the caller's variable, so the mutation is visible after the call; the saved square keeps the pre-mutation value.
- **Complexity** O(1) time, O(1) space.
- **Trap** Doubling first makes the printed square `4N^2`; removing `&` makes the second print the unchanged `N`.
#### [34 The maximum finder](./problems/34-the-maximum-finder/)
- **Goal** Print the maximum of two values, then print them swapped.
- **Logic** `int maximum(int,int)` returns by value; `void swapNumbers(int&,int&)` swaps via a temp inside the callee.
- **Why it works** References are aliases, not copies, so writes inside the callee land in `main`'s variables.
- **Complexity** O(1) time, O(1) space.
- **Trap** A swap written with value parameters is a no-op that compiles silently; forgetting the second output line.
#### [35 Number toolkit](./problems/35-number-toolkit/)
- **Goal** Print parity, digit sum, and the absolute value of `N`.
- **Logic** Three helpers: `isEven` by value, `sumDigits` that normalises a local copy, `makePositive` through `int&`.
- **Why it works** Each helper is independent, so output order is the only coupling; `sumDigits` copies, hence `N` stays negative until `makePositive`.
- **Complexity** O(d) time, O(1) space.
- **Trap** Calling `makePositive` first changes the parity output (same) but makes the "before" state unobservable; negating `INT_MIN` overflows.
#### [36 Number classifier](./problems/36-number-classiffier/)
- **Goal** Count how many properties hold: (positive and even), divisible by 5.
- **Logic** Two independent predicates, each adding 1 to a counter.
- **Why it works** The properties are tested separately, so the counter is exactly the number of true predicates - no else chain can double count.
- **Complexity** O(1) time, O(1) space.
- **Trap** The commented version counts three properties; `isValid` fuses two into one, changing the range from `0..3` to `0..2`. `counter` must start at 0.

## Number theory

#### [05 Divisibility test](./problems/05-divisibility-test/)
- **Goal** Print `YES` if `K` divides `N`, else `NO`.
- **Logic** Single remainder test, `N % K == 0`.
- **Why it works** By definition `K | N` iff the remainder of `N` by `K` is zero; negative operands are fine because the test is against 0.
- **Complexity** O(1) time, O(1) space.
- **Trap** `K == 0` is undefined behaviour, not "NO"; `N % K` with `N = INT_MIN` and `K = -1` is also UB.
#### [23 Sum of multiples](./problems/23-sum-of-multiples/)
- **Goal** Sum all positive multiples of `K` not exceeding `N`.
- **Logic** Iterate `i = K; i <= N; i += K` and accumulate.
- **Why it works** The stride enumerates exactly the multiples of `K` in increasing order, each once.
- **Complexity** O(N/K) time, O(1) space; closed form `K * m(m+1)/2` with `m = N/K`.
- **Trap** `K = 0` never advances (infinite loop); `K > N` must print 0; the closed form overflows `int` early.

## Cross-cutting ideas

### Reading input safely
- `cin >> x` skips leading whitespace and stops at the first non-numeric character; no prompt text belongs in a judged program.
- Always check that the number of reads matches the statement: `01` reads two values, `23` reads two, `38` reads `N` then `N` values.
- Mixed loops and reads: read `N` first, then loop `N` times; a stray `cin` inside the loop consumes array elements.
- Type width is part of correctness, not style. Products and sums (`01`, `11`, `12`, `23`, `37`, ZCO revenue) want `long long`.
- Uninitialised locals are the classic silent failure: `sum`, `count`, `max`, `rev` must all be seeded explicitly.

### Loop invariants
Every loop in this folder has a one-line invariant worth stating before coding:
- `10`: before checking `i <= N`, `sum = 0 + ... + (i-1)`.
- `11`/`12`: before iteration `i`, `fact = (i-1)!`.
- `13`: before iteration, `sum` holds the evens `< i`.
- `15`: before iteration, `count` digits have been removed.
- `16`: before iteration, the peeled suffix digits sum to `sum`.
- `19`/`20`: after processing a prefix of digits, `best` is the extreme of that prefix.
- `23`: before iteration, `sum` holds the multiples `< i`.
- `28`: before iteration, `rev` is the reverse of the peeled suffix.
- `30`: after each outer iteration, `N` equals the digit sum of the previous `N`.
- `38`: after index `i`, `max`/`min` are the extremes of `a[0..i]`.
A loop whose invariant you cannot state is usually a loop with the wrong bound.

### Digit extraction invariant
For `N > 0`, `N = 10 * q + r` with `r = N % 10` and `q = N / 10`. Therefore the pair
`(r, q)` loses no information: the last digit plus the remaining prefix reconstruct `N`.
Peeling is LSD-first, which is why reverse-building (`rev = rev * 10 + r`) works and
why left-to-right digit algorithms need either a string or a precomputed power of ten.
Consequences: the loop runs `d = floor(log10 N) + 1` times for `N > 0`, zero times for
`N == 0` (`while`) and once for `N == 0` (`do-while`); negative input must be normalised
first, and `INT_MIN` cannot be negated in `int`.

### Accumulation patterns
| Accumulator | Seed | Update | Problems |
|-------------|------|--------|----------|
| sum | 0 | `s += x` | 10, 13, 16, 22, 23, 26, 37 |
| product | 1 | `p *= x` | 11, 12, 17 |
| count | 0 | `c++` when predicate holds | 14, 15, 27, 36 |
| maximum | `-inf` (or `a[0]`, or 0 for digits) | `if (x > best) best = x` | 19, 34, 38 |
| minimum | `+inf` (or `a[0]`, or 9 for digits) | `if (x < best) best = x` | 20, 38 |
| reverse | 0 | `rev = rev * 10 + d` | 18, 28, 29 |
| flag | `false` | `ok = true` on witness | 21 |
Rule of thumb: the seed is the identity of the operation, and the identity of `min` over an
empty set is not 0.

### Conditional ordering
- Branch from the most specific condition to the most general; a general test placed
  first shadows every later branch.
- `06` fails because its tests are strict: after `A > B && A > C` and `B > A && B > C`
  both fail on a tie, the fallback must not assume `C` is the maximum.
- The tie-safe formulations are: pairwise `max(max(a,b),c)`, or non-strict `>=` chains,
  or sort the three values and take index 1 for the median.
- State the tie rule explicitly. If the statement is silent, any consistent answer is
  acceptable, but the code must still print exactly one value.

### Off-by-one boundaries
- `<=` includes the bound, `<` excludes it. `10`, `13`, `22`, `23` all depend on this
  single character; `18`/`29` depend on `while (N > 0)`.
- Counting ranges: `1..N` has `N` values, `0..N` has `N+1`, evens in `1..N` are `N/2`.
- Array loops run `0..N-1`; writing `i <= N` on `arr[N]` is an out-of-bounds write.
- Triangle rows: row `i` (1-based) has length `N-i+1`, total `N(N+1)/2` characters.
- `N = 0` is the boundary that exposes the difference between pre-test and post-test loops.

### Integer overflow
- `int` holds about 2.1e9; `long long` about 9.2e18.
- Squares overflow past 46340 (`32`); factorials past 12 (`11`, `12`); digit sums of long
  inputs are fine, digit products are not past ~10 digits (`17`).
- Sums of `1..N` overflow near `N = 65535` because the value grows quadratically (`10`, `13`, `22`).
- Reverses of 10-digit numbers overflow (`18`, `28`, `29`); the fix is `long long` or a
  string, and for leetcode-style `int` returns an explicit `rev > INT_MAX/10` guard.
- Signed overflow is undefined behaviour, so the compiler may "optimise" the check away;
  do not rely on wrap-around. Unsigned wrap-around is defined but equally wrong here.
- Cast before multiplying: `(long long)a * b`, not `(long long)(a * b)`.

### Output format
- Judged programs print values only: no `"Enter your integer: "` prompts, no `"Answer: "`
  prefixes, no units. Problems `01`, `03`, `35` currently print human text.
- Separate values on one line with a single space, lines with `\n`; avoid a trailing space
  (`31`, `25`) because token-based comparators tolerate it but byte comparators do not.
- Booleans must be lowercase `true`/`false` when the statement says so; `YES`/`NO`,
  `Even`/`Odd` are different tokens and are case sensitive.
- Prefer `'\n'` to `endl`: no flush per line, which matters for `24` and any large output.
- End the output with a newline; some judges ignore it, none require its absence.
