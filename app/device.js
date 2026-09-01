/* =========================================================
   EYEMEE - COMPLETE FRONTEND CONTROLLER
   ========================================================= */

let currentState = null;
let currentView = "dashboard";


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function byId(id) {
    return document.getElementById(id);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatDateTime(value) {
    if (!value) {
        return "--";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function formatShortTime(value) {
    if (!value) {
        return "--:--";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "--:--";
    }

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function formatUptime(seconds) {
    const total = Number(seconds ?? 0);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = Math.floor(total % 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    }

    if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    }

    return `${secs}s`;
}

function setInlineMessage(element, message, type = "") {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = "inline-message";

    if (type) {
        element.classList.add(type);
    }
}

function isBusy(state) {
    return ["MEASURING", "CALIBRATING", "SELF_TEST"]
        .includes(state?.device_status);
}


/* =========================================================
   BACKEND URL
   ========================================================= */

function getBackendBaseUrl() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    if (hostname.endsWith(".app.github.dev")) {
        if (hostname.includes("-8000.app.github.dev")) {
            return `${protocol}//${hostname.replace("-8000.app.github.dev", "-8001.app.github.dev")}`;
        }

        return `${protocol}//${hostname}`;
    }

    if (window.location.port === "8001") {
        return window.location.origin;
    }

    // Production deployments (for example *.vercel.app) use one origin
    // for both the frontend and the FastAPI routes.
    if (!window.location.port || hostname.endsWith(".vercel.app")) {
        return window.location.origin;
    }

    return `${protocol}//${hostname}:8001`;
}

const API_BASE_URL = getBackendBaseUrl();
const BROWSER_RUNTIME_KEY = "eyemee-runtime-v1";

function runtimeSnapshot(state) {
    const snapshot = JSON.parse(JSON.stringify(state ?? {}));

    for (const key of [
        "current_patient",
        "current_measurement",
        "server_time",
        "uptime_seconds",
        "runtime_persistence"
    ]) {
        delete snapshot[key];
    }

    return snapshot;
}

function saveBrowserRuntime(state) {
    try {
        localStorage.setItem(
            BROWSER_RUNTIME_KEY,
            JSON.stringify(runtimeSnapshot(state))
        );
    }
    catch (error) {
        console.warn("EyeMee browser persistence unavailable:", error);
    }
}

function readBrowserRuntime() {
    try {
        const raw = localStorage.getItem(BROWSER_RUNTIME_KEY);
        return raw ? JSON.parse(raw) : null;
    }
    catch (error) {
        console.warn("EyeMee browser runtime could not be read:", error);
        return null;
    }
}


/* =========================================================
   API
   ========================================================= */

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        options
    );

    if (!response.ok) {
        let message = `HTTP ${response.status}`;

        try {
            const data = await response.json();

            if (data.detail) {
                message = data.detail;
            }
        }
        catch (_) {
        }

        throw new Error(message);
    }

    return await response.json();
}

function getDeviceStatus() {
    return apiRequest("/api/status");
}

function restoreRuntime(state) {
    return apiRequest(
        "/api/runtime/restore",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ state })
        }
    );
}

function sendSensorCommand(command) {
    return apiRequest(
        `/api/sensor/${command}`,
        { method: "POST" }
    );
}

function calibrateDevice() {
    return apiRequest(
        "/api/calibrate",
        { method: "POST" }
    );
}

function selectEye(eye) {
    return apiRequest(
        "/api/eye/select",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ eye })
        }
    );
}

function startMeasurement() {
    return apiRequest(
        "/api/measurement/start",
        { method: "POST" }
    );
}

function upsertPatient(patient) {
    return apiRequest(
        "/api/patient/upsert",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(patient)
        }
    );
}

function selectPatient(patientId) {
    return apiRequest(
        "/api/patient/select",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ patient_id: patientId })
        }
    );
}

function updateSettings(payload) {
    return apiRequest(
        "/api/settings",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }
    );
}

function runSelfTest() {
    return apiRequest(
        "/api/system/self-test",
        { method: "POST" }
    );
}


/* =========================================================
   VIEW NAVIGATION
   ========================================================= */

function switchView(viewName) {
    const target = byId(`view-${viewName}`);

    if (!target) {
        return;
    }

    currentView = viewName;

    document.querySelectorAll(".view")
        .forEach(view => {
            view.classList.toggle(
                "active-view",
                view === target
            );
        });

    document.querySelectorAll(".nav-item[data-view]")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.view === viewName
            );
        });

    if (window.location.hash !== `#${viewName}`) {
        history.replaceState(null, "", `#${viewName}`);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (currentState) {
        renderViewSpecificContent(currentState);
    }
}

function initialViewFromHash() {
    const requested = window.location.hash.replace("#", "");
    const allowed = [
        "dashboard",
        "measurements",
        "patients",
        "calibration",
        "history",
        "device-settings",
        "system"
    ];

    return allowed.includes(requested)
        ? requested
        : "dashboard";
}


/* =========================================================
   LOAD / APPLY STATE
   ========================================================= */

async function loadApplicationState() {
    try {
        const savedRuntime = readBrowserRuntime();

        if (savedRuntime) {
            const restored = await restoreRuntime(savedRuntime);
            applyState(restored.device_state);
        }
        else {
            const state = await getDeviceStatus();
            applyState(state);
        }

        setSystemApiOnline(true);
    }
    catch (error) {
        console.error("EyeMee backend connection failed:", error);
        setSystemApiOnline(false);

        if (byId("systemMessage")) {
            byId("systemMessage").innerHTML =
                "Unable to communicate with EyeMee backend.<br>Check backend connection.";
        }
    }
}

function applyState(state) {
    currentState = state;

    // Save only stable backend states. Temporary UI states such as
    // MEASURING/CALIBRATING must not survive a browser refresh.
    if (!isBusy(state) && !state?.measurement_in_progress) {
        saveBrowserRuntime(state);
    }

    updateHeader(state);
    updateSensor(state);
    updateCalibration(state);
    updateDeviceStatus(state);
    updatePatientContext(state);
    updateEyeSelection(state);
    updateMeasurement(state);
    updateSystemMessage(state);
    updateQuickInfo(state);
    renderDashboardActivity(state);

    renderMeasurementsPage(state);
    renderPatientsPage(state);
    renderCalibrationPage(state);
    renderHistoryPage(state);
    renderSettingsPage(state);
    renderSystemPage(state);
}

function renderViewSpecificContent(state) {
    if (currentView === "measurements") {
        renderMeasurementsPage(state);
    }
    else if (currentView === "patients") {
        renderPatientsPage(state);
    }
    else if (currentView === "calibration") {
        renderCalibrationPage(state);
    }
    else if (currentView === "history") {
        renderHistoryPage(state);
    }
    else if (currentView === "device-settings") {
        renderSettingsPage(state);
    }
    else if (currentView === "system") {
        renderSystemPage(state);
    }
}


/* =========================================================
   HEADER / CLOCK
   ========================================================= */

function updateClock() {
    const now = new Date();

    byId("currentTime").textContent = now.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

    byId("currentDate").textContent = now.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}

function updateHeader(state) {
    const header = byId("headerDeviceStatus");
    const displayStatus = String(state.device_status ?? "UNKNOWN")
        .replaceAll("_", " ");

    header.textContent = `● ${displayStatus}`;

    if (state.device_status === "READY") {
        header.style.color = "#079c49";
    }
    else if (isBusy(state)) {
        header.style.color = "#1267ed";
    }
    else {
        header.style.color = "#ef4d5e";
    }
}


/* =========================================================
   DASHBOARD - SENSOR
   ========================================================= */

function getQualityLabel(value) {
    if (value >= 90) return "Excellent";
    if (value >= 70) return "Good";
    if (value >= 40) return "Poor";
    return "Unavailable";
}

function updateSensor(state) {
    const sensorStatus = byId("sensorStatus");
    const sidebarStatus = byId("sensorSidebarStatus");
    const qualityBar = byId("sensorQualityBar");
    const sensorButton = byId("disconnectButton");
    const sensorCard = sensorStatus.closest(".status-card");
    const qualityText = sensorCard.querySelector("p");

    sensorButton.classList.remove("connect-mode", "disconnect-mode");

    if (state.sensor_connected) {
        sensorStatus.textContent = "CONNECTED";
        sidebarStatus.textContent = "● CONNECTED";
        sensorStatus.style.color = "#079c49";
        sidebarStatus.style.color = "#29dc77";
        qualityText.innerHTML = `Signal Quality: <b>${getQualityLabel(state.sensor_quality)}</b>`;
        qualityBar.style.width = `${state.sensor_quality}%`;
        sensorButton.innerHTML = "<i class='bx bx-unlink'></i> Disconnect";
        sensorButton.dataset.action = "disconnect";
        sensorButton.classList.add("disconnect-mode");
    }
    else {
        sensorStatus.textContent = "DISCONNECTED";
        sidebarStatus.textContent = "● DISCONNECTED";
        sensorStatus.style.color = "#ef4d5e";
        sidebarStatus.style.color = "#ff6676";
        qualityText.innerHTML = "Signal Quality: <b>Unavailable</b>";
        qualityBar.style.width = "0%";
        sensorButton.innerHTML = "<i class='bx bx-link'></i> Connect";
        sensorButton.dataset.action = "connect";
        sensorButton.classList.add("connect-mode");
    }
}


/* =========================================================
   DASHBOARD - CALIBRATION
   ========================================================= */

function updateCalibration(state) {
    const calibrationStatus = byId("calibrationStatus");
    const card = calibrationStatus.closest(".status-card");
    const icon = card.querySelector(".status-check");

    if (state.device_status === "CALIBRATING") {
        calibrationStatus.textContent = "CALIBRATING";
        calibrationStatus.style.color = "#1267ed";
        icon.style.borderColor = "#1267ed";
        icon.style.color = "#1267ed";
        icon.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i>";
    }
    else if (state.calibrated) {
        calibrationStatus.textContent = "CALIBRATED";
        calibrationStatus.style.color = "#079c49";
        icon.style.borderColor = "#0caf54";
        icon.style.color = "#0aa34e";
        icon.innerHTML = "<i class='bx bx-check'></i>";
    }
    else {
        calibrationStatus.textContent = "REQUIRED";
        calibrationStatus.style.color = "#f59e0b";
        icon.style.borderColor = "#f59e0b";
        icon.style.color = "#f59e0b";
        icon.innerHTML = "<i class='bx bx-exclamation'></i>";
    }

    byId("lastCalibration").textContent =
        `Last calibration: ${state.last_calibration ? formatDateTime(state.last_calibration) : "Never"}`;
}


/* =========================================================
   DASHBOARD - DEVICE STATUS
   ========================================================= */

function updateDeviceStatus(state) {
    const deviceStatus = byId("deviceStatus");
    const measureButton = byId("measureButton");
    const calibrateButton = byId("calibrateButton");
    const card = deviceStatus.closest(".status-card");
    const message = card.querySelector("p");
    const icon = card.querySelector(".status-check");
    const displayStatus = String(state.device_status).replaceAll("_", " ");

    deviceStatus.textContent = displayStatus;

    if (state.device_status === "READY") {
        deviceStatus.style.color = "#079c49";
        message.textContent = "System operational";
        icon.style.borderColor = "#0caf54";
        icon.style.color = "#0aa34e";
        icon.innerHTML = "<i class='bx bx-check'></i>";
    }
    else if (isBusy(state)) {
        deviceStatus.style.color = "#1267ed";
        message.textContent =
            state.device_status === "MEASURING"
                ? "Measurement in progress"
                : state.device_status === "CALIBRATING"
                    ? "Calibration in progress"
                    : "System self test in progress";
        icon.style.borderColor = "#1267ed";
        icon.style.color = "#1267ed";
        icon.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i>";
    }
    else {
        deviceStatus.style.color = "#ef4d5e";
        message.textContent = state.sensor_connected
            ? "Device not ready"
            : "Sensor unavailable";
        icon.style.borderColor = "#ef4d5e";
        icon.style.color = "#ef4d5e";
        icon.innerHTML = "<i class='bx bx-x'></i>";
    }

    calibrateButton.disabled = !state.sensor_connected || isBusy(state);

    measureButton.disabled =
        !state.sensor_connected
        || !state.calibrated
        || state.device_status !== "READY"
        || !state.current_patient;
}


/* =========================================================
   DASHBOARD - PATIENT
   ========================================================= */

function updatePatientContext(state) {
    const currentPatient = state.current_patient;

    byId("patientId").value = currentPatient?.patient_id ?? "";
    byId("birthDate").value = currentPatient?.date_of_birth ?? "";
}


/* =========================================================
   DASHBOARD - EYE
   ========================================================= */

function setEyeCard(card, selected) {
    const image = card.querySelector(".eye-image");
    const check = card.querySelector(".eye-check");

    if (selected) {
        card.classList.add("selected");
        image.src = "assets/oeil_bleu.png";
        check.innerHTML = "<i class='bx bx-check'></i>";
    }
    else {
        card.classList.remove("selected");
        image.src = "assets/Oeil_gris.png";
        check.innerHTML = "";
    }
}

function updateEyeSelection(state) {
    const left = byId("leftEye");
    const right = byId("rightEye");

    setEyeCard(left, state.selected_eye === "LEFT");
    setEyeCard(right, state.selected_eye === "RIGHT");

    left.disabled = isBusy(state);
    right.disabled = isBusy(state);
}


/* =========================================================
   DASHBOARD - MEASUREMENT
   ========================================================= */

function updateMeasurement(state) {
    const pressure = byId("pressureValue");
    const quality = byId("qualityValue");
    const result = byId("measurementResult");
    const indicator = byId("qualityIndicator");
    const title = document.querySelector(".measurement-title-row .section-title");

    if (state.measurement_in_progress || state.device_status === "MEASURING") {
        title.innerHTML = `<i class='bx bx-pulse'></i> ${state.selected_eye} EYE MEASUREMENT`;
        pressure.textContent = "--";
        quality.textContent = "--";
        result.textContent = "MEASURING";
        result.style.color = "#1267ed";
        indicator.style.borderColor = "#8cb8f8";
        return;
    }

    const measurement = state.current_measurement;

    if (!measurement) {
        title.innerHTML = `<i class='bx bx-pulse'></i> ${state.selected_eye} EYE RESULT`;
        pressure.textContent = "--";
        quality.textContent = "--";
        result.textContent = "NO RESULT";
        result.style.color = "#102750";
        indicator.style.borderColor = "#d3ddeb";
        return;
    }

    title.innerHTML = state.sensor_connected
        ? `<i class='bx bx-pulse'></i> ${state.selected_eye} EYE RESULT`
        : `<i class='bx bx-history'></i> LAST ${state.selected_eye} EYE MEASUREMENT`;

    pressure.textContent = Number(measurement.pressure).toFixed(1);
    quality.textContent = measurement.quality;
    result.textContent = measurement.result;
    result.style.color = measurement.result === "VALID" ? "#079c49" : "#ef4d5e";

    if (measurement.quality >= 90) {
        indicator.style.borderColor = "#38c979";
    }
    else if (measurement.quality >= 70) {
        indicator.style.borderColor = "#f59e0b";
    }
    else {
        indicator.style.borderColor = "#ef4d5e";
    }
}


/* =========================================================
   DASHBOARD - SYSTEM MESSAGE / QUICK INFO
   ========================================================= */

function updateSystemMessage(state) {
    const message = byId("systemMessage");

    if (!state.sensor_connected) {
        message.innerHTML = "Sensor disconnected.<br>Reconnect sensor to continue.";
    }
    else if (state.device_status === "CALIBRATING") {
        message.innerHTML = "Calibration in progress.<br>Please wait...";
    }
    else if (state.device_status === "MEASURING") {
        message.innerHTML = `Measuring ${state.selected_eye} eye.<br>Please keep the device stable...`;
    }
    else if (state.device_status === "SELF_TEST") {
        message.innerHTML = "System self test in progress.<br>Please wait...";
    }
    else if (!state.calibrated) {
        message.innerHTML = "Device connected.<br>Calibration required.";
    }
    else if (!state.current_patient) {
        message.innerHTML = "Device ready.<br>Select or create a patient before measuring.";
    }
    else if (state.current_measurement) {
        message.innerHTML = `${state.selected_eye} eye measurement available.<br>Result: ${state.current_measurement.result}`;
    }
    else {
        message.innerHTML = `${state.selected_eye} eye selected.<br>Ready for measurement.`;
    }

    byId("messageTime").textContent = new Date().toLocaleTimeString(
        "en-US",
        { hour: "2-digit", minute: "2-digit", second: "2-digit" }
    );
}

function updateQuickInfo(state) {
    byId("quickDeviceModel").textContent = state.device_model;
    byId("quickSoftwareVersion").textContent = `v${state.software_version}`;
    byId("batteryValue").textContent = `${state.battery_level}%`;
    byId("batteryProgress").style.width = `${state.battery_level}%`;
    byId("temperatureValue").textContent = `${state.temperature} °C`;
}

function renderDashboardActivity(state) {
    const container = byId("dashboardActivityList");
    const items = (state.history ?? []).slice(0, 3);

    if (items.length === 0) {
        container.innerHTML = "<p class='empty-mini'>No recent activity</p>";
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="activity-row">
            <span>${escapeHtml(formatShortTime(item.timestamp))}</span>
            <p>${escapeHtml(item.event)}</p>
            <strong><i class="bx bx-check-circle"></i></strong>
        </div>
    `).join("");
}


/* =========================================================
   MEASUREMENTS PAGE
   ========================================================= */

function updateMeasurementPatientFilter(state) {
    const select = byId("measurementPatientFilter");
    const previous = select.value || "ALL";

    select.innerHTML = [
        '<option value="ALL">All patients</option>',
        ...(state.patients ?? []).map(patient =>
            `<option value="${escapeHtml(patient.patient_id)}">${escapeHtml(patient.patient_id)}</option>`
        )
    ].join("");

    const exists = [...select.options]
        .some(option => option.value === previous);

    select.value = exists ? previous : "ALL";
}

function getFilteredMeasurements(state) {
    const patient = byId("measurementPatientFilter").value;
    const eye = byId("measurementEyeFilter").value;
    const result = byId("measurementResultFilter").value;

    return (state.measurements ?? []).filter(measurement => {
        const patientMatch = patient === "ALL" || measurement.patient_id === patient;
        const eyeMatch = eye === "ALL" || measurement.eye === eye;
        const resultMatch = result === "ALL" || measurement.result === result;
        return patientMatch && eyeMatch && resultMatch;
    });
}

function renderMeasurementsPage(state) {
    updateMeasurementPatientFilter(state);

    const measurements = getFilteredMeasurements(state);
    const allMeasurements = state.measurements ?? [];
    const total = allMeasurements.length;

    byId("measurementCount").textContent = total;

    const uniquePatients = new Set(
        allMeasurements
            .map(item => item.patient_id)
            .filter(Boolean)
    );
    byId("measurementPatientCount").textContent = uniquePatients.size;

    if (total > 0) {
        const validCount = allMeasurements.filter(item => item.result === "VALID").length;
        const rate = Math.round((validCount / total) * 100);
        const latest = allMeasurements[0];

        byId("measurementValidRate").textContent = `${rate}%`;
        byId("measurementLatestEye").textContent = `${latest.eye} • ${Number(latest.pressure).toFixed(1)} mmHg`;
        byId("measurementLatestDetails").textContent = `${latest.patient_id} • ${latest.quality}% quality • ${formatDateTime(latest.timestamp)}`;
    }
    else {
        byId("measurementValidRate").textContent = "--";
        byId("measurementLatestEye").textContent = "--";
        byId("measurementLatestDetails").textContent = "No measurement recorded";
    }

    const body = byId("measurementTableBody");
    const empty = byId("measurementEmptyState");

    if (measurements.length === 0) {
        body.innerHTML = "";
        empty.classList.remove("hidden");
        return;
    }

    empty.classList.add("hidden");

    body.innerHTML = measurements.map(measurement => `
        <tr>
            <td><strong>${escapeHtml(measurement.id)}</strong></td>
            <td>${escapeHtml(formatDateTime(measurement.timestamp))}</td>
            <td><span class="patient-cell">${escapeHtml(measurement.patient_id)}</span></td>
            <td><span class="eye-badge ${String(measurement.eye).toLowerCase()}">${escapeHtml(measurement.eye)}</span></td>
            <td><strong>${Number(measurement.pressure).toFixed(1)}</strong> mmHg</td>
            <td>${escapeHtml(measurement.quality)}%</td>
            <td><span class="result-badge ${measurement.result === "VALID" ? "valid" : "invalid"}">${escapeHtml(measurement.result)}</span></td>
        </tr>
    `).join("");
}


/* =========================================================
   PATIENTS PAGE
   ========================================================= */

function getPatientMeasurementCount(state, patientId) {
    return (state.measurements ?? [])
        .filter(measurement => measurement.patient_id === patientId)
        .length;
}

function renderPatientsPage(state) {
    const patients = state.patients ?? [];
    const current = state.current_patient;

    byId("patientCountBadge").textContent = `${patients.length} patient${patients.length === 1 ? "" : "s"}`;

    byId("currentPatientName").textContent = current?.name || "Unnamed patient";
    byId("currentPatientId").textContent = current?.patient_id || "No patient selected";
    byId("currentPatientDob").textContent = current?.date_of_birth || "--";
    byId("currentPatientMeasurementCount").textContent = current
        ? getPatientMeasurementCount(state, current.patient_id)
        : 0;

    const list = byId("patientList");

    if (patients.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="bx bx-user"></i>
                <strong>No patient available</strong>
            </div>
        `;
        return;
    }

    list.innerHTML = patients.map(patient => {
        const active = patient.patient_id === state.patient_id;
        const count = getPatientMeasurementCount(state, patient.patient_id);

        return `
            <article class="patient-list-item ${active ? "active" : ""}">
                <div class="patient-list-header">
                    <strong>${escapeHtml(patient.name || patient.patient_id)}</strong>
                    ${active ? '<span class="result-badge valid">ACTIVE</span>' : ""}
                </div>
                <p>${escapeHtml(patient.patient_id)}</p>
                <p>DOB: ${escapeHtml(patient.date_of_birth || "--")}</p>
                <div class="patient-list-footer">
                    <span class="count-badge">${count} measurement${count === 1 ? "" : "s"}</span>
                    <button class="small-action" type="button" data-select-patient="${escapeHtml(patient.patient_id)}" ${active ? "disabled" : ""}>
                        ${active ? "Selected" : "Select"}
                    </button>
                </div>
            </article>
        `;
    }).join("");
}


/* =========================================================
   CALIBRATION PAGE
   ========================================================= */

function renderCalibrationPage(state) {
    const status = byId("calibrationPageStatus");
    const description = byId("calibrationPageDescription");
    const button = byId("calibrationPageButton");
    const heroIcon = byId("calibrationHeroIcon");
    const sensorIcon = byId("calibrationSensorIcon");

    byId("calibrationSensorStatus").textContent = state.sensor_connected
        ? "Connected"
        : "Disconnected";

    byId("calibrationLastTime").textContent = state.last_calibration
        ? formatDateTime(state.last_calibration)
        : "Never";

    sensorIcon.style.borderColor = state.sensor_connected ? "#0db356" : "#ef4d5e";
    sensorIcon.style.color = state.sensor_connected ? "#079c49" : "#ef4d5e";
    sensorIcon.innerHTML = state.sensor_connected
        ? "<i class='bx bx-check'></i>"
        : "<i class='bx bx-x'></i>";

    if (state.device_status === "CALIBRATING") {
        status.textContent = "CALIBRATING";
        status.style.color = "#1267ed";
        description.textContent = "Calibration sequence in progress.";
        heroIcon.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i>";
        button.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Calibrating...";
    }
    else if (state.calibrated) {
        status.textContent = "CALIBRATED";
        status.style.color = "#079c49";
        description.textContent = "Device calibration is valid.";
        heroIcon.innerHTML = "<i class='bx bx-target-lock'></i>";
        button.innerHTML = "<i class='bx bx-target-lock'></i> Recalibrate device";
    }
    else {
        status.textContent = "CALIBRATION REQUIRED";
        status.style.color = "#f59e0b";
        description.textContent = "Calibration is required before measurement.";
        heroIcon.innerHTML = "<i class='bx bx-target-lock'></i>";
        button.innerHTML = "<i class='bx bx-target-lock'></i> Start calibration";
    }

    button.disabled = !state.sensor_connected || isBusy(state);
}


/* =========================================================
   HISTORY PAGE
   ========================================================= */

function historyDetails(item) {
    const details = [];

    if (item.measurement_id) details.push(item.measurement_id);
    if (item.patient_id) details.push(`Patient ${item.patient_id}`);
    if (item.eye) details.push(`${item.eye} eye`);
    if (item.pressure !== undefined) details.push(`${Number(item.pressure).toFixed(1)} mmHg`);
    if (item.quality !== undefined) details.push(`Quality ${item.quality}%`);
    if (item.result) details.push(`Result ${item.result}`);

    return details.join(" • ");
}

function historyCategoryMeta(category) {
    const key = String(category || "SYSTEM").toUpperCase();

    const map = {
        MEASUREMENT: { icon: "bx-pulse", className: "measurement" },
        CALIBRATION: { icon: "bx-target-lock", className: "calibration" },
        SENSOR: { icon: "bx-wifi", className: "sensor" },
        PATIENT: { icon: "bx-user", className: "patient" },
        SETTINGS: { icon: "bx-cog", className: "settings" },
        SYSTEM: { icon: "bx-shield-quarter", className: "system" }
    };

    return map[key] ?? map.SYSTEM;
}

function formatHistoryDate(value) {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function renderHistoryPage(state) {
    const category = byId("historyCategoryFilter").value;
    const history = (state.history ?? []).filter(item =>
        category === "ALL" || item.category === category
    );

    const list = byId("historyList");
    const empty = byId("historyEmptyState");

    if (history.length === 0) {
        list.innerHTML = "";
        empty.classList.remove("hidden");
        return;
    }

    empty.classList.add("hidden");

    list.innerHTML = history.map(item => {
        const categoryName = String(item.category || "SYSTEM").toUpperCase();
        const meta = historyCategoryMeta(categoryName);
        const details = historyDetails(item) || "EyeMee system event";

        return `
            <article class="history-entry history-${meta.className}">
                <div class="history-time">
                    <strong>${escapeHtml(formatShortTime(item.timestamp))}</strong>
                    <span>${escapeHtml(formatHistoryDate(item.timestamp))}</span>
                </div>

                <div class="history-icon ${meta.className}">
                    <i class="bx ${meta.icon}"></i>
                </div>

                <div class="history-content">
                    <strong>${escapeHtml(item.event)}</strong>
                    <p>${escapeHtml(details)}</p>
                </div>

                <span class="category-badge ${meta.className}">${escapeHtml(categoryName)}</span>
            </article>
        `;
    }).join("");
}


/* =========================================================
   SETTINGS PAGE
   ========================================================= */

function renderSettingsPage(state) {
    const settings = state.settings ?? {};
    const profile = state.measurement_profile ?? {};
    const left = profile.LEFT ?? {};
    const right = profile.RIGHT ?? {};

    byId("settingDuration").value = settings.measurement_duration_seconds ?? 2;
    byId("settingMinQuality").value = settings.minimum_quality ?? 70;
    byId("settingMinPressure").value = settings.valid_pressure_min ?? 5;
    byId("settingMaxPressure").value = settings.valid_pressure_max ?? 35;
    byId("settingLeftPressure").value = left.pressure ?? 18.4;
    byId("settingLeftQuality").value = left.quality ?? 96;
    byId("settingRightPressure").value = right.pressure ?? 19.1;
    byId("settingRightQuality").value = right.quality ?? 94;
    byId("settingSensorQuality").value = settings.sensor_default_quality ?? 96;
    byId("settingRequireCalibration").checked = Boolean(settings.require_calibration_after_reconnect);
    byId("settingSound").checked = Boolean(settings.sound_enabled);
}


/* =========================================================
   SYSTEM PAGE
   ========================================================= */

function latestSelfTestEntry(state) {
    return (state.history ?? []).find(item =>
        item.category === "SYSTEM"
        && String(item.event).toLowerCase().includes("self test")
        && item.result
    ) ?? null;
}

function setSystemApiOnline(online) {
    const element = byId("systemApiStatus");

    if (!element) {
        return;
    }

    element.textContent = online ? "ONLINE" : "OFFLINE";
    element.className = online ? "good-text" : "bad-text";
}

function renderSystemPage(state) {
    byId("systemModel").textContent = state.device_model ?? "--";
    byId("systemSoftware").textContent = state.software_version ? `v${state.software_version}` : "--";
    byId("systemFirmware").textContent = state.firmware_version ? `v${state.firmware_version}` : "--";
    byId("systemSensor").textContent = state.sensor_connected ? "CONNECTED" : "DISCONNECTED";
    byId("systemDeviceStatus").textContent = String(state.device_status ?? "--").replaceAll("_", " ");
    byId("systemApiUrl").textContent = API_BASE_URL;
    byId("systemUptime").textContent = formatUptime(state.uptime_seconds);
    byId("systemPersistence").textContent = state.runtime_persistence ?? "backend/data/runtime_state.json";
    byId("systemSelectedEye").textContent = state.selected_eye ?? "--";
    byId("systemPatient").textContent = state.patient_id ?? "--";
    byId("systemRawState").textContent = JSON.stringify(state, null, 2);

    const latestEntry = latestSelfTestEntry(state);
    const latestResult = latestEntry?.result ?? null;
    const resultBox = byId("selfTestResult");
    const metaBox = byId("selfTestMeta");

    resultBox.textContent = latestResult ?? "NOT RUN";
    resultBox.className = "self-test-result";

    if (latestResult === "PASS") {
        resultBox.classList.add("pass");
    }
    else if (latestResult === "FAIL") {
        resultBox.classList.add("fail");
    }
    else {
        resultBox.classList.add("neutral");
    }

    metaBox.textContent = latestEntry
        ? formatDateTime(latestEntry.timestamp)
        : "No self test recorded";

    const button = byId("selfTestButton");
    button.disabled = isBusy(state);
    button.classList.toggle("disabled-action", button.disabled);

    setSystemApiOnline(true);
}


/* =========================================================
   OPERATIONS - SENSOR
   ========================================================= */

async function handleSensorButton() {
    const button = byId("disconnectButton");
    const command = button.dataset.action;

    if (!command) {
        return;
    }

    button.disabled = true;

    try {
        const response = await sendSensorCommand(command);
        applyState(response.device_state);
    }
    catch (error) {
        byId("systemMessage").innerHTML = `Sensor command failed.<br>${escapeHtml(error.message)}`;
    }
    finally {
        button.disabled = false;
    }
}


/* =========================================================
   OPERATIONS - CALIBRATION
   ========================================================= */

async function handleCalibration() {
    if (!currentState || !currentState.sensor_connected || isBusy(currentState)) {
        return;
    }

    const temporaryState = {
        ...currentState,
        calibrated: false,
        device_status: "CALIBRATING"
    };

    applyState(temporaryState);

    try {
        const response = await calibrateDevice();
        applyState(response.device_state);
    }
    catch (error) {
        await loadApplicationState();
        byId("systemMessage").innerHTML = `Calibration failed.<br>${escapeHtml(error.message)}`;
    }
}


/* =========================================================
   OPERATIONS - EYE
   ========================================================= */

async function handleEyeSelection(eye) {
    if (!currentState || isBusy(currentState)) {
        return;
    }

    try {
        const response = await selectEye(eye);
        applyState(response.device_state);
    }
    catch (error) {
        byId("systemMessage").innerHTML = `Eye selection failed.<br>${escapeHtml(error.message)}`;
    }
}


/* =========================================================
   OPERATIONS - MEASUREMENT
   ========================================================= */

async function handleMeasurement() {
    if (
        !currentState
        || !currentState.sensor_connected
        || !currentState.calibrated
        || currentState.device_status !== "READY"
        || !currentState.current_patient
    ) {
        return;
    }

    const temporaryState = {
        ...currentState,
        measurement_in_progress: true,
        device_status: "MEASURING"
    };

    applyState(temporaryState);

    try {
        const response = await startMeasurement();
        applyState(response.device_state);
    }
    catch (error) {
        await loadApplicationState();
        byId("systemMessage").innerHTML = `Measurement failed.<br>${escapeHtml(error.message)}`;
    }
}


/* =========================================================
   OPERATIONS - PATIENTS
   ========================================================= */

async function handleDashboardPatientApply() {
    const patientId = byId("patientId").value.trim();
    const dob = byId("birthDate").value;
    const message = byId("patientFormMessage");

    if (!patientId) {
        setInlineMessage(message, "Patient ID is required.", "error");
        return;
    }

    try {
        const response = await upsertPatient({
            patient_id: patientId,
            date_of_birth: dob || null,
            name: null
        });

        applyState(response.device_state);
        setInlineMessage(message, "Patient applied to measurement context.", "success");
    }
    catch (error) {
        setInlineMessage(message, error.message, "error");
    }
}

async function handlePatientPageSave() {
    const patientId = byId("patientPageId").value.trim();
    const name = byId("patientPageName").value.trim();
    const dob = byId("patientPageDob").value;
    const message = byId("patientPageMessage");

    if (!patientId) {
        setInlineMessage(message, "Patient ID is required.", "error");
        return;
    }

    try {
        const response = await upsertPatient({
            patient_id: patientId,
            date_of_birth: dob || null,
            name: name || null
        });

        applyState(response.device_state);
        setInlineMessage(message, "Patient saved and selected.", "success");

        byId("patientPageId").value = "";
        byId("patientPageName").value = "";
        byId("patientPageDob").value = "";
    }
    catch (error) {
        setInlineMessage(message, error.message, "error");
    }
}

async function handlePatientListClick(event) {
    const button = event.target.closest("[data-select-patient]");

    if (!button) {
        return;
    }

    try {
        const response = await selectPatient(button.dataset.selectPatient);
        applyState(response.device_state);
    }
    catch (error) {
        setInlineMessage(byId("patientPageMessage"), error.message, "error");
    }
}


/* =========================================================
   OPERATIONS - SETTINGS
   ========================================================= */

function readNumber(id) {
    return Number(byId(id).value);
}

async function handleSaveSettings() {
    const message = byId("settingsMessage");

    const payload = {
        measurement_duration_seconds: readNumber("settingDuration"),
        minimum_quality: readNumber("settingMinQuality"),
        valid_pressure_min: readNumber("settingMinPressure"),
        valid_pressure_max: readNumber("settingMaxPressure"),
        left_pressure: readNumber("settingLeftPressure"),
        left_quality: readNumber("settingLeftQuality"),
        right_pressure: readNumber("settingRightPressure"),
        right_quality: readNumber("settingRightQuality"),
        sensor_default_quality: readNumber("settingSensorQuality"),
        require_calibration_after_reconnect: byId("settingRequireCalibration").checked,
        sound_enabled: byId("settingSound").checked
    };

    try {
        const response = await updateSettings(payload);
        applyState(response.device_state);
        setInlineMessage(message, "Settings saved successfully.", "success");
    }
    catch (error) {
        setInlineMessage(message, error.message, "error");
    }
}


/* =========================================================
   OPERATIONS - SYSTEM SELF TEST
   ========================================================= */

async function handleSelfTest() {
    if (!currentState || isBusy(currentState)) {
        return;
    }

    const resultBox = byId("selfTestResult");
    resultBox.textContent = "RUNNING";
    resultBox.className = "self-test-result neutral";

    applyState({
        ...currentState,
        device_status: "SELF_TEST"
    });

    try {
        const response = await runSelfTest();
        applyState(response.device_state);

        resultBox.textContent = response.result;
        resultBox.className = `self-test-result ${response.result === "PASS" ? "pass" : "fail"}`;
    }
    catch (error) {
        await loadApplicationState();
        resultBox.textContent = "ERROR";
        resultBox.className = "self-test-result fail";
    }
}


/* =========================================================
   EVENT SETUP
   ========================================================= */

function setupEvents() {
    document.querySelectorAll(".nav-item[data-view]")
        .forEach(button => {
            button.addEventListener("click", () => switchView(button.dataset.view));
        });

    document.querySelectorAll("[data-view-jump]")
        .forEach(button => {
            button.addEventListener("click", () => switchView(button.dataset.viewJump));
        });

    byId("topSettingsButton").addEventListener("click", () => switchView("device-settings"));
    byId("dashboardHistoryButton").addEventListener("click", () => switchView("history"));

    byId("disconnectButton").addEventListener("click", handleSensorButton);
    byId("calibrateButton").addEventListener("click", handleCalibration);
    byId("calibrationPageButton").addEventListener("click", handleCalibration);
    byId("measureButton").addEventListener("click", handleMeasurement);

    byId("leftEye").addEventListener("click", () => handleEyeSelection("LEFT"));
    byId("rightEye").addEventListener("click", () => handleEyeSelection("RIGHT"));

    byId("applyPatientButton").addEventListener("click", handleDashboardPatientApply);
    byId("savePatientButton").addEventListener("click", handlePatientPageSave);
    byId("patientList").addEventListener("click", handlePatientListClick);

    byId("measurementPatientFilter").addEventListener("change", () => renderMeasurementsPage(currentState));
    byId("measurementEyeFilter").addEventListener("change", () => renderMeasurementsPage(currentState));
    byId("measurementResultFilter").addEventListener("change", () => renderMeasurementsPage(currentState));
    byId("refreshMeasurementsButton").addEventListener("click", loadApplicationState);

    byId("historyCategoryFilter").addEventListener("change", () => renderHistoryPage(currentState));
    byId("refreshHistoryButton").addEventListener("click", loadApplicationState);

    byId("saveSettingsButton").addEventListener("click", handleSaveSettings);
    byId("selfTestButton").addEventListener("click", handleSelfTest);
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    setupEvents();
    updateClock();
    setInterval(updateClock, 1000);
    switchView(initialViewFromHash());
    loadApplicationState();
});
