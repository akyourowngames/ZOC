#include <iostream>
using namespace std;

int main() {
    int N, sum;
    cin >> N;
    sum = 0;

    for (int i = 1; i <= N; i++) {
        if (i % 2 == 0) {
            continue;
        }
        sum += i;
    }
    cout << sum;
    return 0;
}