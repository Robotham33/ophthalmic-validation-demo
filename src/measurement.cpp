#include "measurement.h"

bool isPressureValid(double pressure)
{
    return pressure >= 5.0 && pressure <= 35.0;
}