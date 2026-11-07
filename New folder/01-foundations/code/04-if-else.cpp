#include <iostream>

using namespace std;

int main() {
    int age;
    cin >> age;

    if (age >= 18) {
        cout << "You are Eligible";
    }
    else {
        cout << "Not Eligible";
    }

    return 0;
}