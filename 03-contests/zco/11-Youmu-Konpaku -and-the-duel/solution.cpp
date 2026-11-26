#include <iostream>
using namespace std;

int main() {
    int t;
    cin >> t;

    while(t--) {
        int health;
        cin >> health;

        for(int moves = 1;; moves++) {
            bool canDefeat = false;

            for(int attacks = 1; attacks <= moves; attacks++) {
                int charges = moves - attacks;
                long long damage;

                if(charges >= attacks - 1) {
                    damage = (long long)attacks * (2 * charges - attacks + 3) / 2;
                } else {
                    damage = (long long)(charges + 1) * (charges + 2) / 2
                           + attacks - charges - 1;
                }

                if(damage >= health) {
                    canDefeat = true;
                    break;
                }
            }

            if(canDefeat) {
                cout << moves << '\n';
                break;
            }
        }
    }
}