#include <iostream>
using namespace std;

int main() {
    int N, i ,factorial;

    cin >> N;
    factorial = 1;
    i = 1;

    while (i <= N) {
        factorial = factorial * i;
        i++;
    }
    cout << factorial;

    return 0;
}