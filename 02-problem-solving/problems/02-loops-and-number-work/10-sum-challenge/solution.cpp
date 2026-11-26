#include <iostream>
using namespace std;

int main() {
    int N, i, sum;

    cin >> N;
    i = 0; // 0 doesnt matter if there is <=; it can be 1 too bcs 0 doesnt matter to sum and if it is 1 without <= then it matter.
    sum = 0;

    while (i <= N) {
        sum += i;
        i++;
    }
    cout << sum;

    return 0;
}