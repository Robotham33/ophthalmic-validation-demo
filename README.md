# EyeMee — Ophthalmic Measurement & Validation Demo

EyeMee is a fictional ophthalmic measurement system created as a software validation and test automation demonstration project.

The application simulates the workflow of an ophthalmic device capable of performing pressure measurements on the left and right eyes, managing patients, controlling sensor and calibration states, storing measurement results, and providing traceability through a complete event history.

> **Important:** EyeMee is not a real medical device and must not be used for diagnosis, treatment, or any clinical decision.  
> All medical values, limits, acceptance criteria and device behaviours used in this project are simulated for software testing purposes.

---

## Live Demo

The application is deployed on Vercel:

**https://eyemee-demo.vercel.app/app/#dashboard**

FastAPI documentation:

**https://eyemee-demo.vercel.app/docs**

API status:

**https://eyemee-demo.vercel.app/api/status**

---

# What is EyeMee?

EyeMee simulates an ophthalmic measurement device and its associated software interface.

The system reproduces a simplified clinical workflow:

1. Connect the measurement sensor
2. Select or create a patient
3. Check the device status
4. Calibrate the device
5. Select the left or right eye
6. Start a measurement
7. Validate the acquired data
8. Display the result
9. Store the measurement
10. Record all actions in the system history

The objective is not to reproduce a commercial ophthalmology product, but to provide a realistic environment for:

- software validation
- functional testing
- test automation
- requirement-based testing
- API testing
- user interface testing
- boundary value testing
- error handling
- traceability

---

# What does the device measure?

EyeMee simulates an **ocular pressure measurement expressed in mmHg**.

Each simulated measurement contains:

- Patient ID
- Eye: `LEFT` or `RIGHT`
- Pressure value
- Signal / measurement quality
- Timestamp
- Validation result

Example:

```text
Patient: PAT-00145
Eye: RIGHT
Pressure: 19.1 mmHg
Quality: 94 %
Result: VALID
