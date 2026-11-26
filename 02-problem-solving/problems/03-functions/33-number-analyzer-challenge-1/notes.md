# Deep Notes

## Core logic
Two independent facts about one number are printed in a fixed order: the square of the
original, then the doubled value. The square is computed by a function that returns a value;
the doubling is done by a function that receives a reference and mutates the caller's
variable. Correctness depends on computing the square first, because the doubling destroys
the original value.

## Code walkthrough
```cpp
int square(int n) {
    return n * n;
}
```
Value parameter, `int` return, no side effects. The product is formed in `int`, so
`|n| <= 46340` is required for defined behaviour.

```cpp
void doubleNumber(int &n) {
    n = n * 2;
}
```
`int &n` binds `n` directly to the caller's object; there is no copy. `n = n * 2` therefore
stores into the caller's `N`. `void` is correct because the result travels through the
parameter, not through a return value.

```cpp
int N, result;
cin >> N;
result = square(N);
doubleNumber(N);
cout << result << " " << N;
```
- Both locals are uninitialized until assigned; `result` is assigned on the next line, so
  only `N` is at risk if the read fails.
- `result = square(N)` snapshots `N * N` — this line must precede the mutation.
- `doubleNumber(N)` passes `N` itself; the `&` in the signature is what makes that legal and
  effective.
- The print reads `result` (a stored copy) and `N` (live). If the statement wanted a newline
  at the end, `<< '\n'` would be appended; the current version has none.

## Why it works
`square` is a pure function: its output depends only on the copied argument, so it cannot be
affected by later changes to `N`. Storing that output in `result` freezes the value.
`doubleNumber` operates on an alias, so the assignment inside the function is an assignment
to `N`; the caller observes it because there is exactly one object, not two.

## Complexity
Constant work: two calls, one multiplication, one multiplication-by-two, one read, one write.
`O(1)` time and `O(1)` space. A reference parameter adds no memory — it is an alias, usually
implemented as a pointer but never observable as a separate object.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `4` | `16 8` | the documented example |
| `0` | `0 0` | both operations fix zero |
| `1` | `1 2` | doubling changes the value, squaring does not |
| `-1` | `1 -2` | square positive, doubling keeps sign |
| `-5` | `25 -10` | negative input path |
| `46340` | `2147395600 92680` | largest square that still fits in `int` |
| `46341` | overflow (UB) | `square` overflows before doubling is reached |
| `1073741824` | UB | doubling would exceed `INT_MAX` even if the square had not already |
| `x` (non-numeric) | UB | extraction fails, `N` unassigned |

## Common mistakes
- Omitting `&`: the program compiles, runs, and prints the original `N` — a silent logic bug.
- Mutating before snapshotting, which changes the first output and leaves the second correct.
- Returning the doubled value *and* using a reference, so it gets doubled twice.
- Assuming `n = n * 2` is the same as `n *= 2` with respect to overflow. It is not: unsigned
  wrap is defined, signed overflow is UB, and `int` is signed here.
- Believing the two limits are equal: `N * N` fails at `46341`, `N + N` only at `1073741824`.
- Adding punctuation such as `16, 8`. Token comparison then fails.

## Variants and follow-ups
- **Both by reference:** `void squareRef(int& n); void doubleNumber(int& n);` — you must then
  snapshot manually, which shows why return values are convenient.
- **Return a pair:** `std::pair<int,int> analyze(int n)` returning `{n*n, n*2}`; no reference,
  no aliasing, and the ordering problem disappears because the original is never mutated.
- **`const int&` parameter:** expresses "read without copying, promise not to modify". Useful
  for large objects; overkill for `int`, but the habit scales to `std::string` and `std::vector`.
- **Pointer version:** `void doubleNumber(int* n) { *n *= 2; }`, called as `doubleNumber(&N);`
  — the same semantics with explicit address-taking.
- **Overflow-aware version:** return `bool` from `doubleNumber` and refuse when
  `n > INT_MAX / 2`, an early appearance of the "report failure through the return value"
  pattern.

## Key takeaways
- A reference parameter is the caller's object, not a copy; `void` + `&` is the idiomatic
  in-place modification.
- Snapshot an input before any step that overwrites it.
- Two operations on the same variable can have different safe domains; the smallest limit
  governs the whole program.
- Printing order encodes meaning: `16 8` and `8 16` are both "square and double" numerically
  but only one is the required answer.
