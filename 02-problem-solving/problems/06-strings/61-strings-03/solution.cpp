// #include <iostream>
// #include <string>

// using namespace std;

// int main() {
//     string str;
//     getline(cin, str);

//     for(int i = 0; i < str.length(); i++) {
//         str[i] = toupper(static_cast<unsigned char>(str[i]));
//     }

//     cout << str;
//     return 0;
// }

// #include <iostream>
// #include <string>

// using namespace std;

// int main() {
//     string str;

//     getline(cin, str);

//     for(int i = 0; i < str.length(); i++) {
//         str[i] = tolower(static_cast<unsigned char>(str[i]));
//     }

//     cout << str;
//     return 0;
// }


#include <iostream>
#include <string>

using namespace std;

int main() {
    string str;
    
    getline(cin, str);

    for(int i = 0; i < str.length(); i++) {
        if('A' <= str[i] && str[i] <= 'Z') {
            str[i] = tolower(static_cast<unsigned char>(str[i]));
        } else if ('a' <= str[i] && str[i] <= 'z') {
            str[i] = toupper(static_cast<unsigned char>(str[i]));
        }
    }

    cout << str;

    return 0;
}