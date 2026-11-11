# Functions

## Why use functions?

A function gives one named job to a reusable block of code. This makes a
program easier to test and keeps `main` focused on input and output.

```cpp
int square(int x) {
    return x * x;
}
```

## Function parts

- Return type: `int`
- Name: `square`
- Parameter: `x`
- Returned result: `x * x`

## Beginner traps

- The return type must match the value returned.
- A `void` function does not return a value.
- A function must be declared before it is called, or given a prototype.
- Parameters are local to the function.
- Keep each function responsible for one clear task.
