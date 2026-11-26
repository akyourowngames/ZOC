#include <iostream>
#include <string>

using namespace std;

int main() {
    string country = "India";

    cout << country << endl;

    string word = "PROGRAMMING";
    cout << word[0] << endl;
    cout << word[2] << endl;
    cout << word[10] << endl;

    string new_word;
    cin >> new_word;
    cout << new_word[0] << endl;
    cout << new_word[-1];
}