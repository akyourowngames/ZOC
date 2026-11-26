#include <iostream>
#include <vector>
using namespace std;

int main() {
    int N; 
    
    cin >> N;
    vector<int> v(N);
    
    for(int i = 0; i < N; i ++) {
        cin >> v[i];
    }

    int smallest = v[0];

    for(int i = 0; i < v.size(); i++) {
        if(smallest > v[i]) {
            smallest = v[i];
        }
    }
    cout << smallest;
    return 0;
}