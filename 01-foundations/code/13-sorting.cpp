// #include <iostream>
// #include <algorithm>
// #include <functional>
// using namespace std;

// int main() {
//     int n;
//     cin >> n;

//     int arr[101];

//     for(int i = 0; i < n; i++) {
//         cin >> arr[i];
//     }

//     sort(arr, arr + n, greater<int>());

//     for(int i = 0; i < n; i++) {
//         cout << arr[i] << " ";
//     }

//     return 0;
// }

// #include <iostream>
// #include <vector>
// #include <algorithm>
// using namespace std;

// int main() {
//     int n;
//     cin >> n;

//     vector<int> v(n);

//     for(int i =0; i < n; i++) {
//         cin >> v[i];
//     }

//     sort(v.begin(), v.end());

//     for(int i = 0; i < n; i++) {
//         cout << v[i] << " ";
//     }

//     return 0;
// }

#include <iostream>
#include <algorithm>

using namespace std;

int main() { 
    int arr[] = {9, 5, 3, 8, 1, 7};

    sort(arr, arr + 3);

    for(int i = 0; i < 6; i++) {
        cout << arr[i] << " ";
    }

    return 0;
}