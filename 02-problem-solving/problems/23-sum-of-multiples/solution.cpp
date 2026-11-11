#include <iostream>
using namespace std;

int main() {
    int N, K, sum;

    cin >> N >> K;
    sum = 0;

    for(int i = K; i <= N; i += K) {
        sum += i;
    }
    cout << sum;
    return 0;
}