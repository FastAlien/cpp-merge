#include "third.hpp"

#include <algorithms>
#include <array>
#include <iostream>

void thirdFunction() {
    std::cout << "Third function called\n";

    const std::array<int, 5> numbers{1, 2, 3, 4, 5};
    std::for_each(numbers.begin(), numbers.end(), [](const int number) {
        std::cout << number << '\n';
    });
}
