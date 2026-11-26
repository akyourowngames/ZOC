#include <iostream>
#include <string>

using namespace std;

int main() {
    int N;
    cin >> N;

    int arr[101];

    for(int i = 0; i < N; i++) {
        cin >> arr[i];
    }

    int freq[101];

    for(int i = 0; i < N; i++) {
        freq[arr[i]]++;
    }
    return 0;
}