#include <iostream>
using namespace std;

int main() {
    int positives, N, negatives, evens, odds, zeroes;

    cin >>N;
    int arr[100];
    
    positives = 0;
    negatives = 0;
    evens = 0;
    odds= 0;
    zeroes = 0;

    for(int i = 0; i < N; i++) {
        cin >> arr[i];
    }

    for(int i = 0; i < N; i++) {

        int num = arr[i];

        if(num > 0) {
            positives++;
        }

        if(num < 0) {
            negatives++;
        }

        if(num % 2 == 0) {
            evens++;
        }

        if(num % 2 != 0) {
            odds++;
        }

        if(num == 0) {
            zeroes++;
        }
    }

    cout << "Positive: " << positives << endl;
    cout << "Negative: " << negatives << endl;
    cout << "Even: " << evens << endl;
    cout << "Odd: " << odds << endl;
    cout << "Zeroes: " << zeroes;

    return 0;
}