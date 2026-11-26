#include <iostream>
#include <string>

using namespace std;

int main() {
    string str; int uppercase, lowercase, digits;

    uppercase = 0;
    lowercase = 0;
    digits = 0;

    cin >> str;

    for(int i = 0; i < str.length(); i ++) {
        if(str[i] >= 'A' && str[i] <= 'Z') {
            uppercase++;
        }

        if(str[i] >= 'a' && str[i] <= 'z') {
            lowercase++;
        }

        if(str[i] >= '0' && str[i] <= '9') {
            digits++;
        }
    }

    cout << "Uppercase: " << uppercase << endl;
    cout << "Lowercase: " << lowercase << endl;
    cout << "Digits: " << digits;

    return 0;
}