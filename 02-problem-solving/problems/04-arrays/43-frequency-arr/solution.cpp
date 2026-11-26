#include <iostream>
using namespace std;

int main() {
    int N, counter, X;

    cin >> N >> X;
    int arr[100];
    counter = 0;

    for(int i = 0; i < N; i++) {
        cin >> arr[i];
    } 

    
    for(int i = 0; i < N; i++) {
        if(arr[i] == X) { 
            counter++;
        }
    }

    cout << counter;
    return 0;
}