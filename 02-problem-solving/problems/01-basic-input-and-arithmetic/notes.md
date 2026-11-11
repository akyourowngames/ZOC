# Deep Notes

## Core logic

Every exercise in this file has the same shape: one `cin`, one expression,
one `cout`. There is no algorithmic content; the lessons are about **types**
and **output hygiene**.

- Exercise 1 (`n * 2`): result is at most twice the input.
- Exercise 2 (`length * width`): the first place where the answer can outgrow
  the inputs.
- Exercise 3 (echo): the value itself must fit, so the type must hold the
  whole number, not just a typical one.
- Exercise 4 (`a * b`, inputs up to `10^6`): answer up to `10^12`.
- Exercise 5 (five results from `a`, `b`): division and remainder semantics.

## Code walkthrough

The active block, in order:

1. `int a; int b;` — two 32-bit slots. This is the first thing to question:
   `a * b` is evaluated as `int`, so a product above `2,147,483,647` overflows
   before it is ever printed.
2. `cin >> a; cin >> b;` — two reads; input `7 3` or `7<newline>3` both work.
3. `cout << "Multiplication: " << a * b << endl;` — prints a label, then the
   product.
4. `cout << "Division: " << b / a << endl;` — second input divided by first.
   For `7 3` this is `3 / 7 = 0`. Note the operand order; it is not `a / b`.
5. `cout << "Difference: " << b - a << endl;` — `b - a`, again second minus
   first, so `3 - 7 = -4`.
6. `cout << "Sum: " << a + b << endl;` — commutative, order irrelevant.
7. `cout << "Remainder: " << b % a;` — `3 % 7 = 3`; no trailing newline.

The commented blocks, oldest first, show the progression a beginner actually
goes through:

- Block 1 keeps the prompt `"Enter your integer: "` and the label
  `"Answer: "` — a console demo, not a submission.
- Block 2 adds `"You area is: "` and forgot the `return 0;` (it is commented
  out together with the braces).
- Block 3 uses `int` for something the comment calls a "long number".
- Block 4 is the first judge-ready one: `long long a, b;` then
  `long long product = a * b;`.

## Why it works

`cin` skips leading whitespace, so `7 3` and two separate lines are equivalent
for `cin >> a; cin >> b;`. Arithmetic on `int` is exact while the true result
fits in the range `[-2^31, 2^31 - 1] = [-2147483648, 2147483647]`; `long long`
extends this to about `[-9.22*10^18, 9.22*10^18]`. Integer division `b / a`
computes `trunc(b / a)` in real arithmetic (rounds toward zero), and `%`
satisfies `b == (b / a) * a + b % a`.

## Complexity

O(1) time and O(1) space per exercise: a constant number of reads, arithmetic
operations and writes, independent of the values.

## Edge cases and tests

| Input | Expected | Reason |
| --- | --- | --- |
| `0` (ex. 1) | `0` | twice zero is zero |
| `-7` (ex. 1) | `-14` | sign carried through multiplication |
| `5 4` (ex. 2) | `20` | README sample |
| `0 9` (ex. 2) | `0` | degenerate rectangle has zero area |
| `1000000 1000000` (ex. 4) | `1000000000000` | needs `long long` |
| `-1000000 1000000` (ex. 4) | `-1000000000000` | negative product |
| `7 3` (ex. 5) | `21, 0, -4, 10, 3` | truncating division, `b%a` |
| `3 7` (ex. 5) | `21, 2, 4, 10, 1` | `7/3 = 2`, `7%3 = 1` |
| `0 5` (ex. 5) | crash | `b / a` with `a == 0` |

## Common mistakes

- Declaring `long long product = a * b;` while `a` and `b` are still `int`.
- Believing "inputs fit in `int`, so the answer does too".
- Using `/` when the problem asked for the remainder (or vice versa).
- Printing a prompt, a label, a unit, or a trailing sentence.
- Assuming `%` returns a positive value for negative operands.
- Forgetting that `cin >> int` on an out-of-range number (e.g. `9876543210`)
  fails and leaves `INT_MAX` in the variable since C++11.

## Variants and follow-ups

- **Same five results, judge format:** drop the labels and use
  `long long a, b;`.
- **Overflow-proof product:** if the true product can exceed `9.2*10^18`,
  print it as a decimal string (grade-school multiplication) or use
  `__int128` with custom I/O.
- **Floating point:** if the task wants a real quotient, use `double` and a
  fixed precision (`fixed << setprecision(6)`), and never mix it with `%`.
- **Generalise exercise 2:** area and perimeter, then volume of a cuboid —
  same pattern, larger result.

## Key takeaways

1. Choose the type from the result range, before evaluating the expression.
2. Judged output is bytes: no prompts, no labels, exact order and count of
   lines.
3. `b / a` and `b % a` are defined only when `a != 0`.
4. A crash on `0` is not a wrong answer — it usually shows up as a runtime
   error verdict.

## Current-code review

The active block does not implement any of the three exercises listed in the
README. It is a fifth drill that reads two numbers and prints a labelled
arithmetic table. Two problems make it unusable as a judged submission:

1. **Labels in the output.** `Multiplication: 21` etc. would be rejected by
   any grader that expects `21`. The intended judge output is one bare number
   per line.
2. **Division direction.** It computes `b / a` and `b % a`, i.e. the second
   input divided by the first. For `7 3` it prints `Division: 0`. If the drill
   means "a divided by b", the operands are swapped; if it means `b / a`, the
   label should say so. The order must be pinned down before this is published
   as a solution.
3. **No zero guard.** Input `0 5` evaluates `5 / 0` and `5 % 0`; the MSVC
   build used to verify this folder terminated abnormally with the integer
   divide-by-zero exception (no output, non-zero status), it did not print an
   error message.
4. **`int` everywhere.** `a * b`, `a + b` overflow above `2,147,483,647`; a
   `long long` version would cost nothing.
5. **Commented exercise 3 uses `int` for a "long number".** Feeding
   `9876543210` sets the stream to a failed state and leaves `INT_MAX`, so the
   echo is wrong. That block needs `long long`.
6. **Mixed line endings in output.** `endl` and `"\n"` are mixed and the last
   line has no newline. Harmless for most judges, but be consistent.

The four commented exercises themselves are correct in intent; block 4
(`long long`) is the only one already written in judge form.
