// #include <iostream>
// using namespace std;

// int main() {
//     int marks[5] = {85, 92, 101, 100, 105};

//     cout << marks[1] << endl;
//     marks[1] = 100;
//     cout << marks[1] << endl;
// }

// letting user doing his will things

#include <iostream>
using namespace std;

int main() {
    int arr[5];

    for(int i = 0; i < 5; i++) {
        cin >> arr[i];
    }

    for(int i = 0; i < 5; i++) {
        cout << arr[i] << " ";
    }

    return 0;
}