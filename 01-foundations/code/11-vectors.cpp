// #include <iostream>
// #include <vector>
// using namespace std;

// int main() {
//     vector<int> v;

//     v.push_back(10);
//     v.push_back(20);
//     v.push_back(30);

//     cout << v.size() << endl;

//     for(int i = 0; i < v.size(); i++) {
//         cout << v[i] << " ";
//     }
// }

#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {10, 20 , 30, 40};
    vector<int> z(5, 0);

    v.pop_back();
    cout << v.front() << endl;
    cout << v.back() << endl;

    v.clear();
    cout << v.size() << endl;

    v[0] = 20;

    cout << v.front();
    cout << v.at(1);
}