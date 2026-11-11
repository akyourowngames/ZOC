# Data Types and Basics

## Integer literals

Use the `LL` suffix when a large integer should have type `long long`:

```cpp
long long bigNumber = 500000000LL;
```

## Namespace

`std::` identifies names from the C++ standard library. `using namespace std;`
is convenient for small exercises, but writing `std::cout` and `std::cin` is
safer in larger programs because it avoids name collisions.

## `sizeof`

`sizeof(variable)` reports the size of a type or object in bytes:

```cpp
int age = 25;
std::cout << sizeof(age);
```

Exact sizes can vary by platform. Common sizes are:

| Type | Common size |
|---|---:|
| `int` | 4 bytes |
| `char` | 1 byte |
| `float` | 4 bytes |
| `bool` | commonly 1 byte |
| `double` | 8 bytes |

## Characters and strings

Use single quotes for one character:

```cpp
char initial = 'S';
```

Use double quotes for text:

```cpp
std::string name = "Shubham";
```

When a `char` is printed as an integer, its character code is shown.
