*** Settings ***
Resource    ../resources/dashboard.resource

Suite Setup       Open EyeMee
Suite Teardown    Close EyeMee


*** Test Cases ***

TC-001 Sensor Disconnect And Reconnect
    Sensor Should Be Connected
    Disconnect Sensor
    Sensor Should Be Disconnected
    Connect Sensor
    Sensor Should Be Connected


TC-002 Select Left And Right Eye
    Select Left Eye
    Select Right Eye
    Select Left Eye


TC-003 Nominal Left Eye Measurement
    Connect Sensor
    Select Left Eye
    Start Measurement
    Measurement Result Should Be Valid
    Pressure Should Be    18.4
    Quality Should Be    96

TC-004 Sensor Disconnection Makes Device Not Ready
    [Documentation]    Verifies that disconnecting the sensor makes the device unavailable for measurement.
    [Tags]    SYS-REQ-004    SYS-REQ-005    SYS-REQ-008    sensor    negative

    Connect Sensor
    Sensor Should Be Connected
    Disconnect Sensor
    Sensor Should Be Disconnected
    Device Should Be Not Ready
    Measurement Button Should Be Disabled
    Sensor Quality Should Be Unavailable
    Connect Sensor
    Sensor Should Be Connected

TC-005 Calibration Is Disabled When Sensor Is Disconnected
    [Documentation]    Verifies that calibration cannot be started when the sensor is disconnected.
    [Tags]    SYS-REQ-006    calibration    negative

    Connect Sensor
    Sensor Should Be Connected
    Disconnect Sensor
    Sensor Should Be Disconnected
    Calibration Button Should Be Disabled
    Connect Sensor
    Sensor Should Be Connected