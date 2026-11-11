#include <iostream>
using namespace std;

int main() {
    int N, digit, sum;

    cin >> N; // N = 5329

    while(N >= 10) {

        sum = 0;

        while(N > 0) {
        digit = N % 10;  
        sum += digit;
        N = N / 10;
    }

    N = sum;
    
    }
    cout << N;
    return 0;
}