#include <iostream>
using namespace std;

int main() {
    int sum, N, arr[100];

    sum = 0;
    cin >> N;

    for(int i = 0; i < N; i++) {
        cin >> arr[i];
    }

    for(int i = 0; i < N; i++) {
        sum += arr[i];
    }

    cout << sum;

    return 0;
}