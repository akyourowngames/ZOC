#include <iostream>
using namespace std;

int main() {
    int N, revenue, max_revenue, customers;

    cin >> N;
    int arr[100];

    revenue = 0;
    max_revenue = 0;

    for(int i = 0; i < N; i++) {
        cin >> arr[i];
    }

    for(int i = 0; i < N; i++) {
        customers = 0;

    for(int j = 0; j < N; j++) {
        if(arr[j] >= arr[i]) {
            customers++;
        }
    }

    revenue = customers * arr[i];

    if(revenue > max_revenue) {
        max_revenue = revenue;
    }

    }

    cout << max_revenue;

    return 0;
}