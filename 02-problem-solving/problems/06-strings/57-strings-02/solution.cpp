// #include <iostream>
// #include <string>

// using namespace std;

// int main() {
//     string str;

//     getline(cin, str);
    
//     for(int i = 0; i < str.length(); i++) {
//         cout << str[i] << endl;
//     }

//     cout << "Length of string: " << str.length();
//     return 0;
// }

#include <iostream>
#include <string>

using namespace std;

int main() {
    string str; int vowels;
    vowels = 0;
    cin >> str;

    for(int i = 0; i < str.length(); i++) {
        if((str[i] == 'a') || (str[i] =='e') || (str[i] =='i') || (str[i] =='o') || (str[i] =='u')) {
            vowels++;
        } 
    }

    cout << vowels;
    return 0;
}