def analyze_pressure(pressure):
    pressure = float(pressure)

    if 5.0 <= pressure <= 35.0:
        return "VALID"

    return "INVALID"