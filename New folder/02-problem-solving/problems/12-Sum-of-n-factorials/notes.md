# Learning Notes

## Reuse work

At iteration `i`, the current factorial is `i!`. The next one is simply
`(i + 1)! = i! * (i + 1)`. This avoids repeated nested loops.

## Common mistake

Calculating every factorial separately can turn an `O(N)` idea into an
`O(N^2)` solution. Reusing the running product is cleaner and faster.
