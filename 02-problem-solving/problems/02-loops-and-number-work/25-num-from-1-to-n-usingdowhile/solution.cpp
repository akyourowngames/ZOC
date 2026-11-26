#include <iostream>
using namespace std;

int main() {
    int N,i;
    cin >> N;
    i = 1;

    do {
        cout << i << " ";
        if (N == 0){
            i = 0;
        }
        i++;
    } while (i <= N);
}