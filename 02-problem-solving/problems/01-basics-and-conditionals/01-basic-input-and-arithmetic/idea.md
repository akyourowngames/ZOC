# How to Think About It

## 1. Restate the task

You are given one or two integers. Produce one integer that is a fixed
arithmetic combination of them, and print nothing else:

- double it (`n * 2`),
- area of a rectangle (`length * width`),
- echo it back,
- multiply two values up to `10^6`,
- or print the five basic results of `a` and `b` (product, quotient,
  difference, sum, remainder).

## 2. Spot the pattern

No loop, no branch: input -> expression -> output. The interesting decision is
not the control flow, it is the **data type**. Ask two questions:

1. How large can an input be?
2. How large can the *answer* be after `*`, `+`, `-`?

If answer 2 is bigger than about `2.1 * 10^9`, `int` is the wrong tool even
when both inputs fit in `int`.

## 3. Derive the algorithm

1. Declare the operands. Use `long long` whenever a product may exceed `int`.
2. Read them in the order the statement lists (spaces and newlines are both
   fine for `cin`).
3. Compute the expression **into a wide enough variable**, e.g.
   `long long product = a * b;` where `a` and `b` are already `long long`.
4. Print the value with `cout` plus `'\n'`. Do not print any words.
5. Return `0`.

## 4. Dry run

Exercise 4 with `a = 1000000`, `b = 1000000`:

| Step | Value |
| --- | --- |
| read `a`, `b` | `1000000`, `1000000` |
| type check | `10^6 * 10^6 = 10^12 > 2.1*10^9`, so `long long` |
| `a * b` | `1000000000000` |
| output | `1000000000000` |

Same numbers with `int` operands: the true product `10^12` does not fit, the
signed result wraps (on typical two's-complement hardware to `-727379968`),
and the program is simply wrong. That number is not a rounding error; it is
undefined behaviour that happened to produce a value.

Exercise 5 with `a = 7`, `b = 3`:

| Expression | Computation | Printed |
| --- | --- | --- |
| `a * b` | `21` | `21` |
| `b / a` | `3 / 7`, truncates toward zero | `0` |
| `b - a` | `3 - 7` | `-4` |
| `a + b` | `10` | `10` |
| `b % a` | `3 - 0*7` | `3` |

## Progressive hints

1. Write the smallest possible program first: `int n; cin >> n; cout << n*2;`.
2. Before choosing a type, write down the maximum answer on paper.
3. If a result is a count or a digit, `int` is fine. If it is a product of two
   large values, reach for `long long`.
4. For exercise 5, the operand order is written in the statement (`b / a`, not
   `a / b`); reproduce it exactly.
5. Delete every `cout` that is not the answer. The fastest fix for "wrong
   answer on sample" in these drills is usually a leftover prompt string.

## Traps

- **Prompt strings.** `cout << "Enter your integer: ";` is not part of the
  output; graders compare bytes.
- **Labels.** `"Answer: 14"` is not `14`.
- **`int` overflow.** Multiplying two `int`s produces an `int`; assigning to
  `long long` afterwards is too late.
- **Missing `;`.** A forgotten semicolon after `cout << area` stops the build;
  the commented rectangle block has exactly this shape.
- **Division by zero.** `b / a` and `b % a` crash when `a == 0`.
- **Integer division is not exact.** `3 / 7` is `0`, not `0.428...`; if a real
  fraction is wanted, the answer format must say so.
- **`%` sign.** In C++, `-7 % 3` is `-1` (sign follows the left operand), not
  `2`. Python-trained intuition is wrong here.

## Self-check

- What is the largest possible value of each answer, given the constraints?
- Does the output end with a newline but contain no other text?
- For exercise 5: does `7 3` give exactly the five numbers, and why is the
  quotient `0`?
- What happens to your program on input `0 5` for exercise 5, and is that
  input allowed?
