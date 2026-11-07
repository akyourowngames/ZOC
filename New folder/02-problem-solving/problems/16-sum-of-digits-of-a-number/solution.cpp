// #include <iostream>
// using namespace std;

// int main() {
//     int N, sum, temp;

//     cin >> N;
//     sum = 0;
//     temp = 0; 

//     while (N > 0) {
//         temp = N % 10;
//         sum += temp;

//         N = N / 10;
//     }
//     cout << sum;
//     return 0;
// }

#include <iostream>
using namespace std;

int main() {
    int N, sum;

    cin >> N;
    sum = 0;

    while (N > 0) {
        sum += N % 10;
        N = N / 10;
    }
    cout << sum;
    return 0;
}