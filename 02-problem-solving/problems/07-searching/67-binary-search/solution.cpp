#include <iostream>

using namespace std;

int main() {
    int n;
    int arr[101];

    bool isfound = false;

    cin >> n;

    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    int low = 0;
    int high = n - 1;

    int target;

    cin >> target;

    while(low <= high) {
        int mid = low + (high - low) / 2;

        if(arr[mid] == target) {
            isfound = true;
            break;
        } 

        else if(arr[mid] < target) {
            low = mid + 1;
        }

        else {
            high = mid - 1;
        }
    }

    if(isfound) {
        cout << "FOUND";
    } else {
        cout << "NOT FOUND";
    }

    return 0;
}