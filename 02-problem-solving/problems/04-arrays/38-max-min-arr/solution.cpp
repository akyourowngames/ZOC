#include <iostream>
using namespace std;

int main() {
    int N, max, min;

    cin >> N;
    int arr[100]; 
    
    for(int i = 0; i < N; i++) {
        cin >> arr[i];
    }
    
        max = arr[0];
        min = arr [0];
    
    for(int i = 1; i < N; i++) {
        if(arr[i] > max) {
            max = arr[i];
        }
        
        if(arr[i] < min) {
            min = arr[i];
        }
    }

    cout << max << endl;
    cout << min;

    return 0;
}