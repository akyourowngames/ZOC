#include <iostream>
using namespace std;

int main() {
    int N, arr[100], num, num_rev;
    
    cin >> N;
    num = 0;
    num_rev = 0;

    for(int i = 0; i < N; i++) {
        cin >> arr[i];
    }

    for(int i = 0; i < N; i++) {
        num = num * 10 + arr[i];
    }

    for(int i = N-1; i >= 0; i--) {
        num_rev = num_rev * 10 + arr[i];
    }

    if(num == num_rev) {
        cout << "YES";
    } else {
        cout << "NO";
    }

    return 0;
}