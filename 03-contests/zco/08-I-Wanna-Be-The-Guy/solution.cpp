#include <iostream>

using namespace std;

int main() {
    int levels, p ,q;

    cin >> levels;

    bool lvl[101] = {false};

    cin >> p;

    for(int i = 0; i < p; i++) {
        int temp;
        cin >> temp;

        lvl[temp] = true;
    }

    cin >> q;

    for(int i = 0; i < q; i++) {
        int temp;
        cin >> temp;

        lvl[temp] = true;
    }

    bool isPassed = true;

    for(int i = 1; i <= levels; i++) {
        if(lvl[i] == false) {
            isPassed = false;
        }
    }

    if(isPassed) {
        cout << "I become the guy.";
    } else {
        cout << "Oh, my keyboard!";
    }

    return 0;
}


