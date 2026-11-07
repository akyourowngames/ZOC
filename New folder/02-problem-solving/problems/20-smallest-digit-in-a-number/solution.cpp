#include <iostream>
using namespace std;

int main() {
    int N, smallest, digit;

    cin >> N;
    smallest = 9;
    digit = 0;

    while (N > 0) {
        digit = N % 10;

        if (digit < smallest) {
            smallest = digit;
        }
        N = N / 10;
    }
    cout << smallest;

    
    return 0;
}