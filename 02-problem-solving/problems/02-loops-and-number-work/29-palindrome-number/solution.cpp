#include <iostream>
using namespace std;

int main() {
    int N, reverse, digit, original;

    cin >> N;
    reverse =  0;
    original = N;

    do {
        digit = N % 10;
        reverse = reverse * 10 + digit;
        N = N / 10;
    } while (N > 0);
    if (reverse == original) {
        cout << "YES";
    } else {
        cout << "NO";
    }
}