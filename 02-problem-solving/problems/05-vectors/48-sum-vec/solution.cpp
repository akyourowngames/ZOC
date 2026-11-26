#include <iostream>
#include <vector>

using namespace std;

int main() {
    vector<int> v = {5, 10, 15, 20, 25};

    int sum = 0;

    for(int i = 0; i < v.size(); i++) {
        sum += v[i];
    }

    cout << sum;
    return 0;
}