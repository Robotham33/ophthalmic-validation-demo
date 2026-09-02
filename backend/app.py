import asyncio
import copy
import json
import os
import random
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_PATH = BASE_DIR / "backend" / "config" / "device_config.json"
IS_VERCEL = bool(os.getenv("VERCEL") or os.getenv("VERCEL_ENV"))
DATA_DIR = Path("/tmp/eyemee") if IS_VERCEL else BASE_DIR / "backend" / "data"
RUNTIME_PATH = DATA_DIR / "runtime_state.json"
FRONTEND_DIR = BASE_DIR / "app"
APP_STARTED_AT = datetime.now()

DATA_DIR.mkdir(parents=True, exist_ok=True)


# =========================================================
# APPLICATION
# =========================================================

app = FastAPI(
    title="EyeMee API",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# HELPERS / PERSISTENCE
# =========================================================

def now_iso():
    return datetime.now().isoformat(timespec="seconds")


def read_json(path: Path):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def normalize_state(state: dict):
    """Make old/new runtime files compatible and repair transient states."""

    state = copy.deepcopy(state)

    # Derived API fields must never be persisted as runtime state.
    for derived_key in (
        "current_patient",
        "current_measurement",
        "server_time",
        "uptime_seconds",
        "runtime_persistence",
    ):
        state.pop(derived_key, None)

    state.setdefault("device_model", "EYM-2000")
    state.setdefault("software_version", "2.4.1")
    state.setdefault("firmware_version", "2.4.1")
    state.setdefault("device_status", "READY")
    state.setdefault("sensor_connected", True)
    state.setdefault("sensor_quality", 96)
    state.setdefault("calibrated", True)
    state.setdefault("selected_eye", "LEFT")
    state.setdefault("battery_level", 85)
    state.setdefault("temperature", 36.7)
    state.setdefault("patient_id", None)
    state.setdefault("measurement_in_progress", False)
    state.setdefault("last_calibration", None)
    state.setdefault("patients", [])
    state.setdefault("measurements", [])
    state.setdefault("history", [])
    state.setdefault("settings", {})
    state.setdefault("measurement_profile", {})

    settings = state["settings"]
    settings.setdefault("measurement_duration_seconds", 2)
    settings.setdefault("minimum_quality", 70)
    settings.setdefault("valid_pressure_min", 5.0)
    settings.setdefault("valid_pressure_max", 35.0)
    settings.setdefault("sensor_default_quality", 96)
    settings.setdefault("randomize_measurements", False)
    settings.setdefault("require_calibration_after_reconnect", False)
    settings.setdefault("sound_enabled", True)

    profile = state["measurement_profile"]
    profile.setdefault("LEFT", {"pressure": 18.4, "quality": 96})
    profile.setdefault("RIGHT", {"pressure": 19.1, "quality": 94})

    # If Codespaces/backend stopped while an operation was running,
    # restore a coherent idle state on the next startup.
    was_transient = state.get("device_status") in {"MEASURING", "CALIBRATING", "SELF_TEST"}
    if state.get("measurement_in_progress") or was_transient:
        state["measurement_in_progress"] = False

    if was_transient:
        if not state["sensor_connected"]:
            state["device_status"] = "NOT_READY"
        elif state["calibrated"]:
            state["device_status"] = "READY"
        else:
            state["device_status"] = "NOT_READY"

    return state


def write_runtime_state(state: dict):
    """Atomic write so a partial file is not left behind if the process stops."""

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    temporary_path = RUNTIME_PATH.with_suffix(".tmp")

    with open(temporary_path, "w", encoding="utf-8") as file:
        json.dump(state, file, indent=2, ensure_ascii=False)
        file.write("\n")

    temporary_path.replace(RUNTIME_PATH)


def load_factory_state():
    return normalize_state(read_json(CONFIG_PATH))


def load_device_state():
    if RUNTIME_PATH.exists():
        try:
            state = normalize_state(read_json(RUNTIME_PATH))
            write_runtime_state(state)
            return state
        except (json.JSONDecodeError, OSError, TypeError, ValueError):
            # Recover from a corrupted runtime file with factory configuration.
            pass

    state = load_factory_state()
    write_runtime_state(state)
    return state


device_state = load_device_state()


def save_state():
    write_runtime_state(device_state)


def add_history(event, category="SYSTEM", **details):
    entry = {
        "timestamp": now_iso(),
        "event": event,
        "category": category,
        **details,
    }

    device_state["history"].insert(0, entry)
    device_state["history"] = device_state["history"][:500]
    return entry


def find_patient(patient_id):
    for patient in device_state["patients"]:
        if patient.get("patient_id") == patient_id:
            return patient
    return None


def get_current_patient():
    patient_id = device_state.get("patient_id")
    return find_patient(patient_id) if patient_id else None


def get_current_measurement():
    patient_id = device_state.get("patient_id")
    eye = device_state.get("selected_eye")

    if not patient_id or not eye:
        return None

    # Measurements are newest first.
    for measurement in device_state["measurements"]:
        if (
            measurement.get("patient_id") == patient_id
            and measurement.get("eye") == eye
        ):
            return measurement

    return None


def next_measurement_id():
    highest = 0

    for measurement in device_state["measurements"]:
        measurement_id = str(measurement.get("id", ""))
        if measurement_id.startswith("MSR-"):
            try:
                highest = max(highest, int(measurement_id.split("-", 1)[1]))
            except ValueError:
                pass

    return f"MSR-{highest + 1:05d}"


def build_status():
    status = copy.deepcopy(device_state)
    status["current_patient"] = copy.deepcopy(get_current_patient())
    status["current_measurement"] = copy.deepcopy(get_current_measurement())
    status["server_time"] = now_iso()
    status["uptime_seconds"] = int(
        (datetime.now() - APP_STARTED_AT).total_seconds()
    )
    status["runtime_persistence"] = (
        str(RUNTIME_PATH)
        if IS_VERCEL
        else str(RUNTIME_PATH.relative_to(BASE_DIR))
    )
    return status


def recompute_ready_state():
    if not device_state["sensor_connected"]:
        device_state["device_status"] = "NOT_READY"
    elif device_state["calibrated"]:
        device_state["device_status"] = "READY"
    else:
        device_state["device_status"] = "NOT_READY"


# =========================================================
# MODELS
# =========================================================

class EyeSelection(BaseModel):
    eye: str


class PatientUpsert(BaseModel):
    patient_id: str
    date_of_birth: str | None = None
    name: str | None = None


class PatientSelection(BaseModel):
    patient_id: str


class RuntimeRestore(BaseModel):
    state: dict


class SettingsUpdate(BaseModel):
    measurement_duration_seconds: float = Field(ge=0.2, le=15)
    minimum_quality: int = Field(ge=0, le=100)
    valid_pressure_min: float = Field(ge=0, le=100)
    valid_pressure_max: float = Field(ge=0, le=100)
    left_pressure: float = Field(ge=0, le=100)
    left_quality: int = Field(ge=0, le=100)
    right_pressure: float = Field(ge=0, le=100)
    right_quality: int = Field(ge=0, le=100)
    sensor_default_quality: int = Field(ge=0, le=100)
    randomize_measurements: bool = False
    require_calibration_after_reconnect: bool
    sound_enabled: bool


# =========================================================
# READ API
# =========================================================

@app.get("/api/status")
def get_status():
    return build_status()


@app.get("/api/measurements")
def get_measurements():
    return {"measurements": copy.deepcopy(device_state["measurements"])}


@app.get("/api/history")
def get_history():
    return {"history": copy.deepcopy(device_state["history"])}


@app.get("/api/patients")
def get_patients():
    return {
        "patients": copy.deepcopy(device_state["patients"]),
        "current_patient": copy.deepcopy(get_current_patient()),
    }


@app.get("/api/settings")
def get_settings():
    return {
        "settings": copy.deepcopy(device_state["settings"]),
        "measurement_profile": copy.deepcopy(device_state["measurement_profile"]),
    }


# =========================================================
# CONFIGURATION RESET / TEST INPUT
# =========================================================

@app.post("/api/config/reload")
def reload_configuration():
    """
    Reload backend/config/device_config.json and persist it as the new runtime.
    Useful for Robot Framework scenario preparation.
    """

    global device_state
    device_state = load_factory_state()
    add_history("Factory configuration reloaded", category="SETTINGS")
    save_state()

    return {
        "message": "Configuration reloaded",
        "device_state": build_status(),
    }


# =========================================================
# BROWSER RUNTIME RESTORE (VERCEL DEMO PERSISTENCE)
# =========================================================

@app.post("/api/runtime/restore")
def restore_runtime(payload: RuntimeRestore):
    """Restore a browser-saved EyeMee runtime snapshot.

    Vercel function filesystems are ephemeral. The published demo therefore
    keeps a browser copy of the runtime and can rehydrate a fresh function
    instance from it.
    """

    global device_state

    device_state = normalize_state(payload.state)
    save_state()

    return {
        "message": "Runtime restored",
        "device_state": build_status(),
    }


# =========================================================
# SENSOR
# =========================================================

@app.post("/api/sensor/disconnect")
def disconnect_sensor():
    if device_state["device_status"] in {"MEASURING", "CALIBRATING", "SELF_TEST"}:
        # This simulator deliberately allows disconnecting during measurement/calibration
        # because those operations already handle the fault when they resume.
        pass

    device_state["sensor_connected"] = False
    device_state["sensor_quality"] = 0
    device_state["measurement_in_progress"] = False
    device_state["device_status"] = "NOT_READY"

    add_history("Sensor disconnected", category="SENSOR")
    save_state()

    return {
        "message": "Sensor disconnected",
        "device_state": build_status(),
    }


@app.post("/api/sensor/connect")
def connect_sensor():
    settings = device_state["settings"]

    device_state["sensor_connected"] = True
    device_state["sensor_quality"] = int(
        settings.get("sensor_default_quality", 96)
    )

    if settings.get("require_calibration_after_reconnect", False):
        device_state["calibrated"] = False

    recompute_ready_state()
    add_history("Sensor connected", category="SENSOR")
    save_state()

    return {
        "message": "Sensor connected",
        "device_state": build_status(),
    }


# =========================================================
# CALIBRATION
# =========================================================

@app.post("/api/calibrate")
async def calibrate_device():
    if not device_state["sensor_connected"]:
        raise HTTPException(
            status_code=409,
            detail="Calibration impossible: sensor disconnected",
        )

    if device_state["measurement_in_progress"]:
        raise HTTPException(
            status_code=409,
            detail="Calibration impossible: measurement in progress",
        )

    device_state["device_status"] = "CALIBRATING"
    device_state["calibrated"] = False
    save_state()

    await asyncio.sleep(2)

    if not device_state["sensor_connected"]:
        device_state["device_status"] = "NOT_READY"
        add_history(
            "Calibration failed - sensor disconnected",
            category="CALIBRATION",
            result="FAIL",
        )
        save_state()

        raise HTTPException(
            status_code=409,
            detail="Calibration failed: sensor disconnected",
        )

    device_state["calibrated"] = True
    device_state["device_status"] = "READY"
    device_state["last_calibration"] = now_iso()

    add_history(
        "Calibration completed",
        category="CALIBRATION",
        result="PASS",
    )
    save_state()

    return {
        "message": "Calibration completed",
        "device_state": build_status(),
    }


# =========================================================
# EYE SELECTION
# =========================================================

@app.post("/api/eye/select")
def select_eye(selection: EyeSelection):
    eye = selection.eye.upper()

    if eye not in {"LEFT", "RIGHT"}:
        raise HTTPException(
            status_code=400,
            detail="Eye must be LEFT or RIGHT",
        )

    if device_state["device_status"] in {"MEASURING", "CALIBRATING", "SELF_TEST"}:
        raise HTTPException(
            status_code=409,
            detail="Eye selection impossible while device is busy",
        )

    device_state["selected_eye"] = eye
    save_state()

    return {
        "message": f"{eye} eye selected",
        "device_state": build_status(),
    }


# =========================================================
# PATIENTS
# =========================================================

@app.post("/api/patient/upsert")
def upsert_patient(patient: PatientUpsert):
    patient_id = patient.patient_id.strip()

    if not patient_id:
        raise HTTPException(
            status_code=400,
            detail="Patient ID is required",
        )

    existing = find_patient(patient_id)

    if existing:
        if patient.date_of_birth is not None:
            existing["date_of_birth"] = patient.date_of_birth

        if patient.name is not None:
            existing["name"] = patient.name.strip()

        action = "updated"
    else:
        existing = {
            "patient_id": patient_id,
            "name": (patient.name or "").strip(),
            "date_of_birth": patient.date_of_birth or "",
            "created_at": now_iso(),
        }
        device_state["patients"].append(existing)
        action = "created"

    device_state["patient_id"] = patient_id

    add_history(
        f"Patient {action}",
        category="PATIENT",
        patient_id=patient_id,
    )
    save_state()

    return {
        "message": f"Patient {action}",
        "device_state": build_status(),
    }


@app.post("/api/patient/select")
def select_patient(selection: PatientSelection):
    patient_id = selection.patient_id.strip()
    patient = find_patient(patient_id)

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    if device_state["device_status"] in {"MEASURING", "CALIBRATING", "SELF_TEST"}:
        raise HTTPException(
            status_code=409,
            detail="Patient selection impossible while device is busy",
        )

    device_state["patient_id"] = patient_id

    add_history(
        "Patient selected",
        category="PATIENT",
        patient_id=patient_id,
    )
    save_state()

    return {
        "message": "Patient selected",
        "device_state": build_status(),
    }


# =========================================================
# MEASUREMENT
# =========================================================

@app.post("/api/measurement/start")
async def start_measurement():
    if not device_state["sensor_connected"]:
        raise HTTPException(
            status_code=409,
            detail="Measurement impossible: sensor disconnected",
        )

    if not device_state["calibrated"]:
        raise HTTPException(
            status_code=409,
            detail="Measurement impossible: calibration required",
        )

    if device_state["device_status"] != "READY":
        raise HTTPException(
            status_code=409,
            detail="Measurement impossible: device not ready",
        )

    if not get_current_patient():
        raise HTTPException(
            status_code=400,
            detail="Measurement impossible: patient is missing",
        )

    settings = device_state["settings"]
    profile = device_state["measurement_profile"]
    selected_eye = device_state["selected_eye"]

    device_state["measurement_in_progress"] = True
    device_state["device_status"] = "MEASURING"
    save_state()

    duration = float(
        settings.get("measurement_duration_seconds", 2)
    )
    await asyncio.sleep(duration)

    if not device_state["sensor_connected"]:
        device_state["measurement_in_progress"] = False
        device_state["device_status"] = "NOT_READY"

        add_history(
            "Measurement aborted - sensor disconnected",
            category="MEASUREMENT",
            patient_id=device_state["patient_id"],
            eye=selected_eye,
            result="ABORTED",
        )
        save_state()

        raise HTTPException(
            status_code=409,
            detail="Measurement aborted: sensor disconnected",
        )

    random_mode = bool(settings.get("randomize_measurements", False))

    if random_mode:
        # Randomized simulator input mode for validation/demo purposes.
        # The generated values intentionally span both nominal and out-of-range
        # cases so the normal acceptance logic can produce VALID or INVALID.
        pressure = round(random.uniform(3.0, 40.0), 1)
        quality = random.randint(60, 100)
    else:
        eye_profile = profile.get(
            selected_eye,
            {"pressure": 18.4, "quality": 96},
        )

        pressure = float(eye_profile.get("pressure", 18.4))
        quality = int(eye_profile.get("quality", 96))

    minimum_pressure = float(settings.get("valid_pressure_min", 5.0))
    maximum_pressure = float(settings.get("valid_pressure_max", 35.0))
    minimum_quality = int(settings.get("minimum_quality", 70))

    pressure_valid = minimum_pressure <= pressure <= maximum_pressure
    quality_valid = quality >= minimum_quality
    result = "VALID" if pressure_valid and quality_valid else "INVALID"

    measurement = {
        "id": next_measurement_id(),
        "timestamp": now_iso(),
        "patient_id": device_state["patient_id"],
        "eye": selected_eye,
        "pressure": pressure,
        "quality": quality,
        "result": result,
        "input_mode": "RANDOM" if random_mode else "FIXED",
    }

    device_state["measurements"].insert(0, measurement)
    device_state["measurements"] = device_state["measurements"][:1000]
    device_state["measurement_in_progress"] = False
    device_state["device_status"] = "READY"

    add_history(
        "Measurement completed",
        category="MEASUREMENT",
        measurement_id=measurement["id"],
        patient_id=measurement["patient_id"],
        eye=measurement["eye"],
        pressure=measurement["pressure"],
        quality=measurement["quality"],
        result=measurement["result"],
    )
    save_state()

    return {
        "message": "Measurement completed",
        "measurement": measurement,
        "device_state": build_status(),
    }


# =========================================================
# SETTINGS
# =========================================================

@app.post("/api/settings")
def update_settings(settings: SettingsUpdate):
    if settings.valid_pressure_min >= settings.valid_pressure_max:
        raise HTTPException(
            status_code=400,
            detail="Minimum pressure must be lower than maximum pressure",
        )

    device_state["settings"] = {
        "measurement_duration_seconds": settings.measurement_duration_seconds,
        "minimum_quality": settings.minimum_quality,
        "valid_pressure_min": settings.valid_pressure_min,
        "valid_pressure_max": settings.valid_pressure_max,
        "sensor_default_quality": settings.sensor_default_quality,
        "randomize_measurements": settings.randomize_measurements,
        "require_calibration_after_reconnect": settings.require_calibration_after_reconnect,
        "sound_enabled": settings.sound_enabled,
    }

    device_state["measurement_profile"] = {
        "LEFT": {
            "pressure": settings.left_pressure,
            "quality": settings.left_quality,
        },
        "RIGHT": {
            "pressure": settings.right_pressure,
            "quality": settings.right_quality,
        },
    }

    if device_state["sensor_connected"]:
        device_state["sensor_quality"] = settings.sensor_default_quality

    add_history("Device settings updated", category="SETTINGS")
    save_state()

    return {
        "message": "Settings updated",
        "device_state": build_status(),
    }


# =========================================================
# SYSTEM SELF TEST
# =========================================================

@app.post("/api/system/self-test")
async def run_self_test():
    if device_state["device_status"] in {"MEASURING", "CALIBRATING", "SELF_TEST"}:
        raise HTTPException(
            status_code=409,
            detail="Self test impossible while device is busy",
        )

    device_state["device_status"] = "SELF_TEST"
    save_state()

    await asyncio.sleep(1)

    passed = bool(device_state["sensor_connected"])

    if passed:
        recompute_ready_state()
        result = "PASS"
    else:
        device_state["device_status"] = "NOT_READY"
        result = "FAIL"

    add_history(
        f"Self test {result.lower()}",
        category="SYSTEM",
        result=result,
    )
    save_state()

    return {
        "message": f"Self test {result}",
        "result": result,
        "device_state": build_status(),
    }


# =========================================================
# FRONTEND
# =========================================================

@app.get("/")
def home():
    return RedirectResponse(url="/app/")


app.mount(
    "/app",
    StaticFiles(directory=str(FRONTEND_DIR), html=True),
    name="frontend",
)
