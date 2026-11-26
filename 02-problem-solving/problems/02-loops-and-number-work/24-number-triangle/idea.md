# How to Think About It

## 1. Restate the task

Print `N` lines. Line `i` is `1` followed by `2` and so on up to `N - i + 1`, with nothing
between the digits. The first line is the longest, the last is `1`.

The shape is a right-aligned inverted triangle of characters:

```text
N = 5        row i   length N-i+1
12345          1        5
1234           2        4
123            3        3
12             4        2
1              5        1
```

## 2. Spot the pattern

Two independent questions, answered by two loops:

| Question | Loop | Bound |
| --- | --- | --- |
| how many rows? | outer, `i` | `i = 1..N` |
| how long is this row? | inner, `j` | `j = 1..N - i + 1` |

| what to print | Value | Where |
| --- | --- | --- |
| the content | the column index `j` | inner body |
| end of row | `'\n'` | after the inner loop |

Two nested loops are needed because the output is two-dimensional: the number of lines and
the length of each line are independent facts (well, related, but not equal).

The triangle's row lengths are `N, N-1, ..., 1`, an arithmetic progression with sum
`N(N+1)/2`. That sum is the total character count, which is also why the bound is O(N^2).

## 3. Derive the algorithm

1. Read `N`.
2. `for (int i = 1; i <= N; i++)` — one iteration per line.
3. Inside: `for (int j = 1; j <= N - i + 1; j++) cout << j;`
   The bound is written so that `i = 1` gives `N` and `i = N` gives `1`.
4. After the inner loop: `cout << endl;` — newline only *between/after* rows, never inside.
5. Nothing is returned; all work is in the output.

Derive the bound rather than remembering it: row `i` starts with a full `1..N` and has
already "lost" `i - 1` elements from its right end, so it holds `N - (i - 1) = N - i + 1`
elements.

## 4. Dry run

`N = 3`

| `i` | inner bound `N - i + 1` | printed | newline |
| --- | --- | --- | --- |
| 1 | `3` | `1 2 3` -> `123` | yes |
| 2 | `2` | `1 2` -> `12` | yes |
| 3 | `1` | `1` -> `1` | yes |

Output:

```text
123
12
1
```

Total characters `3 + 2 + 1 = 6`. Output lines `3`.

`N = 4`:

| `i` | bound | row |
| --- | --- | --- |
| 1 | 4 | `1234` |
| 2 | 3 | `123` |
| 3 | 2 | `12` |
| 4 | 1 | `1` |

Total characters `10 = 4*5/2`. Each row is the previous one with the last character
dropped, which is a useful mental picture: the program is a shrinking prefix printer.

`N = 1`: one row, bound `1 - 1 + 1 = 1`, output `1`. No blank line, no extra newline
beyond the one after the row.

`N = 0`: the outer loop condition `1 <= 0` is false, so nothing at all is printed — not
even a newline. That is the natural reading of "zero rows".

## Progressive hints

1. How many lines must be printed? (`N`) Which loop controls that? (the outer one)
2. How many characters are on line `i`? (`N - i + 1`) How did you derive it? (start from
   `N`, subtract one per row)
3. What character goes in column `j` of a row? (the digit `j` itself)
4. What must be printed after the last column of a row? (a newline)
5. Why must the newline be inside the outer loop but outside the inner loop? (one per row,
   not per character)
6. What does the inner bound become at `i = 1` and at `i = N`? (`N` and `1` — the extremes
   of the triangle)

## Traps

- Inner bound written as `i` instead of `N - i + 1`: this prints `1`, `12`, `123` — an
  upright triangle, the mirror image of what is wanted.
- Newline inside the inner loop: one character per line.
- Newline missing entirely: all rows on one line.
- Printing `j` as `char`: `cout << (char)j` for `j = 1` emits a control character, not
  `'1'`. `j` must stay an `int`.
- Adding spaces between the numbers: the expected output has none.
- Using `N - i` (off by one): the last row becomes empty and the first row loses a digit.
- Assuming `N <= 9`; for `N >= 10` the glued numbers become ambiguous (see notes.md).
- Extra trailing newline or blank line at the end, which some judges reject.
- Using `endl` in a tight loop for very large `N`: it flushes every line.

## Self-check

- Write the bound for a normal (upright) triangle of the same shape and explain the
  difference. (`j <= i`)
- Write the bound for a rectangle `N` by `N`. (`j <= N`)
- Count the characters printed for `N = 10`. (`55`)
- Predict the output for `N = 2`. (`12` then `1`)
- Explain why the space complexity is O(1) even though the output is O(N^2).
- Modify the inner body to print `N - j + 1`; describe the new picture.
