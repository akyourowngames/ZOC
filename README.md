# Learn C++ by Solving

A self-contained C++ curriculum and practice workspace: **38 worked problems**, a **ZCO contest track**, foundation lessons, deep notes, and a local Next.js field-journal tracker.

No account, server, or build system is required for the learning material. You need one C++ compiler, a text editor, and the willingness to solve problems before reading the solutions.

**Start here:** [Foundations](01-foundations/README.md) → [Problem index](02-problem-solving/problems/README.md) → [ZCO practice](03-contests/zco/README.md).

---

## Who this is for

- **Complete beginners** who want a guided path from `cout` to contest-style number problems.
- **Students preparing for ZCO / IOI** who need structured practice with hints, proofs, and complexity analysis.
- **Self-taught programmers** who know another language and want focused C++ practice.
- **Teachers and study groups** who want a ready-made problem set with explanations.

Every problem is documented at four levels: the task, the thinking process, the working code, and the traps. You are meant to struggle a little before reading the answer.

## What makes this useful

- **Every problem has four files:** `README.md` (statement and examples), `idea.md` (progressive hints and derivation), `notes.md` (deep explanation, complexity, edge cases), and a `.cpp` solution.
- **The reasoning is written down.** `02-problem-solving/PROBLEM-LOGIC.md` explains the core idea, proof sketch, complexity, and failure mode for all 38 problems.
- **The ZCO track is contest-grade.** Four exercises come with correctness arguments, dry runs, complexity budgets, and a dedicated `ZCO-LOGIC-GUIDE.md`.
- **The current code is reviewed honestly.** Some folders preserve the learner's working solution and document its bugs, overflow risks, and output-format mistakes instead of hiding them. Those reviews are lessons, not polished judge submissions.
- **A field-journal tracker is included.** The `field-journal/` Next.js app tracks gates, problems, sessions, and streaks, and can watch the workspace for saves.

## Quick start

### 1. Get a C++ compiler

| Platform | Recommended compiler |
|---|---|
| Windows | MSVC (Visual Studio Build Tools, "Desktop development with C++") or MinGW-w64 `g++` |
| macOS | `xcode-select --install` |
| Linux | `sudo apt install build-essential` (Debian/Ubuntu) or the equivalent |

Check that it works:

```bash
g++ --version
```

### 2. Clone and enter the repository

```bash
git clone https://github.com/akyourowngames/ZOC.git
cd ZOC
```

### 3. Compile and run your first program

Pick any example, for example `01-foundations/code/01-variables-and-output.cpp`:

```bash
# g++ / clang++
g++ -std=c++17 -O2 -Wall -Wextra 01-foundations/code/01-variables-and-output.cpp -o first
./first
```

```bat
:: MSVC, from a Developer Command Prompt
cl /EHsc /std:c++17 01-foundations\code\01-variables-and-output.cpp
first.exe
```

The `-Wall -Wextra` flags are not required, but they teach you more than they cost.

### 4. Run the field-journal tracker (optional)

The tracker is a local Next.js app; Node.js is required only for this step.

```bash
cd field-journal
npm install
npm run dev
```

Open `http://localhost:3000`. Progress stays in your browser, and the optional watcher can log saves from this workspace. See [field-journal/README.md](field-journal/README.md) for views, imports, and backups.

### 5. Use VS Code (optional)

The repository includes `.vscode/tasks.json` and `.vscode/launch.json`. Open the repository folder, open a `.cpp` file, and press `Ctrl+Shift+B` to build it with MSVC.

## Your first program

If you have never written C++, start with this and then follow the foundation notes:

```cpp
#include <iostream>

int main() {
    int a = 0;
    int b = 0;

    std::cin >> a >> b;
    std::cout << a + b << '\n';

    return 0;
}
```

It reads two integers and prints their sum. The rest of the curriculum is built from small ideas like this one: a value, an operation, a decision, a loop, and a function.

## The learning path

| Stage | Focus | Where to work | You can do this afterwards |
|---|---|---|---|
| 0 | Setup and first program | [Quick start](#quick-start) | Compile and run any file |
| 1 | Variables, I/O, operators, conditions, loops, functions | [Foundations](01-foundations/README.md), [notes](01-foundations/notes/README.md) | Read and write small programs |
| 2 | Input, arithmetic, and conditionals | Problems [01–08](02-problem-solving/problems/README.md) | Solve straightforward computational tasks |
| 3 | Loops, counters, and digit manipulation | Problems [09–21](02-problem-solving/problems/README.md) | Peel digits, reverse numbers, count properties |
| 4 | Accumulation, patterns, and number theory basics | Problems [22–31](02-problem-solving/problems/README.md) | Sum series, test divisibility, build triangles |
| 5 | Functions, references, and arrays | Problems [32–38](02-problem-solving/problems/README.md) | Decompose a task and scan an array |
| 6 | Contest discipline and ZCO patterns | [ZCO track](03-contests/zco/README.md), [logic guide](03-contests/zco/ZCO-LOGIC-GUIDE.md) | Write judge-safe code under time pressure |
| 7 | IOI-style depth and advanced topics | [IOI practice](03-contests/ioi/README.md), [Reference](04-reference/README.md), [Roadmap](ROADMAP.md) | Attack subtasks and advanced structures |

The numbered problems are an intended study order, not a difficulty ranking. Skip around, but do not skip the edge cases.

## How to use a problem folder

Each problem is designed for active practice, not passive reading.

1. **Read the statement** in `README.md`. Write down the input, output, and one example by hand.
2. **Attempt it for 20–30 minutes** without opening the solution. A wrong attempt is useful data.
3. **Open `idea.md` one hint at a time.** Stop as soon as you have a plan.
4. **Implement it yourself** and test normal cases, boundary cases, and one hostile case.
5. **Compare with `.cpp`.** Note where your approach differs, not just whether it compiles.
6. **Read `notes.md`** for the proof, complexity, overflow limits, and variants.
7. **Write one sentence** in your own words: "This problem is really about ___."
8. **Re-solve it from scratch after 2–3 days.** If you cannot, the problem is not learned yet.

If a folder's `notes.md` has a **Current-code review** section, read it carefully: it lists real defects in the preserved solution and what a correct version must do.

## Repository map

```text
.
├── 01-foundations/            # Lessons and runnable C++ examples
│   ├── code/                  # Small programs, one concept each
│   └── notes/                 # Data types, operators, loops, functions
├── 02-problem-solving/        # The 38-problem core track
│   ├── problems/              # One folder per problem
│   └── PROBLEM-LOGIC.md       # Core idea and proof for every problem
├── 03-contests/
│   ├── zco/                   # ZCO practice + ZCO-LOGIC-GUIDE.md
│   └── ioi/                   # IOI-style practice layout
├── 04-reference/              # STL, algorithms, complexity, templates
├── 99-build-artifacts/        # Compiler output (ignored by Git)
├── field-journal/             # Next.js field-journal tracker
└── ROADMAP.md                 # 55-gate study roadmap
```

### Key references

- **Problem index:** [02-problem-solving/problems/README.md](02-problem-solving/problems/README.md)
- **All problem logic:** [02-problem-solving/PROBLEM-LOGIC.md](02-problem-solving/PROBLEM-LOGIC.md)
- **ZCO index:** [03-contests/zco/README.md](03-contests/zco/README.md)
- **ZCO deep guide:** [03-contests/zco/ZCO-LOGIC-GUIDE.md](03-contests/zco/ZCO-LOGIC-GUIDE.md)
- **Roadmap:** [ROADMAP.md](ROADMAP.md)
- **Field-journal tracker:** [field-journal/README.md](field-journal/README.md)

## A taste of the problem set

| Goal | Start with |
|---|---|
| Read input and do arithmetic | [01 Basic input and arithmetic](02-problem-solving/problems/01-basic-input-and-arithmetic/README.md) |
| Make a decision | [03 Even or odd](02-problem-solving/problems/03-even-odd-if-else/README.md), [06 Maximum of three](02-problem-solving/problems/06-Maximum-of-three/README.md) |
| Extract digits | [09 Digit extractor](02-problem-solving/problems/09-Digit-Extractor/README.md), [16 Sum of digits](02-problem-solving/problems/16-sum-of-digits-of-a-number/README.md) |
| Reverse and compare | [18 Reverse a number](02-problem-solving/problems/18-reverse-number/README.md), [29 Palindrome number](02-problem-solving/problems/29-palindrome-number/README.md) |
| Sum a series | [22 Sum of odd numbers](02-problem-solving/problems/22-sum-of-odd-numbers/README.md), [23 Sum of multiples](02-problem-solving/problems/23-sum-of-multiples/README.md) |
| Build patterns | [24 Number triangle](02-problem-solving/problems/24-number-triangle/README.md) |
| Work with arrays | [37 Sum of array elements](02-problem-solving/problems/37-sum-of-array-elemts/README.md), [38 Max and min](02-problem-solving/problems/38-max-min-arr/README.md) |
| Think like a contestant | [ZCO Max Revenue](03-contests/zco/04-max-revenue/README.md) |

## Contest preparation

The ZCO track focuses on the patterns that decide beginner contests:

- **Number theory:** primality, divisor counting, perfect numbers, and why `sqrt(N)` matters.
- **Digit manipulation:** the `digit = n % 10; n /= 10;` invariant, reversal, palindromes, and overflow.
- **Optimization:** turning an `O(N²)` candidate scan into `O(N log N)` with sorting and suffix counts.
- **Judge discipline:** exact output, no prompts or labels, correct types, and tested boundaries.

Read the [ZCO logic guide](03-contests/zco/ZCO-LOGIC-GUIDE.md) after attempting the four exercises. It contains the proofs, dry runs, complexity budgets, and a pre-submit checklist. For deeper topics, follow the [roadmap](ROADMAP.md) into graphs, dynamic programming, and advanced data structures.

## Study routine that works

- **Daily:** one focused block of 45–90 minutes. One problem attempted is better than three problems skimmed.
- **Weekly:** re-solve one old problem from memory and review your mistake log.
- **Before a contest:** solve one problem under a timer, then read the editorial or notes.
- **After a contest:** classify every failure as *wrong idea*, *wrong implementation*, *wrong output format*, or *ran out of time*. Fix the category, not just the problem.
- **Track evidence, not ego:** a file on disk proves you wrote something, not that you can reproduce it. The field journal treats evidence and mastery separately for this reason.

## Conventions

- Problems live in numbered folders: `NN-short-description/`.
- Each problem has `README.md`, `idea.md`, `notes.md`, and one `.cpp` file.
- Source files use the name `solution.cpp` unless a clearer name already exists.
- Compiler output belongs in `99-build-artifacts/`, never beside source code.
- Competitive-programming solutions print only what the judge asks for: no prompts, labels, or decorative text.
- Choose the type from the **result**, not the input. `int` is not enough for every product.
- Test at least: zero, one, a boundary value, a maximum value, and a value that triggers the stated trap.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `g++: command not found` | Compiler not installed or not on `PATH` |
| `undefined reference to 'main'` | No `main` function, or the wrong file was compiled |
| `expected ';' before ...` | Missing semicolon on the previous line |
| Program waits forever | A `while`/`for` condition never becomes false; check divisor or digit updates |
| Correct on the example, wrong on the judge | Prompts/labels in output, integer overflow, or an unhandled boundary |
| `.exe` not found | Compile from the source file's folder or use the full output path |

## Contributing and reuse

This is a personal learning workspace, but corrections and improvements are welcome. If a proof is wrong, an edge case is missing, or a link is broken, open an issue or a pull request. When adding a problem, follow the four-file convention and include at least one boundary test.

The material is released under the [MIT License](LICENSE). You may fork it, teach from it, and adapt it. Attribution is appreciated.

---

**First time here?** Read [01-foundations/notes/01-data-types-and-basics.md](01-foundations/notes/01-data-types-and-basics.md), then solve [problem 01](02-problem-solving/problems/01-basic-input-and-arithmetic/README.md) without looking at the solution. That is the whole method: a small idea, a real attempt, and a written explanation.
