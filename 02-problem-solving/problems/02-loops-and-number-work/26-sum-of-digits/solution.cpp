#include <iostream>
using namespace std;

int main() {
    int N, digit, sum;

    cin >> N;
    sum = 0;

    do {
        digit = N % 10;
        sum += digit;
        N = N/10;
    } while (N > 0);
    cout << sum;
}