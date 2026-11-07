#include <iostream>
using namespace std;

int main() {
    int N, product;

    cin >> N;
    product = 1;

    while (N > 0) {
        product *= N % 10;
        N = N / 10;
    }
    cout << product;
    return 0;
}