#include <gtest/gtest.h>
#include "measurement.h"

TEST(PressureTest, NormalValue)
{
    EXPECT_TRUE(isPressureValid(18.0));
}

TEST(PressureTest, TooLow)
{
    EXPECT_FALSE(isPressureValid(2.0));
}

TEST(PressureTest, TooHigh)
{
    EXPECT_FALSE(isPressureValid(40.0));
}

TEST(PressureTest, LowerBoundary)
{
    EXPECT_TRUE(isPressureValid(5.0));
}

TEST(PressureTest, JustBelowLowerBoundary)
{
    EXPECT_FALSE(isPressureValid(4.99));
}

TEST(PressureTest, UpperBoundary)
{
    EXPECT_TRUE(isPressureValid(35.0));
}

TEST(PressureTest, JustAboveUpperBoundary)
{
    EXPECT_FALSE(isPressureValid(35.01));
}