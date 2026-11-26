#include <iostream>
#include <vector>

using namespace std;

int main() {
    int N, X, flag = false;

    cin >> N >> X;

    vector<int> v(N);

    for(int i = 0; i < N; i++) {
        cin >> v[i];
    }

    for(int i = 0; i < N; i++) {
        if(v[i] == X) {
            cout << "YES" << endl;
            flag = true;
            break;
        }
    }

    if(flag == false) {
        cout << "NO";
    }

    return 0;
} 