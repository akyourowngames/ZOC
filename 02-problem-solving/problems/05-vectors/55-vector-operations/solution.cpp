#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v;

    int N, X, x;
    cin >> N;

    for(int i = 0; i < N; i++) {
        cin >> X;

        if(X == 1) {
            cin >> x;
            v.push_back(x);
        } else if(X == 2) {
            v.pop_back();
        } else if(X == 3) {
            cout << v.front() << endl;
            cout << v.back() << endl;
        } else if(X == 4) {
            cout << v.size();
        }
    }

    return 0;
}