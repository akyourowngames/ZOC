#include <iostream>
#include <vector>

using namespace std;

int main() {
    int N, K;

    cin >> N >> K;
    vector<int> v(N);

    for(int i = 0; i < N; i ++) {
        cin >> v[i];
    }

    K--;
    int qualifiers = 0;

    for(int i = 0; i < N; i ++) {
        if(v[K] <= v[i] && v[i] > 0) {
            qualifiers++;
        }
    }

    cout << qualifiers;

    return 0;
}