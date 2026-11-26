#include <iostream>
using namespace std;

int main() {
    int N, count;

    cin >> N;
    count = 0;

    while (N > 0) {
            count += 1;
            N = N / 10;
    }
    cout << count;
    return 0;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
}