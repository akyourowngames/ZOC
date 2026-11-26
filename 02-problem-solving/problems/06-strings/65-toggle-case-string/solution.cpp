#include <iostream>
#include <string>

using namespace std;

int main() {
    string S;

    cin >> S;

    for(int i = 0; i < S.length(); i++) {

        if('A' <= S[i] && S[i] <= 'Z') {
            S[i] = tolower(static_cast<unsigned char>(S[i]));
        } else if('a' <= S[i] && S[i] <= 'z') {
            S[i] = toupper(static_cast<unsigned char>(S[i]));
        }
    }

    cout << S;
    return 0;
}