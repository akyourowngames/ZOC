#include <iostream>
using namespace std;

int main() {
    int N, digit, counter;

    cin >> N;
    counter = 0;

    do {
        digit = N % 10;
        if (digit % 2 == 0) {
            counter += 1;
        }
        N = N/10;
    } while (N > 0);
    cout << counter;
}