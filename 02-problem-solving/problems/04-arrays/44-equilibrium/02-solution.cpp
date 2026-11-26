#include <iostream>
using namespace std;

int main() {
    int N, sum_left, sum_right, arr[100];

    cin >> N;

    sum_left = 0;
    sum_right = 0;

    for(int i = 0; i < N; i++) {
        cin >> arr[i];
    }

    for(int i = 0; i < N; i++) {
        sum_right = 0;
        sum_left = 0;
        for(int j = 0; j < i; j++) {
            sum_left += arr[j];
        }

        for(int j = i+1; j < N; j++) {
            sum_right += arr[j];
        }

        if(sum_left == sum_right) {
            cout << i;
        }
    }


    return 0;
}