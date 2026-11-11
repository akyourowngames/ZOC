// #include <iostream>
// using namespace std;

// int main() {
//     int n;

//     cout << "Enter your integer: ";

//     cin >> n;
//     int output = n * 2;
//     cout << "Answer: " << output;
//     return 0;
// }

// #include <iostream>
// using namespace std;

// int main() {
//     int length;
//     int width;

//     cout << "Enter your length: ";
//     cin >> length;    
//     cout << "Enter your width: ";
//     cin >> width;

//     int area = length * width;
//     cout << "You area is: " << area;
    //    return 0;

// }

// #include <iostream>

// using namespace std;

// int main() {
//     int num;
//     cout << "Enter your long number here: ";

//     cin >> num;
//     cout << "Your number is: " << num;
//     return 0;
// }

// #include <iostream>

// using namespace std;

// int main() {
//     long long a;
//     long long b;

//     cin >> a >> b;

//     long long product = a * b;

//     cout << product;

//     return 0;
// }

#include <iostream>

using namespace std;

int main() {
    int a;
    int b;

    cin >> a;
    cin >> b;

    cout << "Multiplication: " << a * b << endl;
    cout << "Division: " << b / a << endl;
    cout << "Difference: " << b - a << endl;
    cout << "Sum: " << a + b << endl;
    cout << "Remainder: " << b % a;

    return 0;
}