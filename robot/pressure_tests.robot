*** Settings ***
Library    ../python/pressure_library.py

*** Keywords ***
Pressure Should Be Valid
    [Arguments]    ${pressure}
    ${result}=    Analyze Pressure    ${pressure}
    Should Be Equal    ${result}    VALID

Pressure Should Be Invalid
    [Arguments]    ${pressure}
    ${result}=    Analyze Pressure    ${pressure}
    Should Be Equal    ${result}    INVALID

*** Test Cases ***
Nominal Pressure
    Pressure Should Be Valid    18

Lower Boundary
    Pressure Should Be Valid    5

Upper Boundary
    Pressure Should Be Valid    35

Too Low Pressure
    Pressure Should Be Invalid    2

Too High Pressure
    Pressure Should Be Invalid    40