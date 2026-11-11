#include <iostream>
using namespace std;

int maximum(int a, int b) {
    if(a > b) {
        return a;
    } else {
        return b;
    }
}

void swapNumbers(int &a, int &b) {
    int temp;
    temp = a;
    a = b;
    b = temp;
}

int main() {
    int N,M;
    cin >> N >> M;

    cout << maximum(N,M) << endl;
    swapNumbers(N,M);
    cout << N << " " << M; 
    return 0;
}