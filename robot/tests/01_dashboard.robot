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