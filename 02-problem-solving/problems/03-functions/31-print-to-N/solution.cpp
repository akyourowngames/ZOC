#include <iostream>
using namespace std;

void printNumbers(int N) {
    for(int i = 1; i <= N; i++) {
        cout << i << " ";
    }
}

int main() {
    int M;
    cin >> M;
    printNumbers(M);
    return 0;
}
