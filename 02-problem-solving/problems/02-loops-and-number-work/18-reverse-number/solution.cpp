#include <iostream>
using namespace std;

int main() {
    int N, reverse, digit, original;

    cin >> N;
    original = N;

    reverse = 0;
    digit = 0;

    while (N > 0) {
        digit = N % 10;
        reverse = reverse * 10 + digit;
        N  = N / 10;
    }
    // cout << reverse << endl;

    if (original == reverse) {
        cout << "YES";
    } else {
        cout << "NO";
    }
    return 0;
}