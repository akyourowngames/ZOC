#include <iostream>
using namespace std;

int main() {
    int N, factorial, i, sum;

    cin >> N;
    factorial = 1;
    sum = 0;
    i = 1;

    while (i <= N) {
        factorial *= i;
        sum += factorial;
        i++;
    }
    cout << sum;
}