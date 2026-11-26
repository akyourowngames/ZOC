#include <iostream>
using namespace std;

int main() {
    int n, problems;

    cin >> n;
    problems = 0;

    for(int i = 0; i < n; i++) {
        int petya, vasya, tonya;
        cin >> petya >> vasya >> tonya;

        if(petya + tonya + vasya >= 2) {
            problems++;
        }
    }
    cout << problems;
    return 0;
}