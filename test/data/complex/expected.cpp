#include <algorithms>
#include <array>
#include <iostream>

void fourthFunction();

void secondFunction();

void thirdFunction();

inline void firstFunction() {
    std::cout << "First function called\n";
    secondFunction();
    thirdFunction();
    fourthFunction();
}

int main(int argc, const char* argv[]) {
    std::cout << "Main function called\n";
    firstFunction();
    return 0;
}

void fourthFunction() {
    std::cout << "Fourth function called\n";

    const std::array<int, 3> numbers{1, 2, 3};
    std::for_each(numbers.begin(), numbers.end(), [](const int number) {
        std::cout << number << '\n';
    });
}

void secondFunction() {
    std::cout << "Second function called\n";

    const std::array<int, 3> numbers{1, 2, 3};
    std::for_each(numbers.begin(), numbers.end(), [](const int number) {
        std::cout << number << '\n';
    });
}

void thirdFunction() {
    std::cout << "Third function called\n";

    const std::array<int, 5> numbers{1, 2, 3, 4, 5};
    std::for_each(numbers.begin(), numbers.end(), [](const int number) {
        std::cout << number << '\n';
    });
}
