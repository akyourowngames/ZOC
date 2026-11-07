# Learning Notes

## Running answer

`largest` stores the best answer seen so far. After every iteration, it is the
largest digit processed up to that point.

## Invariant

When the loop has removed some digits, no removed digit is larger than
`largest`. This way of thinking becomes useful for arrays and greedy problems.
