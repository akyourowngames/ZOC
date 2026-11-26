#include <iostream>
#include <algorithm>

using namespace std;

int main() {
    int N;
    cin >> N;

    int arr[101];

    for(int i = 0; i < N; i++) {
        cin >> arr[i];
    }

    sort(arr, arr + N);

    int smallest = arr[0];
    int largest = arr[N - 1];

    cout << "Smallest: " << smallest << endl;
    cout << "Largest: " << largest;
}