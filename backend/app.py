import asyncio
import json
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel


# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

CONFIG_PATH = (
    BASE_DIR
    / "backend"
    / "config"
    / "device_config.json"
)

FRONTEND_DIR = BASE_DIR / "app"


# =========================================================
# APPLICATION
# =========================================================

app = FastAPI(
    title="EyeMee API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# CONFIGURATION
# =========================================================

def normalize_device_state(state):

    state.setdefault(
        "history",
        []
    )

    state.setdefault(
        "measurements_by_eye",
        {
            "LEFT": None,
            "RIGHT": None
        }
    )

    state["measurements_by_eye"].setdefault(
        "LEFT",
        None
    )

    state["measurements_by_eye"].setdefault(
        "RIGHT",
        None
    )

    state.setdefault(
        "last_measurement",
        None
    )

    state.setdefault(
        "measurement_in_progress",
        False
    )

    # Migration automatique d'une ancienne mesure
    # vers la mémoire LEFT / RIGHT.
    last_measurement = state.get(
        "last_measurement"
    )

    if last_measurement:

        eye = last_measurement.get(
            "eye"
        )

        if (
            eye in ["LEFT", "RIGHT"]
            and
            state["measurements_by_eye"].get(
                eye
            ) is None
        ):

            state[
                "measurements_by_eye"
            ][eye] = last_measurement

    return state


def load_device_state():

    with open(
        CONFIG_PATH,
        "r",
        encoding="utf-8"
    ) as config_file:

        state = json.load(
            config_file
        )

    return normalize_device_state(
        state
    )


device_state = load_device_state()


# =========================================================
# MODELS
# =========================================================

class EyeSelection(BaseModel):
    eye: str


# =========================================================
# STATUS
# =========================================================

@app.get("/api/status")
def get_status():

    return device_state


# =========================================================
# CONFIG RELOAD
# =========================================================

@app.post("/api/config/reload")
def reload_configuration():

    global device_state

    device_state = load_device_state()

    return {
        "message": "Configuration reloaded",
        "device_state": device_state
    }


# =========================================================
# SENSOR
# =========================================================

@app.post("/api/sensor/disconnect")
def disconnect_sensor():

    device_state["sensor_connected"] = False
    device_state["sensor_quality"] = 0
    device_state["device_status"] = "NOT_READY"
    device_state["measurement_in_progress"] = False

    timestamp = datetime.now().isoformat(
        timespec="seconds"
    )

    device_state["history"].insert(
        0,
        {
            "timestamp": timestamp,
            "event": "Sensor disconnected"
        }
    )

    return {
        "message": "Sensor disconnected",
        "device_state": device_state
    }


@app.post("/api/sensor/connect")
def connect_sensor():

    device_state["sensor_connected"] = True
    device_state["sensor_quality"] = 96

    if device_state["calibrated"]:

        device_state["device_status"] = "READY"

    else:

        device_state["device_status"] = "NOT_READY"

    timestamp = datetime.now().isoformat(
        timespec="seconds"
    )

    device_state["history"].insert(
        0,
        {
            "timestamp": timestamp,
            "event": "Sensor connected"
        }
    )

    return {
        "message": "Sensor connected",
        "device_state": device_state
    }


# =========================================================
# CALIBRATION
# =========================================================

@app.post("/api/calibrate")
async def calibrate_device():

    if not device_state["sensor_connected"]:

        raise HTTPException(
            status_code=409,
            detail="Calibration impossible: sensor disconnected"
        )

    if device_state["measurement_in_progress"]:

        raise HTTPException(
            status_code=409,
            detail="Calibration impossible: measurement in progress"
        )

    device_state["device_status"] = "CALIBRATING"
    device_state["calibrated"] = False

    await asyncio.sleep(2)

    device_state["calibrated"] = True
    device_state["device_status"] = "READY"

    timestamp = datetime.now().isoformat(
        timespec="seconds"
    )

    device_state["history"].insert(
        0,
        {
            "timestamp": timestamp,
            "event": "Calibration completed"
        }
    )

    return {
        "message": "Calibration completed",
        "device_state": device_state
    }


# =========================================================
# EYE SELECTION
# =========================================================

@app.post("/api/eye/select")
def select_eye(selection: EyeSelection):

    eye = selection.eye.upper()

    if eye not in ["LEFT", "RIGHT"]:

        raise HTTPException(
            status_code=400,
            detail="Eye must be LEFT or RIGHT"
        )

    if device_state["measurement_in_progress"]:

        raise HTTPException(
            status_code=409,
            detail="Eye selection impossible during measurement"
        )

    device_state["selected_eye"] = eye

    return {
        "message": f"{eye} eye selected",
        "device_state": device_state
    }


# =========================================================
# MEASUREMENT
# =========================================================

@app.post("/api/measurement/start")
async def start_measurement():

    # -----------------------------------------------------
    # PRECONDITIONS
    # -----------------------------------------------------

    if not device_state["sensor_connected"]:

        raise HTTPException(
            status_code=409,
            detail="Measurement impossible: sensor disconnected"
        )

    if not device_state["calibrated"]:

        raise HTTPException(
            status_code=409,
            detail="Measurement impossible: calibration required"
        )

    if device_state["device_status"] != "READY":

        raise HTTPException(
            status_code=409,
            detail="Measurement impossible: device not ready"
        )

    if not device_state.get("patient_id"):

        raise HTTPException(
            status_code=400,
            detail="Measurement impossible: patient ID missing"
        )


    # -----------------------------------------------------
    # START
    # -----------------------------------------------------

    device_state["measurement_in_progress"] = True
    device_state["device_status"] = "MEASURING"

    profile = device_state[
        "measurement_profile"
    ]

    duration = float(
        profile.get(
            "duration_seconds",
            2
        )
    )

    await asyncio.sleep(
        duration
    )


    # -----------------------------------------------------
    # SIMULATED VALUES
    # -----------------------------------------------------

    pressure = float(
        profile.get(
            "pressure",
            18.4
        )
    )

    quality = int(
        profile.get(
            "quality",
            96
        )
    )

    minimum_pressure = float(
        profile.get(
            "valid_pressure_min",
            5.0
        )
    )

    maximum_pressure = float(
        profile.get(
            "valid_pressure_max",
            35.0
        )
    )

    minimum_quality = int(
        profile.get(
            "minimum_quality",
            70
        )
    )

    pressure_valid = (
        minimum_pressure
        <= pressure
        <= maximum_pressure
    )

    quality_valid = (
        quality
        >= minimum_quality
    )

    result = (
        "VALID"
        if pressure_valid
        and quality_valid
        else "INVALID"
    )


    # -----------------------------------------------------
    # MEASUREMENT OBJECT
    # -----------------------------------------------------

    timestamp = datetime.now().isoformat(
        timespec="seconds"
    )

    selected_eye = device_state[
        "selected_eye"
    ]

    measurement = {

        "timestamp": timestamp,

        "patient_id":
            device_state["patient_id"],

        "eye":
            selected_eye,

        "pressure":
            pressure,

        "quality":
            quality,

        "result":
            result
    }


    # -----------------------------------------------------
    # SAVE RESULT
    # -----------------------------------------------------

    # Dernière mesure globale
    device_state[
        "last_measurement"
    ] = measurement


    # Dernière mesure propre à l'œil sélectionné
    device_state[
        "measurements_by_eye"
    ][selected_eye] = measurement


    device_state[
        "measurement_in_progress"
    ] = False


    device_state[
        "device_status"
    ] = "READY"


    # -----------------------------------------------------
    # HISTORY
    # -----------------------------------------------------

    device_state["history"].insert(
        0,
        {
            "timestamp": timestamp,
            "event": "Measurement completed",
            "patient_id":
                device_state["patient_id"],
            "eye":
                selected_eye,
            "pressure":
                pressure,
            "quality":
                quality,
            "result":
                result
        }
    )


    return {
        "message": "Measurement completed",
        "measurement": measurement,
        "device_state": device_state
    }


# =========================================================
# FRONTEND
# =========================================================

@app.get("/")
def home():

    return RedirectResponse(
        url="/app/"
    )


app.mount(
    "/app",
    StaticFiles(
        directory=str(FRONTEND_DIR),
        html=True
    ),
    name="frontend"
)