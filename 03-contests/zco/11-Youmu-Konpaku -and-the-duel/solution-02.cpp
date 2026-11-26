#include <iostream>
using namespace std;

int main() {
    int t;
    cin >> t;

    while(t--) {
        long long health;
        cin >> health;

        long long ans = 2 * health;

        for(long long charges = 0; charges <= health; charges++) {

            long long low = 1, high = health;
            
            while(low < high) {
                long long attacks = (low + high) / 2;

                long long damage;

                if(attacks <= charges) {
                    damage = attacks * (2 * charges - attacks + 3) / 2;
                }
                else {
                    damage = charges * (charges + 3) / 2
                           + attacks - charges;
                }

                if(damage >= health)
                    high = attacks;
                else
                    low = attacks + 1;
            }

            ans = min(ans, charges + low);
        }

        cout << ans << '\n';
    }
}