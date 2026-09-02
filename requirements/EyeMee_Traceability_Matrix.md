# EyeMee Requirements Traceability Matrix

**Document ID:** EYM-RTM-001  
**Project:** EyeMee Ophthalmic Validation Demo  
**Related Specification:** EYM-SRS-001 - EyeMee System Requirements Specification  
**Version:** 1.0  
**Status:** Verification in progress  

---

## 1. Purpose

This document maintains traceability between EyeMee system requirements and their verification Test Cases.

A requirement is considered:

- **PASS** when at least one executed Test Case explicitly verifies the requirement and passes;
- **FAIL** when the corresponding verification Test Case fails;
- **TODO** when verification has not yet been implemented or executed;
- **PARTIAL** when an existing Test Case exercises the related functionality but does not completely verify the requirement.

---

## 2. Verification tools

| Verification Type | Tool |
|---|---|
| UI / System functional testing | Robot Framework + Browser Library + Playwright |
| REST API testing | Robot Framework / API test tooling |
| C++ component testing | GoogleTest |
| Manual inspection | Browser / code inspection |

---

# 3. Current Automated Test Cases

## TC-001 — Sensor Disconnect And Reconnect

**Automated file**

`robot/tests/01_dashboard.robot`

**Purpose**

Verify that the sensor can be disconnected and subsequently reconnected from the Dashboard.

**Current verification**

- initial sensor state is CONNECTED;
- sensor can be disconnected;
- displayed sensor state becomes DISCONNECTED;
- sensor can be reconnected;
- displayed sensor state becomes CONNECTED.

**Requirements verified**

- SYS-REQ-001
- SYS-REQ-002
- SYS-REQ-003

**Execution status**

PASS

---

## TC-002 — Select Left And Right Eye

**Automated file**

`robot/tests/01_dashboard.robot`

**Purpose**

Verify LEFT and RIGHT eye selection from the Dashboard.

**Current verification**

- LEFT eye can be selected;
- RIGHT eye can be selected;
- selected eye is visually identified through the selected UI state.

**Requirements verified**

- SYS-REQ-017
- SYS-REQ-018
- SYS-REQ-019

**Execution status**

PASS

---

## TC-003 — Nominal Left Eye Measurement

**Automated file**

`robot/tests/01_dashboard.robot`

**Purpose**

Verify a nominal LEFT-eye measurement using the configured default measurement profile.

**Current verification**

- sensor is connected;
- LEFT eye is selected;
- measurement can be started when the command is available;
- resulting pressure is `18.4`;
- resulting quality is `96`;
- resulting classification is `VALID`.

**Requirements verified**

- SYS-REQ-041
- SYS-REQ-050
- SYS-REQ-051
- SYS-REQ-052
- SYS-REQ-056

**Requirements partially exercised**

- SYS-REQ-035
- SYS-REQ-036
- SYS-REQ-037
- SYS-REQ-038
- SYS-REQ-039
- SYS-REQ-049
- SYS-REQ-053

These requirements are not considered fully verified by TC-003 because the current Test Case does not explicitly assert every corresponding condition or post-condition.

**Execution status**

PASS

---

# 4. Requirements Traceability Matrix

| Requirement | Test Case | Verification | Status |
|---|---|---|---|
| SYS-REQ-001 | TC-001 | Robot UI | PASS |
| SYS-REQ-002 | TC-001 | Robot UI | PASS |
| SYS-REQ-003 | TC-001 | Robot UI | PASS |
| SYS-REQ-004 | TBD | Robot UI / API | TODO |
| SYS-REQ-005 | TBD | Robot UI / API | TODO |
| SYS-REQ-006 | TBD | Robot UI / API | TODO |
| SYS-REQ-007 | TBD | Robot UI / API | TODO |
| SYS-REQ-008 | TBD | Robot UI / API | TODO |
| SYS-REQ-009 | TBD | Robot UI / API | TODO |
| SYS-REQ-010 | TBD | Robot UI / API | TODO |
| SYS-REQ-011 | TBD | API / Robot UI | TODO |
| SYS-REQ-012 | TBD | Robot UI / API | TODO |
| SYS-REQ-013 | TBD | Robot UI / API | TODO |
| SYS-REQ-014 | TBD | Robot UI / API | TODO |
| SYS-REQ-015 | TBD | Robot UI / API | TODO |
| SYS-REQ-016 | TBD | API / Robot UI | TODO |
| SYS-REQ-017 | TC-002 | Robot UI | PASS |
| SYS-REQ-018 | TC-002 | Robot UI | PASS |
| SYS-REQ-019 | TC-002 | Robot UI | PASS |
| SYS-REQ-020 | TBD | API | TODO |
| SYS-REQ-021 | TBD | Robot UI / API | TODO |
| SYS-REQ-022 | TBD | API | TODO |
| SYS-REQ-023 | TBD | Robot UI / API | TODO |
| SYS-REQ-024 | TBD | Robot UI / API | TODO |
| SYS-REQ-025 | TBD | Robot UI / API | TODO |
| SYS-REQ-026 | TBD | Robot UI / API | TODO |
| SYS-REQ-027 | TBD | Robot UI / API | TODO |
| SYS-REQ-028 | TBD | Robot UI / API | TODO |
| SYS-REQ-029 | TBD | Robot UI / API | TODO |
| SYS-REQ-030 | TBD | API | TODO |
| SYS-REQ-031 | TBD | API / Robot UI | TODO |
| SYS-REQ-032 | TBD | Robot UI | TODO |
| SYS-REQ-033 | TBD | Robot UI | TODO |
| SYS-REQ-034 | TBD | Robot UI | TODO |
| SYS-REQ-035 | TC-003 | Robot UI / API | PARTIAL |
| SYS-REQ-036 | TC-003 | Robot UI / API | PARTIAL |
| SYS-REQ-037 | TC-003 | Robot UI / API | PARTIAL |
| SYS-REQ-038 | TC-003 | Robot UI / API | PARTIAL |
| SYS-REQ-039 | TC-003 | Robot UI | PARTIAL |
| SYS-REQ-040 | TBD | Robot UI | TODO |
| SYS-REQ-041 | TC-003 | Robot UI | PASS |
| SYS-REQ-042 | TBD | Robot UI / API | TODO |
| SYS-REQ-043 | TBD | API | TODO |
| SYS-REQ-044 | TBD | Robot UI | TODO |
| SYS-REQ-045 | TBD | Robot UI / API | TODO |
| SYS-REQ-046 | TBD | Robot UI / API | TODO |
| SYS-REQ-047 | TBD | Robot UI / API | TODO |
| SYS-REQ-048 | TBD | Robot UI / API | TODO |
| SYS-REQ-049 | TC-003 | Robot UI / API | PARTIAL |
| SYS-REQ-050 | TC-003 | Robot UI / API | PASS |
| SYS-REQ-051 | TC-003 | Robot UI / API | PASS |
| SYS-REQ-052 | TC-003 | Robot UI / API | PASS |
| SYS-REQ-053 | TC-003 | Robot UI / API | PARTIAL |
| SYS-REQ-054 | TBD | Robot UI / API | TODO |
| SYS-REQ-055 | TBD | API / Robot UI | TODO |
| SYS-REQ-056 | TC-003 | Robot UI / API | PASS |
| SYS-REQ-057 | TBD | Robot UI / API / GoogleTest | TODO |
| SYS-REQ-058 | TBD | Robot UI / API / GoogleTest | TODO |
| SYS-REQ-059 | TBD | Robot UI / API | TODO |
| SYS-REQ-060 | TBD | Robot UI / API / GoogleTest | TODO |
| SYS-REQ-061 | TBD | Robot UI / API / GoogleTest | TODO |
| SYS-REQ-062 | TBD | Robot UI / API | TODO |
| SYS-REQ-063 | TBD | Robot UI / API | TODO |
| SYS-REQ-064 | TBD | Robot UI / API | TODO |
| SYS-REQ-065 | TBD | API | TODO |
| SYS-REQ-066 | TBD | Robot UI | TODO |
| SYS-REQ-067 | TBD | Robot UI | TODO |
| SYS-REQ-068 | TBD | Robot UI | TODO |
| SYS-REQ-069 | TBD | Robot UI | TODO |
| SYS-REQ-070 | TBD | Robot UI | TODO |
| SYS-REQ-071 | TBD | Robot UI | TODO |
| SYS-REQ-072 | TBD | Robot UI | TODO |
| SYS-REQ-073 | TBD | Robot UI | TODO |
| SYS-REQ-074 | TBD | Robot UI | TODO |
| SYS-REQ-075 | TBD | API / Robot UI | TODO |
| SYS-REQ-076 | TBD | API / Robot UI | TODO |
| SYS-REQ-077 | TBD | API / Robot UI | TODO |
| SYS-REQ-078 | TBD | Robot UI | TODO |
| SYS-REQ-079 | TBD | Robot UI | TODO |
| SYS-REQ-080 | TBD | Robot UI | TODO |
| SYS-REQ-081 | TBD | Robot UI | TODO |
| SYS-REQ-082 | TBD | Robot UI | TODO |
| SYS-REQ-083 | TBD | Robot UI | TODO |
| SYS-REQ-084 | TBD | Robot UI | TODO |
| SYS-REQ-085 | TBD | Robot UI | TODO |
| SYS-REQ-086 | TBD | Robot UI / API | TODO |
| SYS-REQ-087 | TBD | Robot UI / API | TODO |
| SYS-REQ-088 | TBD | Robot UI / API | TODO |
| SYS-REQ-089 | TBD | Robot UI / API | TODO |
| SYS-REQ-090 | TBD | API / Robot UI | TODO |
| SYS-REQ-091 | TBD | Robot UI / API | TODO |
| SYS-REQ-092 | TBD | Robot UI / API | TODO |
| SYS-REQ-093 | TBD | Robot UI / API | TODO |
| SYS-REQ-094 | TBD | Robot UI / API | TODO |
| SYS-REQ-095 | TBD | Robot UI / API | TODO |
| SYS-REQ-096 | TBD | Robot UI / API | TODO |
| SYS-REQ-097 | TBD | Robot UI / API | TODO |
| SYS-REQ-098 | TBD | Robot UI / API | TODO |
| SYS-REQ-099 | TBD | Robot UI / API | TODO |
| SYS-REQ-100 | TBD | Robot UI | TODO |
| SYS-REQ-101 | TBD | Robot UI | TODO |
| SYS-REQ-102 | TBD | Robot UI | TODO |
| SYS-REQ-103 | TBD | Robot UI | TODO |
| SYS-REQ-104 | TBD | Robot UI | TODO |
| SYS-REQ-105 | TBD | Robot UI | TODO |
| SYS-REQ-106 | TBD | Robot UI | TODO |
| SYS-REQ-107 | TBD | Robot UI | TODO |
| SYS-REQ-108 | TBD | Robot UI | TODO |
| SYS-REQ-109 | TBD | Robot UI / Inspection | TODO |
| SYS-REQ-110 | TBD | Robot UI / API | TODO |
| SYS-REQ-111 | TBD | Robot UI / API | TODO |
| SYS-REQ-112 | TBD | Robot UI / API | TODO |
| SYS-REQ-113 | TBD | Robot UI / API | TODO |
| SYS-REQ-114 | TBD | API | TODO |
| SYS-REQ-115 | TBD | API | TODO |
| SYS-REQ-116 | TBD | API | TODO |
| SYS-REQ-117 | TBD | API | TODO |
| SYS-REQ-118 | TBD | API | TODO |
| SYS-REQ-119 | TBD | API | TODO |
| SYS-REQ-120 | TBD | API | TODO |
| SYS-REQ-121 | TBD | API | TODO |
| SYS-REQ-122 | TBD | API | TODO |
| SYS-REQ-123 | TBD | API | TODO |
| SYS-REQ-124 | TBD | API | TODO |
| SYS-REQ-125 | TBD | API | TODO |
| SYS-REQ-126 | TBD | API | TODO |
| SYS-REQ-127 | TBD | API | TODO |
| SYS-REQ-128 | TBD | API | TODO |
| SYS-REQ-129 | TBD | Robot UI / API | TODO |
| SYS-REQ-130 | TBD | Robot UI | TODO |
| SYS-REQ-131 | TBD | Robot UI | TODO |
| SYS-REQ-132 | TBD | Robot UI | TODO |
| SYS-REQ-133 | TBD | Robot UI | TODO |
| SYS-REQ-134 | TBD | API / Robot UI | TODO |
| SYS-REQ-135 | TBD | API / Robot UI | TODO |
| SYS-REQ-136 | TBD | Robot UI | TODO |
| SYS-REQ-137 | TBD | Robot UI | TODO |
| SYS-REQ-138 | TBD | Robot UI | TODO |
| SYS-REQ-139 | TBD | Robot UI | TODO |
| SYS-REQ-140 | TBD | Robot UI | TODO |
| SYS-REQ-141 | TBD | Robot UI | TODO |
| SYS-REQ-142 | TBD | Robot UI | TODO |
| SYS-REQ-143 | TBD | Robot UI / Inspection | TODO |
| SYS-REQ-144 | TBD | Robot UI / API | TODO |

---

# 5. Current Verification Summary

Current automated Robot Framework implementation:

| Metric | Value |
|---|---:|
| Total system requirements | 143 |
| Requirements fully verified | 12 |
| Requirements partially exercised | 7 |
| Requirements not yet verified | 124 |
| Automated Robot Test Cases | 3 |
| Robot Test Cases passing | 3 |
| Robot Test Cases failing | 0 |

> The verification coverage will increase incrementally as each functional requirement group is implemented and executed.

---

# 6. Planned Verification Order

Verification shall be implemented incrementally in the following order:

1. Sensor Management
2. Calibration
3. Eye Selection
4. Patient Management
5. Measurement Preconditions
6. Measurement Execution
7. Measurement Validation
8. Measurements View
9. History and Traceability
10. Device Settings
11. System and Diagnostics
12. REST API
13. Runtime Persistence
14. User Interface and Navigation

---

# 7. Traceability Rule

A requirement shall only be marked `PASS` when the associated Test Case contains an explicit verification of the expected requirement behaviour.

Executing a function without asserting the corresponding expected result is not sufficient to consider the requirement fully verified.