#include <iostream>
using namespace std;

int main() {
    int N;
    cin >> N;

    if (N % 2 == 0) {
        cout << "N is even.";
    } else {
        cout << "N is odd.";
    }
    return 0;
}