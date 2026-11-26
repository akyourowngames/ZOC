#include <iostream>
using namespace std;

int main() {
    int N, sum, counter;

    sum = 0;
    int arr[100];
    cin >> N;
    counter = 0;

    for(int i = 0; i < N; i++) {
        cin >> arr[i]; 
        counter++;
    }

    for(int i = 0; i < N; i++) {
        sum += arr[i];
    }

    cout << sum << endl;
    
    double average = (double)sum/counter; // int round off the things 

    cout << average;

    return 0;
}