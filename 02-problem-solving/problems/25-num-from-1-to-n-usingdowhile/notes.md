# Deep Notes

## Core logic

One variable, two jobs: `i` is both the iteration counter and the value written
to `cout`. The loop invariant is

> at the top of every iteration, the numbers `1 .. i-1` have already been
> printed, and `i` is the next number to print.

Initialisation `i = 1` makes the invariant true before the first iteration
(nothing printed, `1` is next). The body prints `i` and increments, restoring
it for the next round. The condition `i <= N` is exactly "there is still at
least one number left in `[1, N]`", so the loop stops at the first moment the
invariant can no longer be advanced.

Termination: `i` strictly increases and is bounded by `N`, so the loop runs
`max(N, 0)` times. There is no input for which it can hang.

Loop choice:

- `for (int i = 1; i <= N; i++)` — best when the count is known and zero
  iterations are possible (`N = 0`).
- `while (i <= N)` — same semantics, used when setup lives outside.
- `do { } while (i <= N)` — only correct when at least one iteration is
  logically required, which is *false* here at `N = 0`.

## Code walkthrough

```cpp
int N, i;
cin >> N;
i = 1;                        // first number to print

do {
    cout << i << " ";         // 1. emit the current number
    if (N == 0) {             // 2. attempt to special-case N = 0
        i = 0;
    }
    i++;                      // 3. advance
} while (i <= N);             // 4. continue while numbers remain
```

Reading the code top to bottom in execution order is the fastest way to see
the defect: the print on line 1 of the body has already happened before the
`N == 0` test on line 2 is evaluated. Output cannot be unsent.

## Why it works

For every `N >= 1` the loop is a correct counter loop: it emits `1`, `2`, ...,
`N` and stops when `i` becomes `N + 1`. The mapping between "iteration number"
and "printed value" is the identity, which is why no arithmetic is needed
beyond the increment.

The `N = 0` case is where the algorithm and the loop form disagree. The
*algorithm* says "interval is empty, print nothing"; the *loop form* says
"execute the body once". A `do-while` cannot express an empty range, so the
guard has to live outside it.

## Complexity

- Time: `O(N)` iterations, each doing one integer comparison and one formatted
  write. The true cost is dominated by I/O, `O(total digits printed)`.
- Space: `O(1)` — two `int`s, no arrays, no strings.
- Output size: about `N` numbers of up to `log10(N)` digits each, so the
  printed volume is `O(N log N)` characters.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `5` | `1 2 3 4 5` | ordinary case, five iterations |
| `1` | `1` | single iteration, the case `do-while` is built for |
| `0` | *(empty)* | empty range; body must not run |
| `-3` | *(empty)* | same as `0`, no positive integer in range |
| `2` | `1 2` | boundary: condition uses `<=`, so `2` is included |
| `100000` | `1 ... 100000` | performance check, linear time |

## Common mistakes

- **Placing the zero-check after the print.** The output already escaped. This
  is the mistake in the active solution.
- **Using `i = 0` as a "fix".** Changing the counter mid-body makes the state
  harder to reason about and does not remove the emitted character.
- **`while (i < N)`.** Drops the last number — the classic off-by-one.
- **No space management.** `cout << i` without a separator produces `12345`
  instead of `1 2 3 4 5`.
- **Declaring the counter inside `main` but forgetting to initialise it**
  before a pre-increment such as `++i`.
- **Believing `do-while` and `while` are interchangeable.** They differ at
  exactly the boundary this problem is designed to expose.

## Variants and follow-ups

1. **`for` version** (folder `31-print-to-N`): same output, zero iterations at
   `N = 0` for free.
2. **Descending**: start at `N`, condition `i >= 1`, step `-1`.
3. **Step 2**: print odd numbers only; the step becomes `2` and the guard must
   account for parity.
4. **No trailing space**: print `i` before a space only when `i < N`, or build
   the output string first.
5. **Very large `N`**: fast I/O matters; use `ios::sync_with_stdio(false)` or
   `printf` rather than flushing per number.
6. **Recursive**: `print(N-1); cout << N;` — a natural bridge to recursion and
   to the "print after the recursive call" pattern.

## Key takeaways

- `do-while` guarantees one execution; that is a *feature* only when one
  execution is always valid.
- Guards belong outside the construct they protect, before any side effect.
- Loop correctness is three independent decisions: start, step, stop test.
- The counter-is-the-value trick removes all extra state from a counting task.

## Current-code review

The shipped loop does not implement the stated behaviour for `N = 0`.

```cpp
do {
    cout << i << " ";
    if (N == 0) {
        i = 0;
    }
    i++;
} while (i <= N);
```

Trace with `N = 0`, `i = 1`:

1. `cout << 1 << " "` — the `1` is now in the output stream;
2. `N == 0` is true, so `i = 0`;
3. `i++` makes `i = 1`;
4. test `1 <= 0` is false, loop ends.

Result: `1 ` is printed. The guard is dead code in the sense that it changes
nothing that matters — even without it, `i` would become `2` and `2 <= 0` is
also false, so the loop stops at the same point with the same (wrong) output.
It neither suppresses the print nor controls termination.

For negative `N` the same thing happens: `1 ` is printed.

A minimal correction, without changing the loop form:

```cpp
if (N >= 1) {
    do {
        cout << i << " ";
        i++;
    } while (i <= N);
}
```

Two secondary observations:

- The output always ends with a space. Token-based judges accept this; a strict
  character comparison would not.
- No trailing newline is emitted. Harmless when piping into a checker, untidy
  in a terminal.
