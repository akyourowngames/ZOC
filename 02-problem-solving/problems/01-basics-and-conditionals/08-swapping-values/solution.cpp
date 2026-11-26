// #include <iostream>
// using namespace std;

// int main() {
//     int A, B, temp;

//     cin >> A >> B;

//     temp = A;
//     A = B;
//     B = temp;
//     return 0;
// }

#include <iostream>
using namespace std;

int main() {
    int A, B;

    cin >> A >> B;

    A = A + B;
    B = A - B;
    A = A - B;

    cout << A << " " << B;

    return 0;
}