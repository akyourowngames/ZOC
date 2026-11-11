#include <iostream>
using namespace std;

bool isPrime(int n) {
    for (int i = 2; i < n; i++) {
        if (n % i == 0) {
            return false;
        }
    }
    return true;
}

int countDivisiors(int n) {
    int counter = 0;
    for(int i = 1; i <= n; i++) {
        if(n % i == 0) {
            counter++;
        }
    }
    return counter;
}

bool isPerfect(int n) {
    int sum = 0;
    for(int i = 1; i<=n; i++) {
        if(n % i == 0) {
            sum += i;
        }
    }
    return sum - n == n;
}

int main() {
    int N;
    cin >> N;

    if (isPrime(N)) {
        cout << "true" << " ";
    } else {
        cout << "false" << " ";
    }

    cout << countDivisiors(N) << " ";

    if (countDivisiors(N)) {
        cout << "true";
    } else {
        cout << "false";
    }
    
    return 0;
}