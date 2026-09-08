*** Settings ***
Library    Browser


*** Variables ***
${BASE_URL}    https://eyemee-demo.vercel.app/app/#dashboard


*** Keywords ***

Open EyeMee
    New Browser    chromium    headless=True
    New Page    ${BASE_URL}
    Wait For Elements State    css=#measureButton    visible    timeout=20s


Close EyeMee
    Close Browser


Sensor Should Be Connected
    Wait Until Keyword Succeeds    10s    500ms    Get Text    css=#sensorStatus    ==    CONNECTED


Sensor Should Be Disconnected
    Wait Until Keyword Succeeds    10s    500ms    Get Text    css=#sensorStatus    ==    DISCONNECTED


Disconnect Sensor
    ${action}=    Get Attribute    css=#disconnectButton    data-action

    IF    '${action}' == 'disconnect'
        Click    css=#disconnectButton
    END

    Sensor Should Be Disconnected


Connect Sensor
    ${action}=    Get Attribute    css=#disconnectButton    data-action

    IF    '${action}' == 'connect'
        Click    css=#disconnectButton
    END

    Sensor Should Be Connected


Select Left Eye
    Click    css=#leftEye
    Wait For Elements State    css=#leftEye.selected    visible    timeout=5s


Select Right Eye
    Click    css=#rightEye
    Wait For Elements State    css=#rightEye.selected    visible    timeout=5s


Start Measurement
    Wait For Elements State    css=#measureButton    enabled    timeout=10s
    Click    css=#measureButton


Measurement Result Should Be Valid
    Wait Until Keyword Succeeds    15s    500ms    Get Text    css=#measurementResult    ==    VALID


Pressure Should Be
    [Arguments]    ${expected_pressure}
    Get Text    css=#pressureValue    ==    ${expected_pressure}


Quality Should Be
    [Arguments]    ${expected_quality}
    Get Text    css=#qualityValue    ==    ${expected_quality}

Device Should Be Not Ready
    Wait Until Keyword Succeeds    10s    500ms    Get Text    css=#deviceStatus    ==    NOT READY

Measurement Button Should Be Disabled
    Wait For Elements State    css=#measureButton    disabled    timeout=10s

Sensor Quality Should Be Unavailable
    Wait Until Keyword Succeeds    10s    500ms    Get Text    css=.status-card:has(#sensorStatus) p    ==    Signal Quality: Unavailable

Calibration Button Should Be Disabled
    Wait For Elements State    css=#calibrateButton    disabled    timeout=10s