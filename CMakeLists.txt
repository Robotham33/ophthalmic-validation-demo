cmake_minimum_required(VERSION 3.14)

project(ophthalmic_validation_demo)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)

FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/tags/v1.15.2.zip
)

FetchContent_MakeAvailable(googletest)

add_library(measurement
    src/measurement.cpp
)

target_include_directories(measurement PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/src
)

enable_testing()

add_executable(measurement_test
    tests/measurement_test.cpp
)

target_link_libraries(measurement_test
    measurement
    GTest::gtest_main
)

include(GoogleTest)

gtest_discover_tests(measurement_test)