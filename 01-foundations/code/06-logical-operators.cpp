#include <iostream>
using namespace std;

int main() {
    int A = 5, B = 10, C = 15;

    cout << ((A < B) && (B < C)) << endl;
    cout << ((A > B) || (B < C)) << endl;
    cout << (A > B) && (B < C);
}