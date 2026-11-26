#include <iostream>
#include <vector>

using namespace std;

int main() {
    vector<int> v = {10, 25, 10, 40, 10, 50, 25};

    int count = 0;

    for(int i = 0; i < v.size(); i++) {
        if(v[i] == 10) {
            count += 1;
        }
    }

    cout << count;
    return 0;
}