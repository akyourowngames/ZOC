#include <iostream>
using namespace std;

int main() {
    int K, N;

    cin >> N >> K; // K = 3

    int temp = 1;

    temp = temp * 10;
    temp = temp * 10;
    temp = temp * 10;

    cout << N % temp;

    return 0;
}