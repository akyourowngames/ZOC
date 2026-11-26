#include <iostream>

using namespace std;

int main() {
    int n, k;

    cin >> n >> k;

    for(int i = 0; i < k; i++) {
        int digit = n % 10;

        if(digit == 0) {
            n = n / 10;
        } else {
            n -= 1;
        }
    }

    cout << n;

    return 0;
}