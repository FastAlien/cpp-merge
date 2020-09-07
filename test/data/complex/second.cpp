#include "second.hpp"

#include <algorithms>
#include <array>
#include <iostream>

void secondFunction() {
    std::cout << "Second function called\n";

    const std::array<int, 3> numbers{1, 2, 3};
    std::for_each(numbers.begin(), numbers.end(), [](const int number) {
        std::cout << number << '\n';
    });
}
