/* =========================================================
   EYEMEE - FRONTEND CONTROLLER
   ========================================================= */

let currentState = null;


/* =========================================================
   BACKEND URL
   Frontend : 8000
   Backend  : 8001
   ========================================================= */

function getBackendBaseUrl() {

    const hostname = window.location.hostname;

    if (hostname.endsWith(".app.github.dev")) {

        const backendHostname = hostname.replace(
            /-8000(?=\.app\.github\.dev$)/,
            "-8001"
        );

        return `${window.location.protocol}//${backendHostname}`;
    }

    return `${window.location.protocol}//${hostname}:8001`;
}


const API_BASE_URL = getBackendBaseUrl();


/* =========================================================
   API
   ========================================================= */

async function getDeviceStatus() {

    const response = await fetch(
        `${API_BASE_URL}/api/status`
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
}


async function sendSensorCommand(command) {

    const response = await fetch(
        `${API_BASE_URL}/api/sensor/${command}`,
        {
            method: "POST"
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
}


/* =========================================================
   LOAD DEVICE
   ========================================================= */

async function loadDeviceStatus() {

    try {

        currentState = await getDeviceStatus();

        updateDashboard(currentState);

    }
    catch (error) {

        console.error(
            "EyeMee backend connection failed:",
            error
        );

        const message =
            document.getElementById("systemMessage");

        if (message) {

            message.innerHTML =
                "Unable to communicate with EyeMee backend.<br>" +
                "Check backend connection.";

        }
    }
}


/* =========================================================
   GLOBAL DASHBOARD UPDATE
   ========================================================= */

function updateDashboard(state) {

    updateSensor(state);
    updateCalibration(state);
    updateDeviceStatus(state);
    updateBattery(state);
    updateTemperature(state);
    updatePatient(state);
    updateEyeSelection(state);
    updateSystemMessage(state);

}


/* =========================================================
   SENSOR
   ========================================================= */

function updateSensor(state) {

    const sensorStatus =
        document.getElementById("sensorStatus");

    const sidebarStatus =
        document.getElementById(
            "sensorSidebarStatus"
        );

    const qualityBar =
        document.getElementById(
            "sensorQualityBar"
        );

    const sensorButton =
        document.getElementById(
            "disconnectButton"
        );

    const sensorCard =
        sensorStatus.closest(".status-card");

    const qualityText =
        sensorCard.querySelector("p");


    if (state.sensor_connected) {

        sensorStatus.textContent =
            "CONNECTED";

        sidebarStatus.textContent =
            "● CONNECTED";

        sensorStatus.style.color =
            "#079c49";

        sidebarStatus.style.color =
            "#29dc77";


        qualityText.innerHTML =
            `Signal Quality: <b>${getQualityLabel(state.sensor_quality)}</b>`;


        qualityBar.style.width =
            `${state.sensor_quality}%`;


        sensorButton.innerHTML =
            "<i class='bx bx-unlink'></i> Disconnect";

        sensorButton.dataset.action =
            "disconnect";

        sensorButton.classList.remove(
            "connect-mode"
        );

        sensorButton.classList.add(
            "disconnect-mode"
        );

    }
    else {

        sensorStatus.textContent =
            "DISCONNECTED";

        sidebarStatus.textContent =
            "● DISCONNECTED";

        sensorStatus.style.color =
            "#ef4d5e";

        sidebarStatus.style.color =
            "#ff6676";


        qualityText.innerHTML =
            "Signal Quality: <b>Unavailable</b>";


        qualityBar.style.width =
            "0%";


        sensorButton.innerHTML =
            "<i class='bx bx-link'></i> Connect";

        sensorButton.dataset.action =
            "connect";

        sensorButton.classList.remove(
            "disconnect-mode"
        );

        sensorButton.classList.add(
            "connect-mode"
        );

    }

}


function getQualityLabel(value) {

    if (value >= 90) {
        return "Excellent";
    }

    if (value >= 70) {
        return "Good";
    }

    if (value >= 40) {
        return "Poor";
    }

    return "Unavailable";

}


/* =========================================================
   DEVICE STATUS
   ========================================================= */

function updateDeviceStatus(state) {

    const deviceStatus =
        document.getElementById(
            "deviceStatus"
        );

    const headerStatus =
        document.getElementById(
            "headerDeviceStatus"
        );

    const measureButton =
        document.getElementById(
            "measureButton"
        );

    const calibrateButton =
        document.getElementById(
            "calibrateButton"
        );

    const deviceCard =
        deviceStatus.closest(".status-card");

    const deviceMessage =
        deviceCard.querySelector("p");

    const statusIcon =
        deviceCard.querySelector(
            ".status-check"
        );


    const displayStatus =
        state.device_status.replaceAll(
            "_",
            " "
        );


    deviceStatus.textContent =
        displayStatus;

    headerStatus.textContent =
        `● ${displayStatus}`;


    if (state.device_status === "READY") {

        deviceStatus.style.color =
            "#079c49";

        headerStatus.style.color =
            "#079c49";

        deviceMessage.textContent =
            "System operational";


        statusIcon.classList.remove(
            "status-error"
        );

        statusIcon.classList.add(
            "status-ok"
        );

        statusIcon.innerHTML =
            "<i class='bx bx-check'></i>";

    }
    else {

        deviceStatus.style.color =
            "#ef4d5e";

        headerStatus.style.color =
            "#ef4d5e";


        if (!state.sensor_connected) {

            deviceMessage.textContent =
                "Sensor unavailable";

        }
        else {

            deviceMessage.textContent =
                "Device not ready";

        }


        statusIcon.classList.remove(
            "status-ok"
        );

        statusIcon.classList.add(
            "status-error"
        );

        statusIcon.innerHTML =
            "<i class='bx bx-x'></i>";

    }


    /*
       Buttons unavailable when
       sensor is disconnected.
    */

    const unavailable =
        !state.sensor_connected;


    measureButton.disabled =
        unavailable;

    calibrateButton.disabled =
        unavailable;


    measureButton.classList.toggle(
        "disabled-control",
        unavailable
    );

    calibrateButton.classList.toggle(
        "disabled-control",
        unavailable
    );

}


/* =========================================================
   CALIBRATION
   ========================================================= */

function updateCalibration(state) {

    const calibrationStatus =
        document.getElementById(
            "calibrationStatus"
        );


    if (state.calibrated) {

        calibrationStatus.textContent =
            "CALIBRATED";

        calibrationStatus.style.color =
            "#079c49";

    }
    else {

        calibrationStatus.textContent =
            "REQUIRED";

        calibrationStatus.style.color =
            "#f59e0b";

    }

}


/* =========================================================
   SYSTEM MESSAGE
   ========================================================= */

function updateSystemMessage(state) {

    const message =
        document.getElementById(
            "systemMessage"
        );


    if (!state.sensor_connected) {

        message.innerHTML =
            "Sensor disconnected.<br>" +
            "Reconnect sensor to continue.";

        return;

    }


    if (!state.calibrated) {

        message.innerHTML =
            "Device ready.<br>" +
            "Calibration required to start a measurement.";

        return;

    }


    message.innerHTML =
        "Device ready.<br>" +
        "System operational.";

}


/* =========================================================
   BATTERY
   ========================================================= */

function updateBattery(state) {

    const batteryValue =
        document.getElementById(
            "batteryValue"
        );

    const batteryProgress =
        document.getElementById(
            "batteryProgress"
        );


    batteryValue.textContent =
        `${state.battery_level}%`;


    batteryProgress.style.width =
        `${state.battery_level}%`;

}


/* =========================================================
   TEMPERATURE
   ========================================================= */

function updateTemperature(state) {

    const temperature =
        document.getElementById(
            "temperatureValue"
        );


    temperature.textContent =
        `${state.temperature} °C`;

}


/* =========================================================
   PATIENT
   ========================================================= */

function updatePatient(state) {

    const patient =
        document.getElementById(
            "patientId"
        );


    patient.value =
        state.patient_id ?? "";

}


/* =========================================================
   EYE
   ========================================================= */

function updateEyeSelection(state) {

    const left =
        document.getElementById(
            "leftEye"
        );

    const right =
        document.getElementById(
            "rightEye"
        );


    const leftImage =
        left.querySelector(
            ".eye-image"
        );

    const rightImage =
        right.querySelector(
            ".eye-image"
        );


    if (state.selected_eye === "LEFT") {

        left.classList.add(
            "selected"
        );

        right.classList.remove(
            "selected"
        );


        leftImage.src =
            "assets/oeil_bleu.png";

        rightImage.src =
            "assets/Oeil_gris.png";

    }
    else {

        left.classList.remove(
            "selected"
        );

        right.classList.add(
            "selected"
        );


        leftImage.src =
            "assets/Oeil_gris.png";

        rightImage.src =
            "assets/oeil_bleu.png";

    }

}


/* =========================================================
   CONNECT / DISCONNECT
   ========================================================= */

async function handleSensorButton() {

    const button =
        document.getElementById(
            "disconnectButton"
        );

    const command =
        button.dataset.action;


    if (!command) {
        return;
    }


    button.disabled = true;


    try {

        const result =
            await sendSensorCommand(
                command
            );


        currentState =
            result.device_state;


        updateDashboard(
            currentState
        );

    }
    catch (error) {

        console.error(
            "Sensor command failed:",
            error
        );


        document.getElementById(
            "systemMessage"
        ).innerHTML =
            "Sensor command failed.<br>" +
            "Check backend connection.";

    }
    finally {

        button.disabled = false;

    }

}


/* =========================================================
   CLOCK
   ========================================================= */

function updateClock() {

    const now =
        new Date();


    const currentTime =
        document.getElementById(
            "currentTime"
        );

    const currentDate =
        document.getElementById(
            "currentDate"
        );


    currentTime.textContent =
        now.toLocaleTimeString(
            "en-US",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    currentDate.textContent =
        now.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );

}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document.getElementById(
            "disconnectButton"
        ).addEventListener(
            "click",
            handleSensorButton
        );


        loadDeviceStatus();

        updateClock();


        setInterval(
            updateClock,
            1000
        );

    }
);