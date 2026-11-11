#include <iostream>
using namespace std;

int square(int N) {
    return N * N;
}

int main() {
    int M;
    cin >> M;

    cout << square(M);
}