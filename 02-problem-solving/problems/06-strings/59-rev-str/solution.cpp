#include <iostream>
#include <string>

using namespace std;

int main() {
    string str;

    cin >> str;
    int str_len = str.length();

    for(int i = str_len - 1; i >= 0; i--) {
        cout << str[i];
    }

    return 0;
}