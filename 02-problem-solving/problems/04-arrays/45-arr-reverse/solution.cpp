#include <iostream>
using namespace std;

int main() {
    int N, arr[100];

    cin >> N;

    for(int i = 0; i < N; i++) {
        cin >> arr[i];
    }

    int rev = N -1;

    for(int i = rev; i >= 0; i--) {
        cout << arr[i] << " ";   
    } 

    return 0;
}