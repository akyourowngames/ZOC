#include <iostream>
#include <string>

using namespace std;

int main() {
    string S,T;

    cin >> S >> T;

    int start = S.find(T);

    if(start == string::npos) {
        cout << "NOT FOUND";
    } else {
        bool isfound = true;

        for(int i = 0; i < T.length(); i++) {
            
        }
    }


    return 0;

}