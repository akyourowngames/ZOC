#include <iostream>
using namespace std;

int square(int n) {
    return n * n;
}

void doubleNumber(int &n) {
    n = n * 2;
}

int main() {
    int N, result;
    cin >> N;
    result = square(N);
    doubleNumber(N);

    cout << result << " " << N;
    return 0;
}