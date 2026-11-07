# Learning Notes

## Flag versus counter

The active solution uses a flag:

```cpp
flag = 1;
```

That is correct for an existence question: "does zero appear at least once?"
For an occurrence-count question, use a counter instead:

```cpp
counter++;
```

## Complexity

The full scan takes `O(d)` time and `O(1)` extra space for `d` digits.

## Naming lesson

The folder name says "occurence"; the correct spelling is "occurrence".
Keep the existing folder name for now so links do not break, but use the
correct spelling in new notes and filenames.
