#include <iostream>
using namespace std;

int main() {
    long long N;
    long long K;

    cin >> N >> K;

    if (N % K == 0) {
        cout << "YES";
    } else {
        cout << "NO";
    }
    return 0;
}