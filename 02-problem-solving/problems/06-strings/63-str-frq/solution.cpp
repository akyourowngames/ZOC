#include <iostream>
#include <string>

using namespace std;

int main() {
    string S;
    char C;
    getline(cin, S);
    cin >> C;

    int times = 0;

    for(int i = 0; i < S.length(); i++) {
        if(S[i] == C) {
            times++;
        }
    }

    cout << times;

    return 0;
}