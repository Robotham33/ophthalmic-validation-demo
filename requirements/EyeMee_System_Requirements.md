# EyeMee System Requirements Specification

**Document ID:** EYM-SRS-001  
**Project:** EyeMee Ophthalmic Validation Demo  
**Document Type:** System / Software Requirements Specification  
**Version:** 1.0  
**Status:** Baseline for verification  
**Language:** English  

---

## 1. Purpose

This document defines the system and software requirements implemented by the EyeMee Ophthalmic Validation Demo.

The requirements are intended to be used as the reference for:

- functional verification;
- automated UI testing with Robot Framework;
- REST API verification;
- component testing where applicable;
- requirements-to-test traceability;
- regression testing.

EyeMee is a demonstration and training system. It is not a medical device.

The simulated pressure values, quality values and acceptance thresholds used by the application are pedagogical software criteria and shall not be interpreted as medical acceptance criteria.

---

## 2. Requirement identification

System requirements use the following identifier:

`SYS-REQ-XXX`

Example:

`SYS-REQ-005`

Each requirement shall be traceable to one or more verification Test Cases.

---

## 3. Verification methods

The following verification methods are used in this project:

| Method | Description |
|---|---|
| Robot UI | Automated functional verification through the web interface using Robot Framework and Browser Library |
| API | REST API verification against the FastAPI backend |
| GoogleTest | Component-level verification of C++ logic |
| Inspection | Static inspection of displayed information or software configuration |
| Combined | Verification requiring more than one test level |

---

# 4. Sensor Management

## SYS-REQ-001 — Sensor connection status

**Requirement**

The system shall display the current sensor connection status as `CONNECTED` or `DISCONNECTED`.

**Verification method**

Robot UI / API.

---

## SYS-REQ-002 — Sensor connection

**Requirement**

The system shall allow the user to connect the sensor when the sensor is disconnected.

**Verification method**

Robot UI / API.

---

## SYS-REQ-003 — Sensor disconnection

**Requirement**

The system shall allow the user to disconnect the sensor when the sensor is connected.

**Verification method**

Robot UI / API.

---

## SYS-REQ-004 — Device state after sensor disconnection

**Requirement**

When the sensor is disconnected, the device status shall be `NOT_READY`.

**Verification method**

Robot UI / API.

---

## SYS-REQ-005 — Measurement inhibition with disconnected sensor

**Requirement**

When the sensor is disconnected, the system shall prevent measurement execution.

**Verification method**

Robot UI / API.

---

## SYS-REQ-006 — Calibration inhibition with disconnected sensor

**Requirement**

When the sensor is disconnected, the system shall prevent calibration execution.

**Verification method**

Robot UI / API.

---

## SYS-REQ-007 — Sensor quality

**Requirement**

When the sensor is connected, the system shall expose and display the current simulated sensor quality.

**Verification method**

Robot UI / API.

---

## SYS-REQ-008 — Sensor quality unavailable

**Requirement**

When the sensor is disconnected, the sensor quality shall be set to zero and the user interface shall indicate that sensor quality is unavailable.

**Verification method**

Robot UI / API.

---

# 5. Calibration

## SYS-REQ-009 — Calibration command

**Requirement**

The system shall allow the user to initiate device calibration when the sensor is connected and the device is not busy.

**Verification method**

Robot UI / API.

---

## SYS-REQ-010 — Calibration state

**Requirement**

During calibration execution, the device status shall be `CALIBRATING`.

**Verification method**

Robot UI / API.

---

## SYS-REQ-011 — Calibration state invalidation during execution

**Requirement**

When a calibration sequence starts, the current calibration state shall be temporarily considered invalid until the calibration successfully completes.

**Verification method**

API / Robot UI.

---

## SYS-REQ-012 — Successful calibration

**Requirement**

After a successful calibration, the system shall set the calibration status to `CALIBRATED`.

**Verification method**

Robot UI / API.

---

## SYS-REQ-013 — Ready state after calibration

**Requirement**

After successful calibration with the sensor connected, the device status shall become `READY`.

**Verification method**

Robot UI / API.

---

## SYS-REQ-014 — Calibration timestamp

**Requirement**

After successful calibration, the system shall record the calibration completion timestamp.

**Verification method**

Robot UI / API.

---

## SYS-REQ-015 — Calibration history

**Requirement**

After successful calibration, the system shall create a `CALIBRATION` history event with result `PASS`.

**Verification method**

Robot UI / API.

---

## SYS-REQ-016 — Calibration interrupted by sensor loss

**Requirement**

If the sensor becomes disconnected during calibration, the calibration shall fail and the device shall enter the `NOT_READY` state.

**Verification method**

API / Robot UI.

---

# 6. Eye Selection

## SYS-REQ-017 — LEFT eye selection

**Requirement**

The system shall allow the user to select the `LEFT` eye.

**Verification method**

Robot UI / API.

---

## SYS-REQ-018 — RIGHT eye selection

**Requirement**

The system shall allow the user to select the `RIGHT` eye.

**Verification method**

Robot UI / API.

---

## SYS-REQ-019 — Selected eye indication

**Requirement**

The currently selected eye shall be visually identifiable in the user interface.

**Verification method**

Robot UI.

---

## SYS-REQ-020 — Eye selection persistence in runtime state

**Requirement**

The selected eye shall be stored in the current application runtime state.

**Verification method**

API.

---

## SYS-REQ-021 — Eye selection while busy

**Requirement**

The system shall prevent eye selection changes while the device is `MEASURING`, `CALIBRATING` or executing a `SELF_TEST`.

**Verification method**

Robot UI / API.

---

## SYS-REQ-022 — Invalid eye value

**Requirement**

The API shall reject an eye selection value other than `LEFT` or `RIGHT`.

**Verification method**

API.

---

# 7. Patient Management

## SYS-REQ-023 — Patient creation

**Requirement**

The system shall allow the user to create a patient record.

**Verification method**

Robot UI / API.

---

## SYS-REQ-024 — Mandatory patient identifier

**Requirement**

A patient record shall require a non-empty Patient ID.

**Verification method**

Robot UI / API.

---

## SYS-REQ-025 — Optional patient name

**Requirement**

The system shall support an optional patient name.

**Verification method**

Robot UI / API.

---

## SYS-REQ-026 — Optional date of birth

**Requirement**

The system shall support an optional patient date of birth.

**Verification method**

Robot UI / API.

---

## SYS-REQ-027 — Patient update

**Requirement**

When an existing Patient ID is submitted, the system shall update the corresponding patient record instead of creating a duplicate record.

**Verification method**

Robot UI / API.

---

## SYS-REQ-028 — Automatic patient selection after creation

**Requirement**

After a patient is created or updated, that patient shall become the active patient.

**Verification method**

Robot UI / API.

---

## SYS-REQ-029 — Existing patient selection

**Requirement**

The system shall allow the user to select an existing patient as the active patient.

**Verification method**

Robot UI / API.

---

## SYS-REQ-030 — Unknown patient selection

**Requirement**

The API shall reject the selection of a Patient ID that does not exist.

**Verification method**

API.

---

## SYS-REQ-031 — Patient selection while busy

**Requirement**

The system shall prevent a patient change while the device is `MEASURING`, `CALIBRATING` or executing a `SELF_TEST`.

**Verification method**

API / Robot UI.

---

## SYS-REQ-032 — Active patient display

**Requirement**

The Patients view shall identify the currently active patient.

**Verification method**

Robot UI.

---

## SYS-REQ-033 — Active patient context on Dashboard

**Requirement**

The Dashboard shall display the active Patient ID and its configured date of birth.

**Verification method**

Robot UI.

---

## SYS-REQ-034 — Patient measurement count

**Requirement**

The Patients view shall display the number of stored measurements associated with each patient.

**Verification method**

Robot UI.

---

# 8. Measurement Preconditions

## SYS-REQ-035 — Sensor measurement precondition

**Requirement**

A measurement shall only start when the sensor is connected.

**Verification method**

Robot UI / API.

---

## SYS-REQ-036 — Calibration measurement precondition

**Requirement**

A measurement shall only start when the device is calibrated.

**Verification method**

Robot UI / API.

---

## SYS-REQ-037 — Ready-state measurement precondition

**Requirement**

A measurement shall only start when the device status is `READY`.

**Verification method**

Robot UI / API.

---

## SYS-REQ-038 — Patient measurement precondition

**Requirement**

A measurement shall only start when an active patient exists.

**Verification method**

Robot UI / API.

---

## SYS-REQ-039 — Measurement button availability

**Requirement**

The user interface shall enable the measurement command only when all measurement preconditions are satisfied.

**Verification method**

Robot UI.

---

## SYS-REQ-040 — Measurement command disabled when not ready

**Requirement**

The user interface shall disable the measurement command whenever the sensor, calibration, device state or patient preconditions are not satisfied.

**Verification method**

Robot UI.

---

# 9. Measurement Execution

## SYS-REQ-041 — Start measurement

**Requirement**

The system shall allow the user to start a measurement when all measurement preconditions are satisfied.

**Verification method**

Robot UI / API.

---

## SYS-REQ-042 — Measuring state

**Requirement**

During measurement execution, the device status shall be `MEASURING`.

**Verification method**

Robot UI / API.

---

## SYS-REQ-043 — Measurement-in-progress state

**Requirement**

During measurement execution, the runtime state shall indicate that a measurement is in progress.

**Verification method**

API.

---

## SYS-REQ-044 — Duplicate measurement prevention

**Requirement**

The system shall prevent the user from starting another measurement while a measurement is already in progress.

**Verification method**

Robot UI.

---

## SYS-REQ-045 — Configurable measurement duration

**Requirement**

The duration of the simulated measurement sequence shall use the configured measurement duration.

**Verification method**

API / Robot UI.

---

## SYS-REQ-046 — Measurement identifier

**Requirement**

Each completed measurement shall contain a unique measurement identifier using the format `MSR-XXXXX`.

**Verification method**

API / Robot UI.

---

## SYS-REQ-047 — Measurement timestamp

**Requirement**

Each completed measurement shall contain a timestamp.

**Verification method**

API / Robot UI.

---

## SYS-REQ-048 — Patient association

**Requirement**

Each completed measurement shall be associated with the active Patient ID.

**Verification method**

API / Robot UI.

---

## SYS-REQ-049 — Eye association

**Requirement**

Each completed measurement shall be associated with the eye selected when the measurement started.

**Verification method**

API / Robot UI.

---

## SYS-REQ-050 — Pressure result

**Requirement**

Each completed measurement shall contain a simulated pressure value.

**Verification method**

Robot UI / API.

---

## SYS-REQ-051 — Quality result

**Requirement**

Each completed measurement shall contain a simulated quality value.

**Verification method**

Robot UI / API.

---

## SYS-REQ-052 — Measurement result classification

**Requirement**

Each completed measurement shall contain a validation result of either `VALID` or `INVALID`.

**Verification method**

Robot UI / API.

---

## SYS-REQ-053 — Device state after measurement

**Requirement**

After a successfully completed measurement, the device status shall return to `READY`.

**Verification method**

Robot UI / API.

---

## SYS-REQ-054 — Measurement history event

**Requirement**

A successfully completed measurement shall create a `MEASUREMENT` history event containing the measurement identifier, patient, eye, pressure, quality and validation result.

**Verification method**

Robot UI / API.

---

## SYS-REQ-055 — Measurement abortion after sensor loss

**Requirement**

If the sensor becomes disconnected while a measurement is running, the measurement shall be aborted and the device shall enter the `NOT_READY` state.

**Verification method**

API / Robot UI.

---

# 10. Measurement Validation

The pressure and quality thresholds defined below are software simulation acceptance criteria only.

## SYS-REQ-056 — Valid measurement rule

**Requirement**

A measurement shall be classified as `VALID` when both of the following conditions are satisfied:

- pressure is greater than or equal to the configured minimum valid pressure;
- pressure is less than or equal to the configured maximum valid pressure;
- quality is greater than or equal to the configured minimum quality.

**Verification method**

Robot UI / API / GoogleTest where applicable.

---

## SYS-REQ-057 — Pressure below minimum

**Requirement**

A measurement shall be classified as `INVALID` when its pressure is below the configured minimum valid pressure.

**Verification method**

Robot UI / API / GoogleTest.

---

## SYS-REQ-058 — Pressure above maximum

**Requirement**

A measurement shall be classified as `INVALID` when its pressure is above the configured maximum valid pressure.

**Verification method**

Robot UI / API / GoogleTest.

---

## SYS-REQ-059 — Quality below minimum

**Requirement**

A measurement shall be classified as `INVALID` when its quality is below the configured minimum quality.

**Verification method**

Robot UI / API.

---

## SYS-REQ-060 — Minimum pressure boundary

**Requirement**

A pressure exactly equal to the configured minimum valid pressure shall satisfy the pressure acceptance criterion.

**Verification method**

Robot UI / API / GoogleTest.

---

## SYS-REQ-061 — Maximum pressure boundary

**Requirement**

A pressure exactly equal to the configured maximum valid pressure shall satisfy the pressure acceptance criterion.

**Verification method**

Robot UI / API / GoogleTest.

---

## SYS-REQ-062 — Minimum quality boundary

**Requirement**

A quality exactly equal to the configured minimum quality shall satisfy the quality acceptance criterion.

**Verification method**

Robot UI / API.

---

## SYS-REQ-063 — Independent eye profiles

**Requirement**

The system shall use an independent configured pressure and quality profile for the LEFT and RIGHT eyes.

**Verification method**

Robot UI / API.

---

## SYS-REQ-064 — Latest result per patient and eye

**Requirement**

The Dashboard shall display the most recent stored measurement corresponding to the active patient and currently selected eye.

**Verification method**

Robot UI / API.

---

# 11. Measurements View

## SYS-REQ-065 — Measurement storage

**Requirement**

Completed measurements shall be stored in the runtime measurement collection.

**Verification method**

API.

---

## SYS-REQ-066 — Measurement table

**Requirement**

The Measurements view shall display stored measurements in a table.

**Verification method**

Robot UI.

---

## SYS-REQ-067 — Measurement table information

**Requirement**

For each stored measurement, the Measurements view shall display:

- measurement ID;
- date and time;
- Patient ID;
- eye;
- pressure;
- quality;
- result.

**Verification method**

Robot UI.

---

## SYS-REQ-068 — Patient filter

**Requirement**

The Measurements view shall allow the user to filter measurements by patient.

**Verification method**

Robot UI.

---

## SYS-REQ-069 — Eye filter

**Requirement**

The Measurements view shall allow the user to filter measurements by LEFT or RIGHT eye.

**Verification method**

Robot UI.

---

## SYS-REQ-070 — Result filter

**Requirement**

The Measurements view shall allow the user to filter measurements by `VALID` or `INVALID` result.

**Verification method**

Robot UI.

---

## SYS-REQ-071 — Measurement count

**Requirement**

The Measurements view shall display the total number of stored measurements.

**Verification method**

Robot UI.

---

## SYS-REQ-072 — Valid result rate

**Requirement**

The Measurements view shall display the percentage of stored measurements having a `VALID` result.

**Verification method**

Robot UI.

---

## SYS-REQ-073 — Tested patient count

**Requirement**

The Measurements view shall display the number of unique patients having at least one stored measurement.

**Verification method**

Robot UI.

---

## SYS-REQ-074 — Latest measurement summary

**Requirement**

The Measurements view shall display a summary of the latest stored measurement.

**Verification method**

Robot UI.

---

# 12. History and Traceability

## SYS-REQ-075 — History storage

**Requirement**

The system shall maintain a chronological history of significant runtime events.

**Verification method**

API / Robot UI.

---

## SYS-REQ-076 — History timestamp

**Requirement**

Each history entry shall contain a timestamp.

**Verification method**

API / Robot UI.

---

## SYS-REQ-077 — History category

**Requirement**

Each history entry shall contain an event category.

**Verification method**

API / Robot UI.

---

## SYS-REQ-078 — Measurement events

**Requirement**

The History view shall support `MEASUREMENT` events.

**Verification method**

Robot UI.

---

## SYS-REQ-079 — Calibration events

**Requirement**

The History view shall support `CALIBRATION` events.

**Verification method**

Robot UI.

---

## SYS-REQ-080 — Sensor events

**Requirement**

The History view shall support `SENSOR` events.

**Verification method**

Robot UI.

---

## SYS-REQ-081 — Patient events

**Requirement**

The History view shall support `PATIENT` events.

**Verification method**

Robot UI.

---

## SYS-REQ-082 — Settings events

**Requirement**

The History view shall support `SETTINGS` events.

**Verification method**

Robot UI.

---

## SYS-REQ-083 — System events

**Requirement**

The History view shall support `SYSTEM` events.

**Verification method**

Robot UI.

---

## SYS-REQ-084 — History category filtering

**Requirement**

The user shall be able to filter the History view by event category.

**Verification method**

Robot UI.

---

# 13. Device Settings

## SYS-REQ-085 — Settings interface

**Requirement**

The system shall provide a Device Settings view allowing test parameters to be modified without changing application source code.

**Verification method**

Robot UI.

---

## SYS-REQ-086 — Measurement duration setting

**Requirement**

The simulated measurement duration shall be configurable between 0.2 and 15 seconds.

**Verification method**

Robot UI / API.

---

## SYS-REQ-087 — Minimum quality setting

**Requirement**

The minimum accepted quality shall be configurable from 0 to 100 percent.

**Verification method**

Robot UI / API.

---

## SYS-REQ-088 — Minimum pressure setting

**Requirement**

The minimum valid pressure shall be configurable from 0 to 100.

**Verification method**

Robot UI / API.

---

## SYS-REQ-089 — Maximum pressure setting

**Requirement**

The maximum valid pressure shall be configurable from 0 to 100.

**Verification method**

Robot UI / API.

---

## SYS-REQ-090 — Pressure threshold consistency

**Requirement**

The system shall reject a settings configuration where the minimum valid pressure is greater than or equal to the maximum valid pressure.

**Verification method**

API / Robot UI.

---

## SYS-REQ-091 — LEFT pressure setting

**Requirement**

The simulated LEFT eye pressure shall be configurable.

**Verification method**

Robot UI / API.

---

## SYS-REQ-092 — LEFT quality setting

**Requirement**

The simulated LEFT eye quality shall be configurable from 0 to 100 percent.

**Verification method**

Robot UI / API.

---

## SYS-REQ-093 — RIGHT pressure setting

**Requirement**

The simulated RIGHT eye pressure shall be configurable.

**Verification method**

Robot UI / API.

---

## SYS-REQ-094 — RIGHT quality setting

**Requirement**

The simulated RIGHT eye quality shall be configurable from 0 to 100 percent.

**Verification method**

Robot UI / API.

---

## SYS-REQ-095 — Default sensor quality setting

**Requirement**

The sensor quality applied when the sensor is connected shall be configurable from 0 to 100 percent.

**Verification method**

Robot UI / API.

---

## SYS-REQ-096 — Calibration-after-reconnect option

**Requirement**

The system shall provide a configuration option requiring a new calibration after each sensor reconnection.

**Verification method**

Robot UI / API.

---

## SYS-REQ-097 — Reconnect calibration behaviour

**Requirement**

When the calibration-after-reconnect option is enabled, reconnecting the sensor shall invalidate the current calibration and leave the device `NOT_READY` until calibration is completed.

**Verification method**

Robot UI / API.

---

## SYS-REQ-098 — Sound setting storage

**Requirement**

The system shall provide and store a sound feedback configuration option.

**Verification method**

Robot UI / API.

**Note**

The current demo stores this setting but does not implement audible feedback.

---

## SYS-REQ-099 — Settings history event

**Requirement**

Saving device settings shall create a `SETTINGS` history event.

**Verification method**

Robot UI / API.

---

# 14. System and Diagnostics

## SYS-REQ-100 — Device model display

**Requirement**

The System view shall display the simulated device model.

**Verification method**

Robot UI.

---

## SYS-REQ-101 — Software version display

**Requirement**

The System view shall display the application software version.

**Verification method**

Robot UI.

---

## SYS-REQ-102 — Firmware version display

**Requirement**

The System view shall display the simulated firmware version.

**Verification method**

Robot UI.

---

## SYS-REQ-103 — System sensor status

**Requirement**

The System view shall display the current sensor connection state.

**Verification method**

Robot UI.

---

## SYS-REQ-104 — System device status

**Requirement**

The System view shall display the current device status.

**Verification method**

Robot UI.

---

## SYS-REQ-105 — API status

**Requirement**

The System view shall indicate whether communication with the backend API is available.

**Verification method**

Robot UI.

---

## SYS-REQ-106 — Backend runtime information

**Requirement**

The System view shall display the backend address, application uptime and runtime persistence location.

**Verification method**

Robot UI.

---

## SYS-REQ-107 — System selected eye

**Requirement**

The System view shall display the currently selected eye.

**Verification method**

Robot UI.

---

## SYS-REQ-108 — System active patient

**Requirement**

The System view shall display the active Patient ID.

**Verification method**

Robot UI.

---

## SYS-REQ-109 — Runtime state debug view

**Requirement**

The System view shall provide a representation of the current runtime state for demonstration and debugging purposes.

**Verification method**

Robot UI / Inspection.

---

## SYS-REQ-110 — Self-test execution

**Requirement**

The system shall allow the user to execute a simulated system self-test when the device is not busy.

**Verification method**

Robot UI / API.

---

## SYS-REQ-111 — Self-test with connected sensor

**Requirement**

The simulated self-test shall return `PASS` when the sensor is connected.

**Verification method**

Robot UI / API.

---

## SYS-REQ-112 — Self-test with disconnected sensor

**Requirement**

The simulated self-test shall return `FAIL` when the sensor is disconnected.

**Verification method**

Robot UI / API.

---

## SYS-REQ-113 — Self-test history

**Requirement**

A completed self-test shall create a `SYSTEM` history entry containing its result.

**Verification method**

Robot UI / API.

---

# 15. REST API

## SYS-REQ-114 — Status API

**Requirement**

The application shall expose the current runtime state through:

`GET /api/status`

**Verification method**

API.

---

## SYS-REQ-115 — Measurements API

**Requirement**

The application shall expose stored measurements through:

`GET /api/measurements`

**Verification method**

API.

---

## SYS-REQ-116 — History API

**Requirement**

The application shall expose stored history events through:

`GET /api/history`

**Verification method**

API.

---

## SYS-REQ-117 — Patients API

**Requirement**

The application shall expose patient data and the current patient through:

`GET /api/patients`

**Verification method**

API.

---

## SYS-REQ-118 — Settings API

**Requirement**

The application shall expose device settings and simulated measurement profiles through:

`GET /api/settings`

**Verification method**

API.

---

## SYS-REQ-119 — Sensor connect API

**Requirement**

The application shall provide a sensor connection command through:

`POST /api/sensor/connect`

**Verification method**

API.

---

## SYS-REQ-120 — Sensor disconnect API

**Requirement**

The application shall provide a sensor disconnection command through:

`POST /api/sensor/disconnect`

**Verification method**

API.

---

## SYS-REQ-121 — Calibration API

**Requirement**

The application shall provide a calibration command through:

`POST /api/calibrate`

**Verification method**

API.

---

## SYS-REQ-122 — Eye selection API

**Requirement**

The application shall provide eye selection through:

`POST /api/eye/select`

**Verification method**

API.

---

## SYS-REQ-123 — Patient upsert API

**Requirement**

The application shall provide patient creation and update through:

`POST /api/patient/upsert`

**Verification method**

API.

---

## SYS-REQ-124 — Patient selection API

**Requirement**

The application shall provide active patient selection through:

`POST /api/patient/select`

**Verification method**

API.

---

## SYS-REQ-125 — Measurement API

**Requirement**

The application shall provide measurement execution through:

`POST /api/measurement/start`

**Verification method**

API.

---

## SYS-REQ-126 — Settings update API

**Requirement**

The application shall provide settings modification through:

`POST /api/settings`

**Verification method**

API.

---

## SYS-REQ-127 — Self-test API

**Requirement**

The application shall provide system self-test execution through:

`POST /api/system/self-test`

**Verification method**

API.

---

## SYS-REQ-128 — Factory configuration reload

**Requirement**

The application shall provide a mechanism to reload the factory device configuration through:

`POST /api/config/reload`

**Verification method**

API.

**Rationale**

This endpoint provides deterministic scenario preparation for automated validation.

---

# 16. Runtime Persistence

## SYS-REQ-129 — Runtime state persistence

**Requirement**

Stable EyeMee runtime state shall be persisted so that recorded application state can survive normal page reloads.

**Verification method**

Robot UI / API.

---

## SYS-REQ-130 — Measurement persistence

**Requirement**

Completed measurements shall remain available after a normal browser page reload.

**Verification method**

Robot UI.

---

## SYS-REQ-131 — Patient persistence

**Requirement**

Patient records shall remain available after a normal browser page reload.

**Verification method**

Robot UI.

---

## SYS-REQ-132 — History persistence

**Requirement**

History events shall remain available after a normal browser page reload.

**Verification method**

Robot UI.

---

## SYS-REQ-133 — Settings persistence

**Requirement**

Saved device settings shall remain available after a normal browser page reload.

**Verification method**

Robot UI.

---

## SYS-REQ-134 — Transient operation recovery

**Requirement**

Transient states such as `MEASURING`, `CALIBRATING` and `SELF_TEST` shall not be restored as active operations after application restart or browser runtime restoration.

**Verification method**

API / Robot UI.

---

## SYS-REQ-135 — Browser runtime restoration

**Requirement**

The deployed demonstration environment shall support restoration of a browser-saved stable runtime state through the backend runtime restoration interface.

**Verification method**

API / Robot UI.

---

# 17. User Interface and Navigation

## SYS-REQ-136 — Application views

**Requirement**

The application shall provide access to the following views:

- Dashboard;
- Measurements;
- Patients;
- Calibration;
- History;
- Device Settings;
- System.

**Verification method**

Robot UI.

---

## SYS-REQ-137 — View navigation

**Requirement**

The user shall be able to navigate between all application views without reloading the complete application.

**Verification method**

Robot UI.

---

## SYS-REQ-138 — Dashboard status information

**Requirement**

The Dashboard shall provide visible information about sensor status, calibration status and device status.

**Verification method**

Robot UI.

---

## SYS-REQ-139 — Dashboard measurement result

**Requirement**

The Dashboard shall provide visible pressure, quality and validation result fields for the selected patient's selected eye.

**Verification method**

Robot UI.

---

## SYS-REQ-140 — Dashboard quick information

**Requirement**

The Dashboard shall display device model, software version, battery level and simulated device temperature.

**Verification method**

Robot UI.

---

## SYS-REQ-141 — System messages

**Requirement**

The Dashboard shall display contextual system messages reflecting relevant states such as sensor disconnection, calibration, measurement, missing patient and readiness.

**Verification method**

Robot UI.

---

## SYS-REQ-142 — Recent activity

**Requirement**

The Dashboard shall display recent runtime activity and provide access to the complete History view.

**Verification method**

Robot UI.

---

## SYS-REQ-143 — Responsive desktop layout

**Requirement**

The EyeMee web interface shall adapt its layout to the available browser width without requiring browser zoom reduction to access the principal application content.

**Verification method**

Robot UI / Inspection.

---
## SYS-REQ-144 — Randomized measurement input mode

**Requirement**

The system shall provide a configurable option allowing simulated
pressure and quality values to be randomly generated for each measurement.

When randomized measurement mode is enabled:

- a new pressure value shall be generated for each measurement;
- a new quality value shall be generated for each measurement;
- the fixed LEFT and RIGHT measurement profiles shall not be used;
- the generated values shall be evaluated using the configured
  pressure and quality acceptance criteria;
- the resulting measurement may therefore be classified as
  `VALID` or `INVALID`.

**Verification method**

Robot UI / API.

# 18. Verification and Traceability Rules

Each verification Test Case shall reference the requirement or requirements that it verifies.

Robot Framework Test Cases should use requirement IDs as tags whenever applicable.

Example:

```robot
TC-004 Sensor Disconnection Makes Device Not Ready
    [Documentation]    Verifies SYS-REQ-004 and SYS-REQ-005.
    [Tags]    SYS-REQ-004    SYS-REQ-005    sensor    negative
```

The requirement-to-test relationship shall also be maintained in:

`requirements/EyeMee_Traceability_Matrix.md`

---

# 19. Requirement Baseline

This specification represents the EyeMee implementation baseline used for the validation demonstration project.

Future functional changes shall be handled by:

1. updating or adding the corresponding requirement;
2. updating the traceability matrix;
3. creating or updating the required Test Cases;
4. executing regression tests;
5. reviewing failed or impacted Test Cases before accepting the new baseline.

---

# 20. Disclaimer

EyeMee is a fictional ophthalmic validation and software testing demonstration project.

It is not intended for diagnosis, treatment, medical decision-making or real-world ophthalmic measurement.

The simulated pressure range, quality thresholds and validation results are software test criteria created for the purpose of demonstrating requirements-based testing, automation, traceability and regression testing.