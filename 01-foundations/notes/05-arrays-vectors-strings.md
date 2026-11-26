# Arrays, Vectors, and Strings

## Arrays

An array stores a fixed number of elements with zero-based indexes:

```cpp
int arr[5] = {10, 20, 30, 40, 50};
```

Never access an index outside `0` through `N - 1`.

## Vectors

A `vector<int>` can change size:

```cpp
vector<int> values;
values.push_back(10);
values.pop_back();
```

## Strings

A `string` stores text and each character has a zero-based index:

```cpp
string s = "IOI";
cout << s[0];
cout << s.length();
```

Use `getline(cin, s)` when spaces are part of the input.
