// #include <iostream>
// using namespace std;

// int main() {
//     int N, D, counter, digit;

//     cin >> N;
//     cin >> D;
//     counter = 0;
//     digit = 0;

//     while (N > 0) {
//         digit = N % 10;

//         if (digit == D) {
//             counter += 1;
//         }
//         N = N / 10;
//     }
//     cout << counter;
//     return 0;
// }

#include <iostream>
using namespace std;

int main() {
    int N, digit, flag;

    cin >> N;
    flag =  0;

    while (N > 0) {
        digit = N % 10;

        if (digit == 0) {
            flag = 1;
        }
        N = N / 10;
    }
    if (flag == 1) {
        cout << "YES";
    } else {
        cout << "NO";
    }
    return 0;
}