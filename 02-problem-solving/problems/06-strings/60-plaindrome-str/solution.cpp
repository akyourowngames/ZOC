// #include <iostream>
// #include <string>

// using namespace std;

// int main() {
//     string str;

//     cin >> str;

//     int end = str.length() - 1;
//     bool isPlaindrome = true;

//     for(int i = 0; i < end; i++) {
//         if(str[i] != str[end]) {
//             isPlaindrome = false;
//             break;
//         }
//         end--;
//     }

//     if(isPlaindrome) {
//         cout << "YES";
//     } else {
//         cout << "NO";
//     }
//     return 0;
// }

// #include <iostream>
// #include <string>

// using  namespace std;

// int main() {
//     string str;
//     getline(cin, str);

//     bool isPalindrome = true;
//     int end = str.length() - 1;

//     for(int i = 0; i < str.length(); i++) {
//         if(str[i] != str[end]) {
//             isPalindrome = false;
//             break;
//         }
//         end --;
//     }

//     if(isPalindrome) {
//         cout << "YES";
//     } else {
//         cout << "NO";
//     }

//     return 0;
// }

#include <iostream>
#include <string>

using namespace std;

int main() {
    string str;
    string palindrome;
    getline(cin , str);

    for(int i = str.length() - 1; i >= 0; i--) {
        palindrome.push_back(str[i]);
    }

    if(str == palindrome) {
        cout << "YES";
    } else {
        cout << "NO";
    }

    return 0;
}