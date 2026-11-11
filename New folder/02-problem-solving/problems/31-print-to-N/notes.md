# Deep Notes

## Core logic

A counted loop with three independent decisions encoded in the `for` header:

```cpp
for (int i = 1; i <= N; i++)
```

| slot | value | why |
| --- | --- | --- |
| init | `i = 1` | first number in the range |
| test | `i <= N` | includes `N`; false for `N < 1`, giving an empty loop |
| step | `i++` | consecutive integers |

Loop invariant:

> at the top of each iteration, `1 .. i-1` have been printed and `i` is the
> next value to print.

The body prints `i`; `i++` restores the invariant with `i` advanced by one. The
test is exactly "there is still a value left to print". When it fails, either
the range was empty from the start (`N < 1`) or all of it has been printed.

Termination: `i` increases by exactly 1 each iteration and the test bounds it by
`N`, so the loop runs `max(N, 0)` times. The only way it can fail to terminate
is integer overflow of `i`, reachable only if `N == INT_MAX` (see below).

Scope: `i` is declared in the header, so it ceases to exist at the closing
brace. That is a deliberate improvement over `int i;` at the top of the
function — there is no stale counter to misuse afterwards.

## Code walkthrough

```cpp
void printNumbers(int N) {          // by value: N is a private copy
    for (int i = 1; i <= N; i++) {
        cout << i << " ";           // value plus separator
    }
}

int main() {
    int M;
    cin >> M;                       // read the limit
    printNumbers(M);                // delegate the work
    return 0;
}
```

- `void` is correct: the function's purpose is the side effect on `cout`, not a
  returned value. Returning a `string` would be an alternative but allocates.
- `int N` is passed **by value**, so the function cannot alter `main`'s `M`.
  For an `int` this is also cheaper than a reference.
- The parameter is named `N` while the caller's variable is `M`. Both are the
  same number; the rename happens automatically because the value is copied.
  The mismatch is stylistic only, but it makes the call look like a type error
  when skimming.
- `main` returns `0` explicitly here, unlike most files in this folder — both
  are legal.

## Why it works

The loop generates the arithmetic progression `1, 2, 3, ...` and prints each
term while it is `<= N`. A `for` loop with `i <= N` and step `+1` enumerates
exactly the integers in `[1, N]`, which is the definition of the required
output.

The empty-range case is handled structurally: the test precedes the body, so a
false test on the first check means zero iterations and zero output. No guard,
no `if`, no special case — the loop's semantics already say "possibly nothing".

The helper-function split works because printing is a side effect that needs no
knowledge of `main`'s other variables; passing `N` by value is enough. This is
the minimal example of "extract a function to name an operation".

## Complexity

- Time: `N` iterations, each doing a comparison, an increment and a formatted
  write. The loop itself is `O(N)`; the *output* is `O(N log N)` characters,
  since values near `N` have `O(log N)` digits. On real judges, output volume
  dominates: `N = 10^6` emits roughly 7 MB.
- Space: `O(1)` extra — one counter, and the output buffer maintained by the
  stream (a fixed-size internal buffer, not `O(N)`).

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `5` | `1 2 3 4 5` | the stated example |
| `1` | `1` | single iteration |
| `0` | *(empty)* | test fails before the first body execution |
| `-7` | *(empty)* | same as `0`; empty range |
| `2` | `1 2` | endpoint inclusion check |
| `1000000` | `1 ... 1000000` | performance / flushing check |
| `2147483647` | undefined | `i++` overflows after printing `INT_MAX` |

## Common mistakes

- **`i < N`.** Omits the last number. The most common off-by-one in existence.
- **`i = 0`.** Emits a spurious `0` at the front.
- **`i <= N` with `i--`.** Infinite loop.
- **`endl` in the loop.** A flush per number; on large `N` this is orders of
  magnitude slower than `" "`.
- **Missing separator** (`cout << i;`) — output becomes one long numeral.
- **Trailing space / missing newline** — usually tolerated, occasionally a
  presentation error.
- **Recursive re-implementation** (`printNumbers(N-1); cout << N;`) with the
  base case `N == 0` — correct, but recursion depth `N` will overflow the stack
  around `10^5`.
- **`INT_MAX` input.** `i++` when `i == INT_MAX` is signed overflow (UB); in
  practice the test may never fail, producing an endless loop.

## Variants and follow-ups

1. **Descending**: `for (int i = N; i >= 1; i--)` — note `>=`, and `i--` from
   `1` reaches `0` safely.
2. **Step 2**: `for (int i = 1; i <= N; i += 2)` prints odd numbers.
3. **No trailing space**: print the space *before* every number except the
   first, or guard it with `i < N`.
4. **Newline-separated**: `cout << i << "\n";` — the usual competitive format.
5. **Build then print once**: accumulate into a `std::string` and emit a single
   `cout <<` — fewer stream calls, `O(N log N)` memory.
6. **Same task with `while` / `do-while`**: folder `25` shows the `do-while`
   version and why it needs a guard.

## Key takeaways

- `for` encodes the three loop decisions in one line; use it when the count is
  known.
- `for` tests before the body, so empty ranges are free — no guard needed.
- Declare the counter in the header to keep its scope minimal.
- `void f(int)` is the idiomatic shape for a printing routine; by-value passing
  is correct and cheap for scalars.
- Output volume, not loop overhead, is the real cost in "print N things".

## Current-code review

No logic error: for every `N >= 1` the function prints `1 .. N`, and for
`N <= 0` it prints nothing, which matches the statement. The following points
are worth recording.

**1. Output format risks (cosmetic, judge-dependent).**

`cout << i << " "` emits a space after *every* number, including the last, and
the program never emits a newline:

```text
1 2 3 4 5<space><EOF>
```

Token-based checkers accept this. A strict character comparison, or a judge
that expects one line per number, would not. If the statement is silent, this
is a presentation risk rather than a bug — but it is the first thing to change
if you get Wrong Answer on formatting.

**2. Parameter/caller name mismatch (readability).**

`main` declares `int M` and calls `printNumbers(M)`, whose parameter is named
`N`. Passing by value makes this correct, but the differing names obscure the
data flow.

**3. `INT_MAX` counter overflow (theoretical edge).**

If `N == 2 147 483 647`, the final `i++` overflows `int` (undefined behaviour);
the test `i <= N` may then never fail. Unreachable in practice because the
output alone would be tens of gigabytes, but trivial to guard: loop `i < N` and
print `N` separately, or use `long long i`.

Verified correct by trace: `N = 5 -> 1 2 3 4 5`; `N = 1 -> 1`; `N = 0 ->`
empty; `N = -7 ->` empty.
