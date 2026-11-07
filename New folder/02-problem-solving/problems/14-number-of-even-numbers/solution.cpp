#include <iostream>
using namespace std;

int main() {
    int N,i, num;

    cin >> N;
    i = 1;
    num = 0;

    while (i <= N) {
        if (i % 2 == 0) {
            num += 1;
        } else {
            num = num;
        }
        i++;
    }
    cout << num;
    return 0;
}