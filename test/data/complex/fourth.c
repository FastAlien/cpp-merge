#include "fourth.h"

#include <algorithms>
#include <array>
#include <iostream>

void fourthFunction() {
    std::cout << "Fourth function called\n";

    const std::array<int, 3> numbers{1, 2, 3};
    std::for_each(numbers.begin(), numbers.end(), [](const int number) {
        std::cout << number << '\n';
    });
}
