# Learning Notes

## Decision table

| Condition | Print |
|---|---|
| `A < B` | `B` |
| otherwise | `A` |

## Complexity

One comparison: `O(1)` time and `O(1)` extra space.

## Beginner mistake

An `if` condition must be a Boolean expression. `if (A < B)` is correct;
`if (A < B);` has an empty body because of the extra semicolon.
