# Loops

## `for` loop

Use a `for` loop when the start, stopping condition, and update are easy to
see together:

```cpp
for (int i = 1; i <= n; i++) {
    cout << i << '\n';
}
```

## `while` loop

Use `while` when the loop should continue while a condition remains true:

```cpp
while (n > 0) {
    n /= 10;
}
```

## `do-while` loop

`do-while` runs its body at least once, then checks the condition:

```cpp
do {
    cin >> choice;
} while (choice != 0);
```

## Beginner traps

- Forgetting the update creates an infinite loop.
- `i < n` stops before `n`; `i <= n` includes `n`.
- Changing the loop variable inside the body can make the logic hard to
  follow.
- A `do-while` needs a semicolon after its closing parenthesis.

## Competitive-programming habit

Before running a loop, identify its first value, last possible value, and
exact update. Test the smallest input and the boundary input.
