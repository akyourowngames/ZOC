#include <iostream>
#include <vector>

using namespace std;

int main(){
    vector<int> v = {12, 45, 7, 89, 23, 56};

    int largest = v[0];

    for(int i = 0; i < v.size(); i++) {
        if(largest < v[i]) {
            largest = v[i];
        }
    }

    cout << largest;
    return 0;
}