#include <iostream>
using namespace std;

int main() {
    int N, digit, largest;

    cin >> N;
    digit = 0;
    largest = 0;

    while (N > 0) {
        digit = N % 10;

        if (digit > largest) {
            largest = digit;
        }
        N = N / 10;
    }
    cout << largest;
    return 0;
}