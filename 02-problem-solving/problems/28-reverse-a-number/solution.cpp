#include <iostream>
using namespace std;

int main() {
    int N, digit,reverse;

    cin >> N;
    reverse = 0;

    do {
        digit = N % 10;
        reverse = reverse * 10 + digit;
        N = N / 10;
    } while (N > 0);
    cout << reverse;
}