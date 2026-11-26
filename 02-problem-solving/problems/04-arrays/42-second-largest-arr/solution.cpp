#include <iostream>
using namespace std;

int main() {
    int N;
    cin >> N;
    int arr[100000];

    for(int i = 0; i < N; i ++) {
        cin >> arr[i];
    }

    int largest  = arr[0];

    for(int i = 0; i < N; i++) {
        if(arr[i] > largest) {
            largest = arr[i];
        }
    }

    int smallest_difference = 10000000;
    
    for(int i = 0; i < N; i++) {
        int difference = largest - arr[i];

        if(difference > 0 && smallest_difference > difference) {
            smallest_difference = difference;
        }
    }

    int second_largest = largest - smallest_difference;

    smallest_difference = 10000000;

    for(int i = 0; i < N; i++) {
        int difference = 0;
        difference = second_largest - arr[i];

        if(difference > 0 && smallest_difference > difference) {
            smallest_difference = difference;
        }
    }

    int third_largest = second_largest - smallest_difference;

    cout << third_largest;

    return 0;
}