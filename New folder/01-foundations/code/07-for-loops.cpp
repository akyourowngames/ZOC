// #include <iostream>
// using namespace std;

// int main() {
//     for (int i = 1; i <= 5; i++){
//         cout << i << " ";
//     }

//     return 0;
// }

#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 10; i++) {
        if (i == 8) {
            break;
        }
        if (i % 2 == 0) {
            continue;
        }

        cout << i << " ";
    }
}