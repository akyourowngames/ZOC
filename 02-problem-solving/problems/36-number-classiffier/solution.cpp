// #include <iostream>
// using namespace std;

// bool isPositive(int n) {
//     return n > 0;
// }

// bool isEven(int n) {
//     return n % 2 == 0;
// }

// bool isDivisibleBy5(int n) {
//     return n % 5 == 0;
// }

// int countProperties(int n) {
//     int counter = 0;

//     if (isPositive(n)) {
//         counter++;
//     }

//     if (isEven(n)) {
//         counter++;
//     }

//     if (isDivisibleBy5(n)) {
//         counter++;
//     }

//     return counter;
// }

// int main(){
//     int N;
//     cin >> N;

//     cout << countProperties(N);
//     return 0;
// }


#include <iostream>
using namespace std;

bool isPositive(int n) {
    return n > 0;
}

bool isEven(int n) {
    return n % 2 == 0;
}

bool isValid(int n) {
    return isPositive(n) && isEven(n);
}

bool isDivisibleBy5(int n) {
    return n % 5 == 0;
}

int countProperties(int n) {
    int counter = 0;

    if (isValid(n)) {
        counter++;
    }

    if (isDivisibleBy5(n)) {
        counter++;
    }

    return counter;
}

int main(){
    int N;
    cin >> N;

    cout << countProperties(N);
    return 0;
}