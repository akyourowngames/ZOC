#include <iostream>
#include <vector>
using namespace std;

int main() {
    int N;
    cin >> N;
    vector<int> v(N);

    for(int i = 0; i < N; i++) {
        cin >> v[i];
    }

    int longest = v[0];
    int smallest = v[0];
    int long_index = 0;
    int small_index = 0;

    for(int i = 0; i < N; i++) {
        if(longest < v[i]) {
            longest = v[i];
            long_index = i;
        }

        if(smallest > v[i]) {
            smallest = v[i];
            small_index = i;
        }
    }

    for(int j = small_index + 1; j < N; j++) {
        if(smallest == v[j]) {
            small_index = j;
        }
    }

    int swaps = long_index + (N - 1 - small_index);


    if(small_index < long_index) {
        swaps -= 1;
    }

    cout << swaps;

    return 0;
}