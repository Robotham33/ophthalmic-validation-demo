import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles


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
# DEVICE CONFIGURATION
# =========================================================

def load_device_state():

    with open(
        CONFIG_PATH,
        "r",
        encoding="utf-8"
    ) as config_file:

        return json.load(config_file)


device_state = load_device_state()


# =========================================================
# API
# =========================================================

@app.get("/api/status")
def get_status():

    return device_state


@app.post("/api/config/reload")
def reload_configuration():

    global device_state

    device_state = load_device_state()

    return {
        "message": "Configuration reloaded",
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

@app.post("/api/sensor/disconnect")
def disconnect_sensor():
    device_state["sensor_connected"] = False
    device_state["sensor_quality"] = 0
    device_state["device_status"] = "NOT_READY"

    return {
        "message": "Sensor disconnected",
        "device_state": device_state
    }


@app.post("/api/sensor/connect")
def connect_sensor():
    device_state["sensor_connected"] = True
    device_state["sensor_quality"] = 96
    device_state["device_status"] = "READY"

    return {
        "message": "Sensor connected",
        "device_state": device_state
    }

app.mount(
    "/app",
    StaticFiles(
        directory=str(FRONTEND_DIR),
        html=True
    ),
    name="frontend"
)