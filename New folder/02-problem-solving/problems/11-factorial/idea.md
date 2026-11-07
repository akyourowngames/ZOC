# Ideas and Hints

## Hint

Start `factorial` at `1`, then multiply it by every integer from `1` to `N`.

## Traps

- Start with `1`, not `0`; multiplying by zero destroys the answer.
- `0!` is `1`.
- Factorials overflow very quickly. Even `long long` cannot store large
  factorials.
- A negative factorial is not defined in this beginner problem.
- Use the exact input limits from the statement to choose a type.
