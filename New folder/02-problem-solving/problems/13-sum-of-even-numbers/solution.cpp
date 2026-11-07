#include <iostream>
using namespace std;

int main() {
    int N,i,sum;

    cin >> N;
    sum = 0;
    i = 2;

    while (i <= N) {
        sum += i;
        i += 2;
    }
    cout << sum;
    return 0;
}