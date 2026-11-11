#include <iostream>
using namespace std;

int sumDigits(int n) {
    int sum = 0;
    int digit;

    for(int i = 1; n > 0; i++) {
        digit = n % 10;
        sum += digit;
        n /= 10;
    }
    return sum;
}

int reverseNumber(int n) {
    int reverse,digit;

    reverse = 0;

    for(int i = 1; n > 0; i++) {
        digit = n % 10;
        reverse = reverse * 10 + digit;
        n /= 10;
    }
    return reverse;
}

bool isPalindrome(int n) {
    int reverse, digit;

    int original = n;
    reverse = 0;

    for(int i = 1; n > 0; i++) {
        digit = n % 10;
        reverse = reverse * 10 + digit;
        n /= 10;
    }

    return original == reverse;
}

int main() {
    int N;

    cin >> N;

    cout << sumDigits(N) << endl;
    cout << reverseNumber(N) << endl;
    
    if(isPalindrome(N)) {
        cout << "true";
    } else {
        cout << "false";
    }

    return 0;
}