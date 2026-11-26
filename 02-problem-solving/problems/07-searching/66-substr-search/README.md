# Substring Search

Read strings `S` and `T`. Print whether `T` occurs inside `S`.

## Current source status

The draft locates a possible start with `find`, but the match-verification
loop is empty and it does not print `FOUND` when a match exists. In standard
C++, `find` already checks the full substring.
