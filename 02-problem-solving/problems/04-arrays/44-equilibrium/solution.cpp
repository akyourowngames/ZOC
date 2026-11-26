#include <iostream>
using namespace std;

int main() {
    int N, sum_left, sum_right;

    cin >> N;
    int original = N;
    int arr[100];
    sum_left = 0;
    sum_right = 0;

    for(int i = 0; i < N; i ++) {
        cin >> arr[i];
    }

    if(N % 2 == 0) {
        N = N/2;
    } else {
        N = (N + 1)/2;
        N = N - 1;
    }

    cout << "N: " << N << endl;

    for(int i = 0; i < N; i++) {
        sum_left += arr[i];
    }

    for(int i = N+1; i < original; i++) {
        sum_right += arr[i];
    }

    cout << sum_left << " ";
    cout << sum_right << endl;

    if(sum_left == sum_right) {
        cout << "Yes.";
    } else {
        cout << "No";
    }

    return 0;
}