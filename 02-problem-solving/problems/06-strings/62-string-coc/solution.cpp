// #include <iostream>
// #include <string>

// using namespace std;

// int main() {
//     string first_word, second_word;

//     cin >> first_word >> second_word;

//     string word = first_word + " " + second_word;

//     cout << word;

//     return 0;
// }

#include <iostream>
#include <string>

using namespace std;

// int main() {
//     string input;
//     cin >> input;

//     input += "2026";

//     cout << input;

//     return 0;
// }

// int main() {
//     string str = "IO";

//     str.push_back('I');
//     str.push_back('T');

//     cout << str << endl;

//     string input;
//     cin >> input;

//     input.pop_back();
//     input.push_back('X');

//     cout << input ;


//     return 0;
// }

// int main() {
//     string first, second;

//     cin >> first >> second;

//     if(first == second) {
//         cout << "EQUAL";
//     } else {
//         cout << "NOT EQUAL";
//     }

//     return 0;
// }

// int main() {
//     string str;
//     char chr;

//     cin >> str >> chr;

//     if(str.find(chr) == string::npos) {
//         cout << "NOT FOUND";
//     } else {
//         cout << "FOUND";
//     }
// }

// int main() {
//     string str;

//     cin >> str;

//     cout << str.substr(0, 3);

//     return 0;
// }

int main() {
    string str;

    cin >> str;

    str.erase(0, 2);
    str += "IOI";

    cout << str;
    return 0;
}