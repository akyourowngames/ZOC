# Deep Notes

## Core logic
Two independent predicates over one integer, each contributing at most one point. The first
predicate is itself a conjunction (`positive && even`), the second is a divisibility test.
The result is the number of predicates satisfied: `0`, `1`, or `2`.

## Code walkthrough
```cpp
bool isPositive(int n) { return n > 0; }
bool isEven(int n)     { return n % 2 == 0; }
bool isDivisibleBy5(int n) { return n % 5 == 0; }
```
Three one-line predicates. `n > 0` excludes zero, which is the whole reason `0` fails
property 1. `n % 2 == 0` is true for negative evens (`-4 % 2 == 0`) and for zero. `n % 5 == 0`
is true for zero and for negative multiples of five.

```cpp
bool isValid(int n) {
    return isPositive(n) && isEven(n);
}
```
A named composite. `&&` short-circuits, so for `n = 0` or `n = -4` the modulo is never
evaluated. The name is the documentation; readers no longer have to parse two comparisons at
the call site.

```cpp
int countProperties(int n) {
    int counter = 0;
    if (isValid(n)) { counter++; }
    if (isDivisibleBy5(n)) { counter++; }
    return counter;
}
```
`counter` starts at `0` on every call (it is an automatic local, not `static`). The two `if`s
are independent statements; there is no `else`, deliberately. Each `++` adds exactly one, so
the return value is in `[0, 2]`.

```cpp
int main(){
    int N;
    cin >> N;
    cout << countProperties(N);
    return 0;
}
```
One read, one call, one print. `return 0;` is explicit here (optional since C++11).

## Why it works
The two predicates partition the numbers into four classes — neither, first only, second only,
both — and the counter counts which classes the input belongs to, one unit per class. Because
the `if`s are sequential rather than exclusive, the "both" class scores 2. The conjunction in
`isValid` is faithful to the statement's wording: "positive **and** even" is one property worth
one point, so the score is capped at 2 by construction.

## Complexity
Three modulo operations at most (two `% 2` avoided by short-circuiting in many cases), so
`O(1)` time. Four function calls add no measurable cost after inlining. Space is `O(1)`: one
`int` in `main`, one parameter copy, one counter. There is no loop and no recursion.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `10` | `2` | positive, even, divisible by 5 |
| `20` | `2` | same class; proves no `else if` |
| `15` | `1` | divisible by 5 only |
| `4` | `1` | positive and even, not divisible by 5 |
| `7` | `0` | odd and not a multiple of 5 |
| `0` | `1` | even but not positive; divisible by 5 |
| `-10` | `1` | not positive; `-10 % 5 == 0` |
| `-7` | `0` | nothing applies |
| `5` | `1` | positive but odd; divisible by 5 |
| `-2147483648` | `1` | even, not positive, not a multiple of 5 |

Note `-5`: not positive, odd, divisible by 5 → `1`. Note `100`: → `2`.

## Common mistakes
- `else if` between the two checks, so `10` and `20` print `1`.
- Counting the two halves of `isValid` separately, giving a maximum of 3 (this is what the
  commented-out code at the top of the file does).
- Using `if (n % 5)` instead of `if (n % 5 == 0)` — inverted meaning.
- Initialising the counter outside the function (`static int counter` or a global), so repeated
  calls accumulate.
- Assuming `%` is meaningless for negatives and adding an `abs` that silently changes which
  property is being tested.
- Forgetting that zero is a multiple of every number: `0 % 5 == 0`, so zero always earns the
  divisibility point.
- Printing a sentence; the required output is a bare count.

## Variants and follow-ups
- **Three independent properties** (positive, even, divisible by 5): three `if`s, score `0..3`,
  `20` scores 3. The dead code in this file is exactly that version — a useful contrast.
- **Bitmask instead of counting:** `mask |= 1 << 0;` per property, so you can report *which*
  properties hold, not just how many. The same idea scales to feature flags and subsets.
- **`bool` arithmetic:** `return isValid(n) + isDivisibleBy5(n);` — valid because `bool`
  promotes to `int`. Concise, slightly cryptic; good to recognise in other people's code.
- **Generalised divisibility:** replace `5` with a parameter `k`, then answer "count the
  divisors of `N` that are in a given set" — the seed of divisor-counting problems.
- **Predicate table:** store `bool (*fns[])(int)` and loop over them; the first step toward
  rule engines and validation pipelines.

## Key takeaways
- Independent properties need independent `if`s; `else if` encodes exclusivity you did not ask
  for.
- Short-circuit `&&` makes composite predicates both safe and cheap.
- Zero is even and divisible by everything, but not positive — three facts that decide several
  test cases at once.
- Name composite conditions; the identifier carries the requirement.

## Current-code review
The active code agrees with the README: two properties, maximum score 2, output is the bare
count. Two things in the file are worth flagging precisely:

1. **Dead commented-out implementation at the top.** It defines `countProperties` over three
   separate predicates (`isPositive`, `isEven`, `isDivisibleBy5`, each +1), so `20` would score
   **3**, not 2. It is fully commented out, so it does not affect the build, but it is a second
   specification sitting in the same file. Anyone maintaining this should delete it or move it
   to a variant note; as shipped it contradicts the active behaviour if read casually.
2. **Duplicate predicate names risk confusion.** Both the commented block and the active code
   declare `isPositive`, `isEven`, `isDivisibleBy5`, `countProperties`. Only the active copies
   are compiled, so there is no redefinition error, but uncommenting the block *without*
   deleting the active code would produce "redefinition of ..." errors.

No arithmetic, indexing, or output-format bug was found: the printed value is an `int` in
`0..2` with no trailing newline, which the statement tolerates.
