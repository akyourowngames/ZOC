#include <iostream>
#include <vector>

using namespace std;

int main() {
    int N, evens, odds;

    cin >> N;
    evens = 0;
    odds = 0;

    vector<int> v(N);
    for(int i = 0; i < v.size(); i++) {
        cin >> v[i];
    }

    for(int i = 0; i < N; i++) {
        if(v[i] % 2 == 0) {
            evens += 1;
        } else {
            odds += 1;
        }
    }

    cout << evens << endl;
    cout << odds;

    return 0;
}