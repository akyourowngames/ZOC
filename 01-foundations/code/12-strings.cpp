// #include <iostream>
// #include <string>

// using namespace std;

// int main() {
//     // string name = "Krish verma";

//     string name;

//     cin >> name;
//     cout << name << endl;

//     getline(cin , name);
//     cout << name << endl;

//     cout << name[0];
//     return 0;
// }

// #include <iostream>
// #include <string>

// using namespace std;

// int main() {
//     string str = "PROGRAMMING";
//     int last_index = str.length() - 1;
//     str[0] = 'C';
//     str[last_index] = 'G';
//     str[2] = 'X';
//     cout << str;

//     return 0;
// }

#include <iostream>
#include <string>

using namespace std;

int main() {
    string first = "Hello";
    // string second = "World";

    first += " World";

    first += "K";

    cout << first;

    return 0;
}