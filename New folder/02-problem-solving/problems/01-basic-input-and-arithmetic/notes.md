# Notes and Ideas

## Key lessons

### 1. Choose a type based on the result

An `int` usually stores values up to about `2.1 * 10^9`. Multiplying
`1,000,000 * 1,000,000` gives `10^12`, so the result does not fit in an
`int`.

Use `long long` for this problem:

```cpp
long long a, b;
long long product = a * b;
```

`long long` usually supports values up to about `9.22 * 10^18`.

### 2. Understand overflow

Overflow happens when a calculation produces a value outside the type's range.
The result is not reliable, so choose a sufficiently large type before doing
the calculation.

For example:

```text
1,000,000 * 1,000,000 = 1,000,000,000,000
```

### 3. Competitive-programming output must be exact

Do not print prompts such as:

```cpp
cout << "Enter your integer: ";
```

Judges expect only the requested answer:

```cpp
cin >> n;
cout << n * 2;
```

Extra text such as `"Answer: "` can cause a wrong answer.

### 4. Very large values

`5,000,000,000 * 5,000,000,000` equals `2.5 * 10^19`, which is larger than
the normal `long long` range. GCC provides `__int128` for larger integer
calculations, but it needs custom input/output helpers.

For most ZCO problems, follow the constraints: `long long` is enough whenever
the maximum possible result is at most about `9 * 10^18`.

## Mistakes to avoid

- Using `int` because the inputs fit, without checking whether the result fits.
- Printing prompts or explanatory labels in a judged solution.
- Assuming every compiler type has exactly the same size on every platform.
- Using `__int128` when the problem constraints only require `long long`.

## Next topic

Practice `if`/`else` conditionals after rewriting these exercises from memory.
