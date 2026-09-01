/* =========================================================
   EYEMEE - FRONTEND CONTROLLER
   ========================================================= */

let currentState = null;


/* =========================================================
   BACKEND URL
   ========================================================= */

function getBackendBaseUrl() {

    const hostname =
        window.location.hostname;


    if (
        hostname.endsWith(
            ".app.github.dev"
        )
    ) {

        const backendHostname =
            hostname.replace(
                /-8000(?=\.app\.github\.dev$)/,
                "-8001"
            );

        return (
            `${window.location.protocol}//`
            + backendHostname
        );
    }


    return (
        `${window.location.protocol}//`
        + `${hostname}:8001`
    );
}


const API_BASE_URL =
    getBackendBaseUrl();


/* =========================================================
   GENERIC API
   ========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            options
        );


    if (!response.ok) {

        let message =
            `HTTP ${response.status}`;


        try {

            const data =
                await response.json();


            if (data.detail) {

                message =
                    data.detail;
            }

        }
        catch (_) {
        }


        throw new Error(
            message
        );
    }


    return await response.json();
}


/* =========================================================
   API FUNCTIONS
   ========================================================= */

function getDeviceStatus() {

    return apiRequest(
        "/api/status"
    );
}


function sendSensorCommand(
    command
) {

    return apiRequest(
        `/api/sensor/${command}`,
        {
            method: "POST"
        }
    );
}


function calibrateDevice() {

    return apiRequest(
        "/api/calibrate",
        {
            method: "POST"
        }
    );
}


function selectEye(eye) {

    return apiRequest(
        "/api/eye/select",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                eye: eye
            })
        }
    );
}


function startMeasurement() {

    return apiRequest(
        "/api/measurement/start",
        {
            method: "POST"
        }
    );
}


/* =========================================================
   LOAD DEVICE
   ========================================================= */

async function loadDeviceStatus() {

    try {

        currentState =
            await getDeviceStatus();


        updateDashboard(
            currentState
        );

    }
    catch (error) {

        console.error(
            "EyeMee backend connection failed:",
            error
        );


        document.getElementById(
            "systemMessage"
        ).innerHTML =
            "Unable to communicate with EyeMee backend.<br>"
            + "Check backend connection.";
    }
}


/* =========================================================
   GLOBAL UPDATE
   ========================================================= */

function updateDashboard(state) {

    updateSensor(state);
    updateCalibration(state);
    updateDeviceStatus(state);
    updateBattery(state);
    updateTemperature(state);
    updatePatient(state);
    updateEyeSelection(state);
    updateMeasurement(state);
    updateSystemMessage(state);
}


/* =========================================================
   SENSOR
   ========================================================= */

function updateSensor(state) {

    const sensorStatus =
        document.getElementById(
            "sensorStatus"
        );

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
        sensorStatus.closest(
            ".status-card"
        );

    const qualityText =
        sensorCard.querySelector(
            "p"
        );


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
            `Signal Quality: <b>${
                getQualityLabel(
                    state.sensor_quality
                )
            }</b>`;

        qualityBar.style.width =
            `${state.sensor_quality}%`;

        sensorButton.innerHTML =
            "<i class='bx bx-unlink'></i> Disconnect";

        sensorButton.dataset.action =
            "disconnect";

        sensorButton.style.color =
            "#ff6676";

        sensorButton.style.borderColor =
            "rgba(240,77,94,0.63)";
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

        sensorButton.style.color =
            "#29dc77";

        sensorButton.style.borderColor =
            "rgba(41,220,119,0.65)";
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
   CALIBRATION
   ========================================================= */

function updateCalibration(state) {

    const calibrationStatus =
        document.getElementById(
            "calibrationStatus"
        );

    const card =
        calibrationStatus.closest(
            ".status-card"
        );

    const icon =
        card.querySelector(
            ".status-check"
        );


    if (
        state.device_status
        === "CALIBRATING"
    ) {

        calibrationStatus.textContent =
            "CALIBRATING";

        calibrationStatus.style.color =
            "#1267ed";

        icon.style.borderColor =
            "#1267ed";

        icon.style.color =
            "#1267ed";

        icon.innerHTML =
            "<i class='bx bx-loader-alt bx-spin'></i>";

        return;
    }


    if (state.calibrated) {

        calibrationStatus.textContent =
            "CALIBRATED";

        calibrationStatus.style.color =
            "#079c49";

        icon.style.borderColor =
            "#0caf54";

        icon.style.color =
            "#0aa34e";

        icon.innerHTML =
            "<i class='bx bx-check'></i>";
    }
    else {

        calibrationStatus.textContent =
            "REQUIRED";

        calibrationStatus.style.color =
            "#f59e0b";

        icon.style.borderColor =
            "#f59e0b";

        icon.style.color =
            "#f59e0b";

        icon.innerHTML =
            "<i class='bx bx-exclamation'></i>";
    }
}


/* =========================================================
   BUTTON STATE
   ========================================================= */

function setControlDisabled(
    button,
    disabled
) {

    button.disabled =
        disabled;


    if (disabled) {

        button.style.opacity =
            "0.42";

        button.style.filter =
            "grayscale(0.20)";

        button.style.cursor =
            "not-allowed";

        button.style.boxShadow =
            "none";

        button.style.pointerEvents =
            "none";
    }
    else {

        button.style.opacity =
            "1";

        button.style.filter =
            "none";

        button.style.cursor =
            "pointer";

        button.style.pointerEvents =
            "auto";
    }
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

    const card =
        deviceStatus.closest(
            ".status-card"
        );

    const message =
        card.querySelector(
            "p"
        );

    const icon =
        card.querySelector(
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


    if (
        state.device_status === "READY"
    ) {

        deviceStatus.style.color =
            "#079c49";

        headerStatus.style.color =
            "#079c49";

        message.textContent =
            "System operational";

        icon.style.borderColor =
            "#0caf54";

        icon.style.color =
            "#0aa34e";

        icon.innerHTML =
            "<i class='bx bx-check'></i>";
    }

    else if (
        state.device_status === "CALIBRATING"
        ||
        state.device_status === "MEASURING"
    ) {

        deviceStatus.style.color =
            "#1267ed";

        headerStatus.style.color =
            "#1267ed";

        message.textContent =
            state.device_status === "CALIBRATING"
            ? "Calibration in progress"
            : "Measurement in progress";

        icon.style.borderColor =
            "#1267ed";

        icon.style.color =
            "#1267ed";

        icon.innerHTML =
            "<i class='bx bx-loader-alt bx-spin'></i>";
    }

    else {

        deviceStatus.style.color =
            "#ef4d5e";

        headerStatus.style.color =
            "#ef4d5e";

        message.textContent =
            !state.sensor_connected
            ? "Sensor unavailable"
            : "Device not ready";

        icon.style.borderColor =
            "#ef4d5e";

        icon.style.color =
            "#ef4d5e";

        icon.innerHTML =
            "<i class='bx bx-x'></i>";
    }


    const busy =
        state.device_status === "CALIBRATING"
        ||
        state.device_status === "MEASURING";


    setControlDisabled(
        calibrateButton,
        !state.sensor_connected
        || busy
    );


    setControlDisabled(
        measureButton,
        !state.sensor_connected
        ||
        !state.calibrated
        ||
        state.device_status !== "READY"
    );
}


/* =========================================================
   EYE CARDS
   ========================================================= */

function setEyeCard(
    card,
    selected
) {

    const image =
        card.querySelector(
            ".eye-image"
        );

    const check =
        card.querySelector(
            ".eye-check"
        );


    if (selected) {

        card.classList.add(
            "selected"
        );

        image.src =
            "assets/oeil_bleu.png";

        check.innerHTML =
            "<i class='bx bx-check'></i>";
    }
    else {

        card.classList.remove(
            "selected"
        );

        image.src =
            "assets/Oeil_gris.png";

        check.innerHTML =
            "";
    }
}


/* =========================================================
   EYE SELECTION
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


    setEyeCard(
        left,
        state.selected_eye === "LEFT"
    );


    setEyeCard(
        right,
        state.selected_eye === "RIGHT"
    );


    const busy =
        state.device_status === "MEASURING"
        ||
        state.device_status === "CALIBRATING";


    left.disabled = busy;
    right.disabled = busy;
}


/* =========================================================
   CURRENT EYE MEASUREMENT
   ========================================================= */

function getSelectedEyeMeasurement(state) {

    if (!state.measurements_by_eye) {

        return null;
    }


    return (
        state.measurements_by_eye[
            state.selected_eye
        ]
        ?? null
    );
}


/* =========================================================
   MEASUREMENT RESULT
   ========================================================= */

function updateMeasurement(state) {

    const pressure =
        document.getElementById(
            "pressureValue"
        );

    const quality =
        document.getElementById(
            "qualityValue"
        );

    const result =
        document.getElementById(
            "measurementResult"
        );

    const indicator =
        document.getElementById(
            "qualityIndicator"
        );

    const title =
        document.querySelector(
            ".measurement-title-row .section-title"
        );


    if (
        state.measurement_in_progress
        ||
        state.device_status === "MEASURING"
    ) {

        title.innerHTML =
            "<i class='bx bx-pulse'></i>"
            + ` ${state.selected_eye} EYE MEASUREMENT`;

        pressure.textContent =
            "--";

        quality.textContent =
            "--";

        result.textContent =
            "MEASURING";

        result.style.color =
            "#1267ed";

        indicator.style.borderColor =
            "#8cb8f8";

        return;
    }


    const measurement =
        getSelectedEyeMeasurement(
            state
        );


    if (!measurement) {

        title.innerHTML =
            "<i class='bx bx-pulse'></i>"
            + ` ${state.selected_eye} EYE RESULT`;

        pressure.textContent =
            "--";

        quality.textContent =
            "--";

        result.textContent =
            "NO RESULT";

        result.style.color =
            "#102750";

        indicator.style.borderColor =
            "#d3ddeb";

        return;
    }


    if (!state.sensor_connected) {

        title.innerHTML =
            "<i class='bx bx-history'></i>"
            + ` LAST ${state.selected_eye} EYE MEASUREMENT`;
    }
    else {

        title.innerHTML =
            "<i class='bx bx-pulse'></i>"
            + ` ${state.selected_eye} EYE RESULT`;
    }


    pressure.textContent =
        Number(
            measurement.pressure
        ).toFixed(1);


    quality.textContent =
        measurement.quality;


    result.textContent =
        measurement.result;


    result.style.color =
        measurement.result === "VALID"
        ? "#079c49"
        : "#ef4d5e";


    if (measurement.quality >= 90) {

        indicator.style.borderColor =
            "#38c979";
    }
    else if (
        measurement.quality >= 70
    ) {

        indicator.style.borderColor =
            "#f59e0b";
    }
    else {

        indicator.style.borderColor =
            "#ef4d5e";
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
            "Sensor disconnected.<br>"
            + "Reconnect sensor to continue.";

        return;
    }


    if (
        state.device_status === "CALIBRATING"
    ) {

        message.innerHTML =
            "Calibration in progress.<br>"
            + "Please wait...";

        return;
    }


    if (
        state.device_status === "MEASURING"
    ) {

        message.innerHTML =
            `Measuring ${state.selected_eye} eye.<br>`
            + "Please keep the device stable...";

        return;
    }


    if (!state.calibrated) {

        message.innerHTML =
            "Device connected.<br>"
            + "Calibration required.";

        return;
    }


    const selectedMeasurement =
        getSelectedEyeMeasurement(
            state
        );


    if (selectedMeasurement) {

        message.innerHTML =
            `${state.selected_eye} eye measurement available.<br>`
            + `Result: ${selectedMeasurement.result}`;

        return;
    }


    message.innerHTML =
        `${state.selected_eye} eye selected.<br>`
        + "Ready for measurement.";
}


/* =========================================================
   OTHER VALUES
   ========================================================= */

function updateBattery(state) {

    document.getElementById(
        "batteryValue"
    ).textContent =
        `${state.battery_level}%`;


    document.getElementById(
        "batteryProgress"
    ).style.width =
        `${state.battery_level}%`;
}


function updateTemperature(state) {

    document.getElementById(
        "temperatureValue"
    ).textContent =
        `${state.temperature} °C`;
}


function updatePatient(state) {

    document.getElementById(
        "patientId"
    ).value =
        state.patient_id ?? "";
}


/* =========================================================
   SENSOR BUTTON
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

        const response =
            await sendSensorCommand(
                command
            );


        currentState =
            response.device_state;


        updateDashboard(
            currentState
        );
    }
    catch (error) {

        document.getElementById(
            "systemMessage"
        ).innerHTML =
            "Sensor command failed.<br>"
            + error.message;
    }
    finally {

        button.disabled = false;
    }
}


/* =========================================================
   CALIBRATION
   ========================================================= */

async function handleCalibration() {

    if (
        !currentState
        ||
        !currentState.sensor_connected
    ) {

        return;
    }


    const button =
        document.getElementById(
            "calibrateButton"
        );


    currentState.device_status =
        "CALIBRATING";

    currentState.calibrated =
        false;


    updateDashboard(
        currentState
    );


    button.innerHTML =
        "<span class='button-icon'>"
        + "<i class='bx bx-loader-alt bx-spin'></i>"
        + "</span>"
        + "<span>CALIBRATING...</span>";


    try {

        const response =
            await calibrateDevice();


        currentState =
            response.device_state;


        updateDashboard(
            currentState
        );


        document.getElementById(
            "lastCalibration"
        ).textContent =
            `Last calibration: Today ${getCurrentTime()}`;
    }
    catch (error) {

        await loadDeviceStatus();


        document.getElementById(
            "systemMessage"
        ).innerHTML =
            "Calibration failed.<br>"
            + error.message;
    }
    finally {

        button.innerHTML =
            "<span class='button-icon'>"
            + "<i class='bx bx-target-lock'></i>"
            + "</span>"
            + "<span>CALIBRATE DEVICE</span>";
    }
}


/* =========================================================
   EYE BUTTON
   ========================================================= */

async function handleEyeSelection(
    eye
) {

    if (!currentState) {
        return;
    }


    if (
        currentState.device_status === "MEASURING"
        ||
        currentState.device_status === "CALIBRATING"
    ) {

        return;
    }


    try {

        const response =
            await selectEye(
                eye
            );


        currentState =
            response.device_state;


        updateDashboard(
            currentState
        );
    }
    catch (error) {

        document.getElementById(
            "systemMessage"
        ).innerHTML =
            "Eye selection failed.<br>"
            + error.message;
    }
}


/* =========================================================
   MEASUREMENT
   ========================================================= */

async function handleMeasurement() {

    if (!currentState) {
        return;
    }


    if (
        !currentState.sensor_connected
        ||
        !currentState.calibrated
        ||
        currentState.device_status !== "READY"
    ) {

        return;
    }


    const button =
        document.getElementById(
            "measureButton"
        );


    currentState.device_status =
        "MEASURING";

    currentState.measurement_in_progress =
        true;


    updateDashboard(
        currentState
    );


    button.innerHTML =
        "<span class='button-icon'>"
        + "<i class='bx bx-loader-alt bx-spin'></i>"
        + "</span>"
        + "<span>MEASURING...</span>";


    try {

        const response =
            await startMeasurement();


        currentState =
            response.device_state;


        updateDashboard(
            currentState
        );
    }
    catch (error) {

        await loadDeviceStatus();


        document.getElementById(
            "systemMessage"
        ).innerHTML =
            "Measurement failed.<br>"
            + error.message;
    }
    finally {

        button.innerHTML =
            "<span class='button-icon'>"
            + "<i class='bx bx-play'></i>"
            + "</span>"
            + "<span>START MEASUREMENT</span>";
    }
}


/* =========================================================
   CLOCK
   ========================================================= */

function getCurrentTime() {

    return new Date()
        .toLocaleTimeString(
            "en-US",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
}


function updateClock() {

    const now =
        new Date();


    document.getElementById(
        "currentTime"
    ).textContent =
        getCurrentTime();


    document.getElementById(
        "currentDate"
    ).textContent =
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


        document.getElementById(
            "calibrateButton"
        ).addEventListener(
            "click",
            handleCalibration
        );


        document.getElementById(
            "leftEye"
        ).addEventListener(
            "click",
            () => handleEyeSelection(
                "LEFT"
            )
        );


        document.getElementById(
            "rightEye"
        ).addEventListener(
            "click",
            () => handleEyeSelection(
                "RIGHT"
            )
        );


        document.getElementById(
            "measureButton"
        ).addEventListener(
            "click",
            handleMeasurement
        );


        loadDeviceStatus();

        updateClock();


        setInterval(
            updateClock,
            1000
        );
    }
);