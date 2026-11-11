# ZCO Logic Guide

Contest-grade companion to [`./README.md`](./README.md). Four practice solutions are dissected here: primality and divisor structure, decimal digit invariants, and a maximisation over a candidate set. Each section stands alone and every claim can be checked by hand on a small example.

Nothing here is an official ZCO statement. Treat the tasks as reconstructed practice; the reasoning is what transfers. Budget assumed throughout: about `10^8` simple operations per second, `int` is 32-bit signed, `long long` is 64-bit signed, and signed overflow is undefined behaviour.

---

## 1. Number theory

### 1.1 Primality

A prime is an integer `n > 1` whose only positive divisors are `1` and `n`. Everything else in this subsection follows from that sentence.

| Input | Prime? | Why |
|-------|--------|-----|
| `n <= 0` | no | not integers greater than 1; `0` has every integer as a divisor |
| `1` | no | exactly one divisor, not two |
| `2` | yes | the only even prime; divides only `1` and `2` |
| `3` | yes | trial division by 2 fails |
| `4` | no | `2` divides it |
| `9` | no | `3` divides it |

The naive loop `for (i = 2; i < n; i++) if (n % i == 0) return false;` is correct but `O(n)`. The `sqrt` bound is the first real optimisation:

> If `n = a * b` with `1 < a <= b < n`, then `a <= sqrt(n)`.

Proof: `a <= b` implies `a * a <= a * b = n`, so `a <= sqrt(n)`. A composite `n` therefore always has a factor at or below `sqrt(n)`, and testing `2 <= i <= sqrt(n)` finds it; if no such factor exists, `n` is prime.

```cpp
bool isPrime(long long n) {
    if (n < 2) return false;              // 0, 1, negatives
    if (n % 2 == 0) return n == 2;        // even shortcut
    for (long long i = 3; i <= n / i; i += 2) {
        if (n % i == 0) return false;     // early exit
    }
    return true;
}
```

- `i <= n / i` rather than `i * i <= n`: the two bounds are identical mathematically, but `i * i` overflows once `i > 46340` on 32-bit `int` and can wrap negative, making the loop condition permanently true.
- The even shortcut halves the work and, more importantly, makes `n == 2` explicit; without it `n % 2 == 0` would reject the only even prime.
- Early exit matters for composites with small factors: `10^9 + 7` is prime and costs the full `sqrt`, while `10^9` exits on the first test.
- `6k +- 1` wheel factorisation halves the loop again (test 2, 3, then `6k-1` and `6k+1`); it is a constant-factor win, not an asymptotic one.

| Method | Time | Use when |
|--------|------|----------|
| `i < n` | O(n) | never, except as a first draft |
| `i <= sqrt(n)` | O(sqrt n) | single query, `n` up to `10^12` |
| `6k +- 1` wheel | O(sqrt n), smaller constant | single query, tight limit |
| sieve of Eratosthenes | O(n log log n) once, O(1) lookup | many queries over one bounded range |
| Miller-Rabin | O(log^3 n) | `n` beyond 64 bits, not needed here |

### 1.2 Counting divisors by sqrt pairing

Divisors come in pairs `(d, n / d)`. If `d <= sqrt(n)` then `n / d >= sqrt(n)`, so every divisor is below the square root, above it, or is the square root itself. One `O(sqrt n)` scan therefore suffices:

```cpp
int countDivisors(long long n) {
    if (n <= 0) return 0;
    int cnt = 0;
    for (long long i = 1; i <= n / i; i++) {
        if (n % i == 0) {
            cnt += (i == n / i) ? 1 : 2;   // perfect square counted once
        }
    }
    return cnt;
}
```

Worked example, `n = 36`. The square root is 6 and `i` runs 1 through 6:

| i | divides 36? | pair | running count |
|---|-------------|------|---------------|
| 1 | yes | (1, 36) | 2 |
| 2 | yes | (2, 18) | 4 |
| 3 | yes | (3, 12) | 6 |
| 4 | yes | (4, 9) | 8 |
| 5 | no | - | 8 |
| 6 | yes | (6, 6) | 9 |

The last pair is the perfect square, so it contributes 1 and the answer is 9. Failing to halve that pair is the most common divisor-count bug: `36` would be reported as 10. The naive `for (i = 1; i <= n; i++)` version in `01-number-analysis` returns the same values in `O(n)`, and returns 0 for `n = 0`, consistent with "no positive divisor divides 0".

Check values for testing: `tau(1) = 1`, `tau(2) = 2`, `tau(12) = 6`, `tau(16) = 5`, `tau(36) = 9`, `tau(97) = 2`, `tau(100) = 9`. A number is prime exactly when `tau(n) = 2`.

### 1.3 Perfect numbers

`n` is perfect when the sum of its *proper* divisors (all divisors except `n`) equals `n`:

```text
6   = 1 + 2 + 3
28  = 1 + 2 + 4 + 7 + 14
496 = 1 + 2 + 4 + 8 + 16 + 31 + 62 + 124 + 248
```

Let `sigma(n)` be the sum of *all* divisors, including `n`. Then `properSum(n) = sigma(n) - n`, so `n` is perfect exactly when `sigma(n) - n = n`, i.e. `sigma(n) = 2n`. That is what `isPerfect` computes: it sums every `i` in `1..n` that divides `n` (giving `sigma(n)`) and tests `sum - n == n`. The subtraction is correct but fragile to read; `sum == 2 * n` states the same thing with fewer ways to be off by one.

Faster version, using the sqrt pairing plus an early exit:

```cpp
bool isPerfect(long long n) {
    if (n < 2) return false;
    long long sum = 1;                   // 1 is always a proper divisor
    for (long long i = 2; i <= n / i; i++) {
        if (n % i == 0) {
            sum += i;
            if (i != n / i) sum += n / i;
        }
        if (sum > n) return false;       // cannot recover: sum only grows
    }
    return sum == n;
}
```

The early exit is valid because every term added is positive, so once `sum > n` the equality can never be restored. Non-perfect numbers usually exit long before `sqrt(n)`, which is why perfect checks are cheaper in practice than the worst case suggests.

Boundaries: `0` and `1` are not perfect (`1` has no proper divisors, sum 0); `6` is the smallest. Known perfect numbers are `6, 28, 496, 8128, 33550336, 8589869056, ...`; all known ones are even and no odd perfect number is known, so "skip odd candidates" is legitimate but not a proof.

### 1.4 Complexity budgeting

| Task | Naive | Better | At `n = 10^9` |
|------|-------|--------|----------------|
| primality | O(n) | O(sqrt n) | `3.2 * 10^4` vs `10^9` |
| divisor count | O(n) | O(sqrt n) | same ratio |
| perfect check | O(n) | O(sqrt n) with early exit | same ratio |
| `Q` queries | O(Q n) | sieve O(n log log n) + O(1) each | sieve wins for `Q >~ 100` |

Rules that keep the budget honest:

- `O(n)` at `n = 10^6` is fine for a single query; at `n = 10^9` it is roughly ten seconds, which is a timeout.
- Constant factors matter when the body has a modulo: `10^8` modulos is already near a second on slow judges.
- With `T` test cases the cost is `T` times the per-query cost; read `T`'s bound before choosing an algorithm.
- All four solutions here are `O(n)` or `O(sqrt n)` per query; none needs a sieve, and adding one would be over-engineering.

---

## 2. Digit manipulation

### 2.1 The extraction invariant

For any integer `n > 0` there are unique `q >= 0` and `r` in `[0, 9]` with

```text
n = 10 * q + r,   r = n % 10,   q = n / 10
```

`r` is the last digit and `q` is the number with that digit removed. The pair `(r, q)` loses nothing, since `10 * q + r` reconstructs `n`. This is the basis of all digit work: every algorithm below is a fold over the sequence `r_0, r_1, ..., r_{d-1}` produced by applying the identity repeatedly.

The sequence arrives least-significant digit first. That explains two facts that otherwise look like tricks:

- Building a reverse is easy, because `rev = rev * 10 + r` appends each new digit at the low end and therefore reverses the order.
- Building the number left-to-right is hard, requiring either a string or a precomputed power of ten.

Loop shape:

```cpp
while (n > 0) {
    int d = n % 10;
    // use d
    n /= 10;
}
```

`n == 0` runs the body zero times; `do { ... } while (n > 0);` runs it once, which is why the `do-while` versions answer `0` correctly for digit sum and digit count.

### 2.2 The families

| Task | Update | Seed | Notes |
|------|--------|------|-------|
| digit sum | `s += d` | 0 | `0` -> 0, correct |
| digit product | `p *= d` | 1 | `0` -> 1 (wrong, should be 0); any 0 digit gives 0 |
| digit count | `c++` | 0 | `0` -> 0 (wrong, should be 1) |
| largest digit | `if (d > best) best = d` | 0 | safe because digits are `>= 0` |
| smallest digit | `if (d < best) best = d` | 9 | seed 0 would answer 0 always |
| count of digit `D` | `if (d == D) c++` | 0 | `n = 0`, `D = 0` needs the body to run |
| contains digit `D` | `if (d == D) ok = true` | false | may `break` early |
| count of even digits | `if (d % 2 == 0) c++` | 0 | 0 is even |
| reverse | `rev = rev * 10 + d` | 0 | trailing zeros vanish |
| palindrome | reverse, then compare | - | compare against the saved original |

Digit count also has a closed form, `d = floor(log10(n)) + 1` for `n > 0`. It is `O(1)` but floating point is exact only to about `2^53`, so the loop is safer and just as fast for 32-bit inputs.

### 2.3 Reverse and palindrome

```cpp
long long rev = 0;
long long m = n;
while (m > 0) { rev = rev * 10 + m % 10; m /= 10; }
bool palindrome = (rev == n);
```

Invariant: after `k` iterations `rev` is the reverse of the `k` digits peeled so far and `m` is the unpeeled prefix. At termination `m == 0`, so `rev` is the full reversal.

Traps, ordered by how often they bite:

1. **Leading zeros disappear.** `1200` reverses to `21`, not `0021`. If the statement asks for the reversed *string*, use `std::string` and `std::reverse`; as a number, `21` is the only sensible answer.
2. **Zero is a palindrome.** The loop runs zero times and `rev == n` holds, so the answer is correct by construction.
3. **Trailing zeros are not palindromic.** `1200 != 21` answers false, while `1001` answers true.
4. **Overflow of the reversed value.** A 10-digit input can reverse past `INT_MAX` (`1000000009` -> `9000000001`). Signed overflow is undefined behaviour, so the later comparison is meaningless. Detect it in advance: `if (rev > (INT_MAX - d) / 10) return false;`, or keep `rev` in `long long`, or compare as strings.
5. **Negative input.** `-121 > 0` is false, so the loop never runs and the reverse is 0. Normalise with `abs` first (note `abs(INT_MIN)` is not representable), or read as a string and handle the sign separately.
6. **Comparing against the mutated copy.** Save `original = n` before the loop; comparing `rev` to `n` afterwards compares against 0 and always answers false.

### 2.4 Digital root

Repeated digit sums until one digit remains. Each fold maps a `d`-digit number to at most `9d`, so two folds bring any 32-bit input below 100 and the process ends within three folds: effectively constant time.

The closed form is `1 + (n - 1) % 9` for `n > 0`, and it fails exactly at `n = 0`, where it yields 1 while the answer is 0. Either special-case zero or keep the loop. For negative input the loop never starts and the "answer" is the input, so normalise first.

---

## 3. Maximum revenue

### 3.1 The task

Given `N` budgets `b_1..b_N`, choose one ticket price `p >= 0`. Every buyer with `b_i >= p` buys one ticket, so revenue is `p * count(b_i >= p)`. Maximise revenue.

The decision variable is a price, not a subset, so the search space looks continuous. The first observation collapses it to `N` candidates.

### 3.2 Why the optimum is an existing budget

Claim: some optimal price equals one of the `b_i`.

Proof. Let `p` be optimal with `c = count(b_i >= p) > 0`; if `c = 0` revenue is 0 and any price equal to `max b_i` does at least as well. Suppose `p` is not equal to any `b_i` and let `q = min { b_i : b_i >= p }`, which exists because `c > 0`. By definition of `q` there is no budget in `[p, q)`, so `count(b_i >= q) = count(b_i >= p) = c`; and `q > p` gives `q * c > p * c`, contradicting optimality. Hence `p` is one of the budgets. QED.

The price must also be positive to earn anything; if all budgets are `<= 0` the maximum is 0, which a `max_revenue = 0` seed already returns.

### 3.3 Brute force, `O(N^2)`

For each candidate `p = b_i`, scan all `N` budgets to count those `>= p`, multiply, keep the maximum. That is the current `04-max-revenue`:

```cpp
for (int i = 0; i < N; i++) {
    int customers = 0;
    for (int j = 0; j < N; j++)
        if (arr[j] >= arr[i]) customers++;
    long long revenue = (long long)customers * arr[i];
    if (revenue > max_revenue) max_revenue = revenue;
}
```

Correctness follows from the claim: the optimum is among the `arr[i]` and every candidate is evaluated. Cost is `N^2` comparisons, acceptable for `N <= 5000` and a timeout at `N = 10^5`. Two defects deserve naming: `revenue` is `int` in the file (`N * price` reaches `10^14`), and `arr` is fixed at 100 elements.

### 3.4 Sorting plus suffix count, `O(N log N)`

Sort ascending. At index `i` the price `arr[i]` is affordable by every buyer at or after `i` and by nobody before it, so `customers = N - i`:

```cpp
sort(a, a + N);
long long best = 0;
for (int i = 0; i < N; i++) {
    long long revenue = (long long)a[i] * (N - i);
    if (revenue > best) best = revenue;
}
```

The suffix count is the whole point of sorting: the count becomes an index difference, `O(1)` instead of `O(N)`. Total cost is dominated by the sort. Duplicates are harmless: if `a[i] == a[i-1]` then `N - i < N - (i-1)`, so the later duplicate yields strictly less revenue and cannot change the maximum.

### 3.5 Ties

Equal revenue at two prices is common: `[3, 5]` gives 6 either way (`2*3` and `1*5`). If only the maximum revenue is required, ties need no handling because the printed number is identical. If the price is also required, take the tie rule from the statement; the usual one is the smallest price, and a strict `>` comparison over ascending candidates returns exactly that, since the first maximum encountered is the smallest price attaining it. Using `>=` would silently switch to the largest price.

### 3.6 Types and dry run

`N` up to `10^5` and prices up to `10^9` give revenue up to `10^14`, which fits `long long` and overflows `int` by five orders of magnitude. Multiply as `(long long)price * customers`, never `price * customers` followed by a cast.

Dry run on budgets `[3, 5, 9, 10]`:

| Price | Buyers | Revenue |
|-------|--------|---------|
| 3 | 4 | 12 |
| 5 | 3 | 15 |
| 9 | 2 | 18 |
| 10 | 1 | 10 |

Both versions return 18 at price 9. The `O(N^2)` code visits candidates in input order and the sorted code in ascending order; both see the same candidate set, which is the point of section 3.2.

---

## 4. Correctness of the four solutions

### 4.1 `01-number-analysis`

Structure: `isPrime(n)` trial-divides `2..n-1`; `countDivisiors(n)` counts divisors in `1..n`; `isPerfect(n)` sums divisors in `1..n` and tests `sum - n == n`. `main` prints `isPrime`, then the divisor count, then the truthiness of the divisor count.

Correct parts. `countDivisiors` increments on `n % i == 0` for `i = 1..n`, which is `sigma_0(n)` by definition; for `n = 0` it returns 0, which is defensible. `isPerfect` sums all divisors and checks `sigma(n) - n == n`, i.e. `sigma(n) = 2n`, which is mathematically correct but `O(n)`; at `n = 0` its loop is empty and it returns `true` vacuously.

Defects:

1. `isPrime` has no `n < 2` guard, so `0` and `1` return `true` because the loop body never runs - the empty-universal-quantifier bug: "no divisor found in an empty range" is vacuously true.
2. The third output field calls `countDivisiors`, not `isPerfect`. The count is `>= 1` for every `n >= 1`, so the program prints `true` for every positive input; `isPerfect` is defined and never called.
3. Both loops are `O(n)` where `O(sqrt n)` is available.

| `N` | printed | correct? |
|-----|---------|----------|
| 0 | `true 0 false` | no - 0 is not prime |
| 1 | `true 1 true` | no - neither prime nor perfect |
| 2 | `true 2 true` | prime and count right; perfect wrong |
| 6 | `false 4 true` | right by accident (6 is perfect) |
| 12 | `false 6 true` | no - 12 is not perfect |
| 28 | `false 6 true` | right by accident (28 is perfect) |

The two "right by accident" rows are the dangerous ones: a bug that agrees with the correct answer on the sample survives a casual test. Fix: guard `isPrime` with `if (n < 2) return false;` and print `isPerfect(N) ? "true" : "false"`.

### 4.2 `02-digit-analysis`

Three helpers, each a single peel loop, each called with the same `N` by value, so no helper contaminates another.

- `sumDigits`: invariant "after `k` peeled digits, `sum` is their sum and `n` is the prefix". Terminates with `n == 0`, so `sum` is the digit sum. Correct for `n >= 0`; for `n <= 0` the loop is skipped and 0 is returned.
- `reverseNumber`: invariant "`rev` is the reverse of the peeled suffix". Correct for `n >= 0`, with the trailing-zero and overflow caveats of 2.3.
- `isPalindrome`: saves `original`, reverses a local copy, compares. Correct.
- The `for (int i = 1; n > 0; i++)` counter is unused; a `while` states the same thing without a phantom variable.

| `N` | sum | rev | palindrome |
|-----|-----|-----|------------|
| 1221 | 6 | 1221 | true |
| 1200 | 3 | 21 | false |
| 7 | 7 | 7 | true |
| 0 | 0 | 0 | true |
| 10 | 1 | 1 | false |

All five are correct. The failure modes are outside the intended domain: negative input (all three loops skipped) and 10-digit reverses (overflow).

### 4.3 `03-number-analysis-functions`

Same three computations as 01, packaged as `analyzeNumber`, with one important difference: `isPrime` begins with `if (n < 2) return false;`, so 0 and 1 are handled. `countDivisors` and `isPerfect` are the unchanged `O(n)` versions.

Values are correct for `n >= 1`. At `n = 0` the divisor loop is empty, so `isPerfect(0)` returns `true` vacuously, which is wrong; the guard `if (n < 2) return false;` belongs there too. Otherwise the problem is presentation, because the labels `Prime: `, `Divisors: `, `Perfect: ` are part of the output. A strict judge rejects them even though every number is right. Complexity is `O(n)` three times over (`3n` operations per query), fine for `n <= 10^6` and not for `10^9`.

| `N` | output |
|-----|--------|
| 1 | `Prime: false` / `Divisors: 1` / `Perfect: false` |
| 2 | `Prime: true` / `Divisors: 2` / `Perfect: false` |
| 6 | `Prime: false` / `Divisors: 4` / `Perfect: true` |
| 28 | `Prime: false` / `Divisors: 6` / `Perfect: true` |

### 4.4 `04-max-revenue`

Structure: read `N` budgets, then for each `i` count budgets `>= arr[i]` and track the maximum of `count * arr[i]`.

Correctness: by the candidate claim (3.2) the optimal price is one of the budgets; the outer loop enumerates all of them; the inner loop computes the exact buyer count for that price; the running maximum therefore equals the optimum. `max_revenue` is seeded at 0, correct whenever some price yields non-negative revenue, which holds for non-negative budgets.

| Budgets | candidate revenues | output |
|---------|--------------------|--------|
| `[10, 20, 30]` | 30, 40, 30 | 40 |
| `[5, 5, 5]` | 15, 15, 15 | 15 |
| `[1, 2, 3, 4, 5]` | 5, 8, 9, 8, 5 | 9 |
| `[7]` | 7 | 7 |
| `[]` (`N = 0`) | none | 0 |

Weaknesses: `int` revenue (overflow above about `2.1 * 10^9`), a 100-element array, `O(N^2)` time, and no handling of the "print the price too" variant. The version that scales is 3.4.

---

## 5. Judge discipline

A program is correct only if its bytes match what the judge expects.

| Rule | Bad | Good |
|------|-----|------|
| No prompts | `cout << "Enter N: ";` | nothing before `cin` |
| No labels | `Prime: true` | `true` |
| Exact tokens | `YES` when `true` is required | match the statement's casing |
| Value layout | mixed lines | follow the sample exactly |
| Space between same-line values | `1  2` or `1,2` | `1 2` |
| No trailing space | `1 2 3 ` | `1 2 3` |
| Newline at end | missing | present |
| Integer width | `int` revenue | `long long` revenue |
| No debug output | stray `cout`/`cerr` | removed before submitting |
| Exit status | non-zero | `return 0` |

Details that decide borderline verdicts:

- `true` / `false` are lowercase tokens; `True` and `TRUE` are different strings. `YES`/`NO` is a different convention entirely - read the statement instead of guessing from another problem.
- Most judges tokenise, so extra spaces and newlines are ignored; some compare bytes, so a trailing space or a missing final newline fails. Emitting exactly the sample's shape is always safe.
- `endl` flushes, `'\n'` does not. For large output prefer `'\n'`, and if you call `ios::sync_with_stdio(false)` never mix `cin`/`cout` with `scanf`/`printf`.
- No floating point is needed in these four problems; if a statement wants a real number, print with fixed precision rather than default formatting.
- Compile with warnings: `g++ -std=c++17 -O2 -Wall -Wextra`. Unused variables and sign comparisons are exactly the mistakes this set contains.
- `N = 0` and `N = 1` must not crash. An uninitialised `max` seeded from `arr[0]` with `N = 0` reads garbage; guard it.

---

## 6. Testing strategy

### 6.1 Edge table

Run every row against the compiled binary before trusting a solution.

| Input class | Example | Catches |
|-------------|---------|---------|
| zero | `0` | loop skipped vs body-once; `0` is not prime; empty product |
| one | `1` | primality guard; `1` divisor; `1! = 1` |
| smallest prime | `2` | even shortcut rejecting the only even prime |
| single digit | `7` | digit loops that need at least one iteration |
| power of ten | `100`, `1000` | trailing zeros lost in reversal; digit count off by one |
| perfect square | `16`, `36`, `49` | double-counted square-root divisor |
| perfect number | `6`, `28` | `sigma(n) - n == n` arithmetic |
| non-perfect even | `12`, `20` | third field always `true` in 01 |
| large prime | `999999937`, `1000000007` | full `sqrt` cost, `i * i` overflow |
| largest `int` | `2147483647` | `n + 1`, `n * n`, reversed-value overflow |
| negative | `-7`, `-121` | loops that never run; `INT_MIN` negation |
| all equal budgets | `[5, 5, 5]` | tie handling, duplicate suffix counts |
| one budget | `[7]` | `N = 1` array loops starting at index 1 |
| zero budgets | `N = 0` | uninitialised `arr[0]` |
| max `N` | `10^5` random | time limit, `int` revenue overflow |

Two habits make the table cheap: keep these inputs and their expected outputs in a local file while developing (not committed), and rerun the whole file after any change to a loop bound or a type.

### 6.2 Pre-submit checklist

1. Re-read the output section of the statement: how many lines, what tokens, what case, what order.
2. Remove every prompt, label, and debug print.
3. Check each accumulator's seed: 0 for sums and counts, 1 for products, `a[0]` or an extreme for max/min, 0 for reverses.
4. Check every loop bound against the inclusive/exclusive convention of the statement, and test `N = 0` and `N = 1`.
5. Check every multiplication and running sum for overflow; widen to `long long` before the operation, not after.
6. Confirm array capacity from the constraints, not from the sample.
7. Confirm complexity against the largest constraint, not the sample size.
8. Compile with `-Wall -Wextra` and fix every warning that touches types or unused variables.
9. Run the edge table and the sample; compare byte for byte where possible.
10. Only then submit - and if it fails, reproduce the smallest failing case from the table instead of guessing.
