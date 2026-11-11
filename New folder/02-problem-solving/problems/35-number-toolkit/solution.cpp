#include <iostream>

using namespace std;

bool isEven(int n) {
    return n % 2 == 0;
}

int sumDigits(int n) {
    if (n < 0) {
        n = -n;
    }

    int sum = 0;

    while (n > 0) {
        sum += n % 10;
        n /= 10;
    }

    return sum;
}

void makePositive(int& n) {
    if (n < 0) {
        n = -n;
    }
}

int main() {
    int N;

    cin >> N;

    cout << (isEven(N) ? "Even" : "Odd") << endl;
    cout << sumDigits(N) << endl;

    makePositive(N);
    cout << N;

    return 0;
}