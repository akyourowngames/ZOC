# How to Think About It

## 1. Restate the task
Score the number: one point for being positive *and* even, one point for being divisible by
five. Print the score, which can only be `0`, `1`, or `2`.

The phrase "positive and even" is a single property, not two. That single decision about
grouping changes the maximum score from 3 to 2, so fix it before writing any code.

## 2. Spot the pattern
This is the **count of satisfied predicates**: a set of independent questions, each asked
once, each adding to an accumulator. The anti-pattern to avoid is the `else if` ladder, which
models *mutually exclusive* categories.

| Situation | Correct construct |
| --- | --- |
| categories, only one applies | `if / else if / else` |
| independent properties, several may apply | separate `if`s + counter |
| at least one property applies | `if (a \|\| b)` |

## 3. Derive the algorithm
1. Write the atomic tests, one function each, so each is trivially checkable:
   `isPositive(n)`, `isEven(n)`, `isDivisibleBy5(n)`.
2. Combine the first two into property 1 with `&&`:
   `isValid(n) { return isPositive(n) && isEven(n); }`.
3. `int counter = 0;`
4. `if (isValid(n)) counter++;`
5. `if (isDivisibleBy5(n)) counter++;`
6. `return counter;`

Step 4 and step 5 are deliberately separate statements. Merging them with `else` would make
`20` score 1 instead of 2.

## 4. Dry run
Input `N = 10`.

| Step | Expression | Result | `counter` |
| --- | --- | --- | --- |
| init | `counter = 0` | — | `0` |
| property 1 | `isPositive(10)` → `10 > 0` | `true` | `0` |
| | `isEven(10)` → `10 % 2 == 0` | `true` | `0` |
| | `isValid` → `true && true` | `true` | `1` |
| property 2 | `isDivisibleBy5(10)` → `10 % 5 == 0` | `true` | `2` |
| return | `counter` | `2` | `2` |

Input `N = 0`:

| Step | Expression | Result | `counter` |
| --- | --- | --- | --- |
| property 1 | `0 > 0` | `false` — `&&` short-circuits | `0` |
| property 2 | `0 % 5 == 0` | `true` | `1` |
| return | | `1` | |

Input `N = -10`: property 1 short-circuits on `-10 > 0`; property 2 gives `-10 % 5 == 0`
which is `true`; score `1`.

Input `N = 20`: property 1 `true` (positive and even), property 2 `true`, score `2`. This is
the case that proves the counter design: `else if` would print `1`.

## Progressive hints
1. How many distinct questions are you asking? Two. Then how many `if` statements should add
   points? Two.
2. Can a number satisfy both properties? `10`, `20`, `100` — yes, so the properties are not
   alternatives.
3. Express property 1 as `n > 0 && n % 2 == 0` before naming it, then decide whether a helper
   function or a local `bool` is clearer.
4. Before you trust your parity check, try `0` and a negative even number.

## Traps
- Using `else if`, capping the score at 1.
- Counting positive and even as two properties, so `20` scores 3 in a three-way version and
  the maximum differs from the statement.
- Forgetting that `0` is even but not positive: property 1 must fail, property 2 must pass.
- Testing `n % 5` truthiness rather than `n % 5 == 0` — in C++ any non-zero is true, so
  `if (n % 5)` means "not divisible".
- Normalising `N` to positive before the divisibility test and thereby breaking property 1's
  check (order matters if you mutate).
- Returning the count of *failed* properties by inverting the `if` conditions.
- Printing `Even`/`Odd` or a sentence instead of a bare number.

## Self-check
- Why must the two `if` statements be separate?
- What is the maximum possible score, and which value achieves it?
- For `N = -15`, what is printed, and why does parity not matter?
- Can you rewrite the whole thing as `return isValid(n) + isDivisibleBy5(n);` and explain why
  that is valid C++? (Because `bool` converts to `0`/`1`; it is correct but opinionated.)
