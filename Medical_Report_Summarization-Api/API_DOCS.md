# Medical Report Summarization API — Frontend Integration Guide

> **Base URL:** `http://localhost:5000/api`  
> All endpoints return JSON. All protected endpoints require a Bearer token in the `Authorization` header.

---

## Authentication

All protected routes require the following header:

```
Authorization: Bearer <token>
```

The `token` is the JWT returned from `/api/auth/signup` or `/api/auth/login`.

---

## Standard Response Shape

Every response from this API follows the same envelope structure:

**Success**

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... }
}
```

**Error**

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 1. Auth Endpoints — `/api/auth`

### `POST /api/auth/signup`

Register a new user account.

- **Auth required:** No
- **Content-Type:** `application/json`

**Request Body**

| Field       | Type   | Required | Rules                                            |
| ----------- | ------ | -------- | ------------------------------------------------ |
| `full_name` | string | Yes      | 1–100 characters                                 |
| `email`     | string | Yes      | Valid email, trimmed, lowercased                 |
| `password`  | string | Yes      | Minimum 6 characters                             |
| `role`      | string | No       | `"patient"` or `"doctor"` (default: `"patient"`) |

**Example Request**

```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "patient"
}
```

**Success Response** — `201 Created`

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "jane@example.com",
      ...
    },
    "token": "<jwt>"
  }
}
```

**Error Responses**

| Status | Reason                                        |
| ------ | --------------------------------------------- |
| `400`  | Validation failed or email already registered |

---

### `POST /api/auth/login`

Authenticate an existing user and get a token.

- **Auth required:** No
- **Content-Type:** `application/json`

**Request Body**

| Field      | Type   | Required |
| ---------- | ------ | -------- |
| `email`    | string | Yes      |
| `password` | string | Yes      |

**Example Request**

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": { "id": "uuid", "email": "jane@example.com", ... },
    "token": "<jwt>"
  }
}
```

**Error Responses**

| Status | Reason                 |
| ------ | ---------------------- |
| `400`  | Validation failed      |
| `401`  | Invalid email/password |

---

### `POST /api/auth/refresh`

Refresh an expired JWT token using a refresh token.

- **Auth required:** No
- **Content-Type:** `application/json`

**Request Body**

```json
{
  "refresh_token": "string"
}
```

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "jwt",
    "refresh_token": "jwt",
    "expires_at": 1700000000
  }
}
```

---

### `POST /api/auth/logout`

Log out the current user and invalidate the session.

- **Auth required:** Yes

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

### `GET /api/auth/me`

Get the currently authenticated user's profile from the `profiles` table.

- **Auth required:** Yes

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "profile": {
      "id": "uuid",
      "full_name": "Jane Doe",
      "role": "patient",
      ...
    }
  }
}
```

**Error Responses**

| Status | Reason                   |
| ------ | ------------------------ |
| `401`  | Missing or invalid token |
| `404`  | Profile not found        |

---

## 2. Report Endpoints — `/api/reports`

> **All report endpoints require authentication.**

### `POST /api/reports/upload`

Upload a new medical report (PDF, JPEG, or PNG). Triggers background processing/summarization.

- **Auth required:** Yes
- **Content-Type:** `multipart/form-data`

**Form Data**

| Field         | Type   | Required | Notes                                    |
| ------------- | ------ | -------- | ---------------------------------------- |
| `file`        | File   | Yes      | PDF, JPEG, or PNG only. Max size: 10 MB. |
| `report_type` | string | No       | e.g. "Blood Test", "MRI"                 |
| `report_name` | string | No       | Custom name provided by user             |

**Example (fetch)**

```js
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("report_type", "Blood Test");
formData.append("report_name", "My Annual Bloodwork");

const response = await fetch("http://localhost:5000/api/reports/upload", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

**Success Response** — `201 Created`

```json
{
  "success": true,
  "message": "Report uploaded and processing started",
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    "file_name": "report.pdf",
    "file_url": "https://...",
    "status": "processing",
    "report_type": "Blood Test",
    "report_name": "My Annual Bloodwork",
    ...
  }
}
```

**Error Responses**

| Status | Reason                                 |
| ------ | -------------------------------------- |
| `400`  | No file uploaded                       |
| `400`  | Invalid file type                      |
| `400`  | File exceeds 10 MB limit               |
| `409`  | Report with this name already uploaded |
| `401`  | Not authenticated                      |

---

### `GET /api/reports/dashboard`

Get aggregated metrics for the user's dashboard.

- **Auth required:** Yes

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Dashboard stats fetched successfully",
  "data": {
    "linked_doctors": 2,
    "reports_analyzed": 12,
    "critical_flags": 4,
    "recent_reports": [
      {
        "id": "uuid",
        "file_name": "report.pdf",
        "status": "done",
        "report_type": "Blood Test",
        ...
      }
    ]
  }
}
```

---

### `GET /api/reports`

Get all reports uploaded by the authenticated user, with pagination and summary statistics.

- **Auth required:** Yes
- **Query Parameters:**
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Results per page (default: 10)
  - `name` (optional): Search filter for report name

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Reports fetched successfully",
  "data": {
    "reports": [
      {
        "id": "uuid",
        "file_name": "report.pdf",
        "file_url": "https://...",
        "status": "done",
        "report_type": "Blood Test",
        "report_name": null,
        "created_at": "2026-03-17T10:00:00Z"
      }
    ],
    "reports_total": 15,
    "analyzed_total": 12,
    "failed_total": 1,
    "pagination": {
      "page": 1,
      "limit": 10,
      "total_pages": 2
    }
  }
}
```

---

### `GET /api/reports/:id`

Get a single report by its ID.

- **Auth required:** Yes

**URL Parameters**

| Param | Type   | Description    |
| ----- | ------ | -------------- |
| `id`  | string | UUID of report |

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Report fetched successfully",
  "data": {
    "report": {
      "id": "uuid",
      "file_name": "report.pdf",
      "file_url": "https://...",
      "status": "done",
      "report_type": "Blood Test",
      "report_name": null,
      "created_at": "2026-03-17T10:00:00Z"
    },
    "summary": {
      ...
    }
  }
}
```

---

### `PUT /api/reports/:id`

Replace an existing report with a new file. Triggers re-processing/re-summarization.

- **Auth required:** Yes
- **Content-Type:** `multipart/form-data`

**URL Parameters**

| Param | Type   | Description    |
| ----- | ------ | -------------- |
| `id`  | string | UUID of report |

**Form Data**

| Field         | Type   | Required | Notes                                    |
| ------------- | ------ | -------- | ---------------------------------------- |
| `file`        | File   | Yes      | PDF, JPEG, or PNG only. Max size: 10 MB. |
| `report_type` | string | No       | Optional category                        |
| `report_name` | string | No       | Optional custom name                     |

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Report replaced and reprocessing started",
  "data": { ...updatedReport }
}
```

**Error Responses**

| Status | Reason            |
| ------ | ----------------- |
| `400`  | No file uploaded  |
| `401`  | Not authenticated |

---

### `DELETE /api/reports/:id`

Delete a report permanently.

- **Auth required:** Yes

**URL Parameters**

| Param | Type   | Description    |
| ----- | ------ | -------------- |
| `id`  | string | UUID of report |

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Report deleted successfully",
  "data": null
}
```

---

## 3. Summary Endpoints — `/api/summary`

> **All summary endpoints require authentication.**

### `GET /api/summary/:reportId`

Get the AI-generated summary for a specific report.

- **Auth required:** Yes

**URL Parameters**

| Param      | Type   | Description    |
| ---------- | ------ | -------------- |
| `reportId` | string | UUID of report |

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Summary fetched successfully",
  "data": {
    "id": "uuid",
    "report_id": "uuid",
    "summary_json": { ... },
    "created_at": "2026-03-17T10:05:00Z"
  }
}
```

> **Note:** If the report is still being processed (`status: "processing"`), the summary may not exist yet. Poll this endpoint or check the report status first.

**Error Responses**

| Status | Reason                      |
| ------ | --------------------------- |
| `401`  | Not authenticated           |
| `404`  | No summary found for report |

---

## 4. Profile Endpoints — `/api/profile`

> **All profile endpoints require authentication.**

### `PUT /api/profile/medical`

Save or update the authenticated user's medical profile. All fields are optional — send only the fields you want to update.

- **Auth required:** Yes
- **Content-Type:** `application/json`

**Request Body**

| Field                        | Type     | Rules                                                                         |
| ---------------------------- | -------- | ----------------------------------------------------------------------------- |
| `date_of_birth`              | string   | Format: `YYYY-MM-DD`                                                          |
| `biological_sex`             | string   | `"male"`, `"female"`, or `"other"`                                            |
| `blood_group`                | string   | `"A+"`, `"A-"`, `"B+"`, `"B-"`, `"AB+"`, `"AB-"`, `"O+"`, `"O-"`, `"Unknown"` |
| `height_cm`                  | number   | Positive, max 300                                                             |
| `weight_kg`                  | number   | Positive, max 700                                                             |
| `known_conditions`           | string[] | Array of condition strings                                                    |
| `current_medications`        | string[] | Array of medication strings                                                   |
| `known_allergies`            | string[] | Array of allergy strings                                                      |
| `emergency_contact_name`     | string   | Max 100 characters                                                            |
| `emergency_contact_phone`    | string   | Max 20 characters                                                             |
| `emergency_contact_relation` | string   | Max 50 characters                                                             |

**Example Request**

```json
{
  "date_of_birth": "1990-06-15",
  "biological_sex": "female",
  "blood_group": "O+",
  "height_cm": 165,
  "weight_kg": 60,
  "known_conditions": ["Diabetes Type 2"],
  "current_medications": ["Metformin 500mg"],
  "known_allergies": ["Penicillin"],
  "emergency_contact_name": "John Doe",
  "emergency_contact_phone": "+1-555-0100",
  "emergency_contact_relation": "Spouse"
}
```

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Medical profile saved successfully",
  "data": {
    "date_of_birth": "1990-06-15",
    "biological_sex": "female",
    "blood_group": "O+",
    "height_cm": 165,
    "weight_kg": 60,
    "known_conditions": ["Diabetes Type 2"],
    "current_medications": ["Metformin 500mg"],
    "known_allergies": ["Penicillin"],
    "emergency_contact_name": "John Doe",
    "emergency_contact_phone": "+1-555-0100",
    "emergency_contact_relation": "Spouse"
  }
}
```

**Error Responses**

| Status | Reason                              |
| ------ | ----------------------------------- |
| `400`  | Validation failed (bad field value) |
| `401`  | Not authenticated                   |

---

### `GET /api/profile/medical`

Fetch the authenticated user's saved medical profile.

- **Auth required:** Yes

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Medical profile fetched successfully",
  "data": {
    "date_of_birth": "1990-06-15",
    "biological_sex": "female",
    "blood_group": "O+",
    "height_cm": 165,
    "weight_kg": 60,
    "known_conditions": ["Diabetes Type 2"],
    "current_medications": ["Metformin 500mg"],
    "known_allergies": ["Penicillin"],
    "emergency_contact_name": "John Doe",
    "emergency_contact_phone": "+1-555-0100",
    "emergency_contact_relation": "Spouse"
  }
}
```

**Error Responses**

| Status | Reason            |
| ------ | ----------------- |
| `401`  | Not authenticated |
| `404`  | Profile not found |

---

### `PUT /api/profile/doctor`

Save or update the authenticated doctor's profile. All fields are optional.

- **Auth required:** Yes (Must have `role: "doctor"`)
- **Content-Type:** `application/json`

**Request Body**

| Field            | Type   | Rules               |
| ---------------- | ------ | ------------------- |
| `specialisation` | string | Max 100 characters  |
| `bio`            | string | Max 1000 characters |

**Example Request**

```json
{
  "specialisation": "Cardiologist",
  "bio": "Experienced doctor."
}
```

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Doctor profile saved successfully",
  "data": {
    "id": "uuid",
    "full_name": "Dr. Smith",
    "role": "doctor",
    "specialisation": "Cardiologist",
    "bio": "Experienced doctor."
  }
}
```

**Error Responses**

| Status | Reason                          |
| ------ | ------------------------------- |
| `400`  | Validation failed               |
| `401`  | Not authenticated               |
| `403`  | Forbidden: Doctor role required |

---

## 5. Doctor Endpoints — `/api/doctor`

> **All doctor endpoints require authentication.**

### `GET /api/doctor/search`

Get all doctors, optionally filter by name, with pagination.

- **Auth required:** Yes
- **Query Parameters:**
  - `name` (optional): Search term for doctor's name
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Results per page (default: 10)

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Doctors fetched successfully",
  "data": {
    "doctors": [
      {
        "id": "uuid",
        "full_name": "Dr. John Smith",
        "specialisation": "Cardiologist",
        "bio": "Expert doctor.",
        "created_at": "2026-03-17T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  }
}
```

---

### `GET /api/doctor/my-doctors`

Get the array of all doctors linked to the authenticated patient.

- **Auth required:** Yes

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Doctors fetched successfully",
  "data": {
    "doctors": [
      {
        "id": "uuid",
        "full_name": "Dr. John Smith",
        "specialisation": "Cardiologist",
        "bio": "Expert doctor.",
        "linked_at": "2026-03-17T12:00:00Z"
      }
    ],
    "count": 1
  }
}
```

_(Returns empty array if no doctors linked)._

---

### `POST /api/doctor/link/:doctorId`

Link the authenticated patient to a specific doctor.

- **Auth required:** Yes

**URL Parameters**

| Param      | Type   | Description    |
| ---------- | ------ | -------------- |
| `doctorId` | string | UUID of doctor |

**Success Response** — `201 Created`

```json
{
  "success": true,
  "message": "Linked to doctor successfully",
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    "doctor_id": "uuid",
    "created_at": "2026-03-17T12:00:00Z"
  }
}
```

**Error Responses**

| Status | Reason                     |
| ------ | -------------------------- |
| `400`  | Already linked to a doctor |
| `404`  | Doctor not found           |

---

### `DELETE /api/doctor/unlink/:doctorId`

Unlink from a specifically identified doctor linked to the patient.

- **Auth required:** Yes

**URL Parameters**

| Param      | Type   | Description    |
| ---------- | ------ | -------------- |
| `doctorId` | string | UUID of doctor |

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Doctor unlinked successfully. All shared report access has been revoked.",
  "data": null
}
```

**Error Responses**

| Status | Reason           |
| ------ | ---------------- |
| `404`  | No doctor linked |

---

### `GET /api/doctor/dashboard`

Get dashboard statistics for the authenticated doctor.

- **Auth required:** Yes

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Doctor dashboard fetched successfully",
  "data": {
    "total_patients": 10,
    "total_reports": 25,
    "shared_reports": 25,
    "recent_activity": [
      {
        "shared_at": "2026-03-21T15:00:00Z",
        "patient_name": "Jane Doe",
        "report": {
          "id": "uuid",
          "file_name": "blood_test.pdf",
          "file_type": "application/pdf",
          "status": "done",
          "uploaded_at": "timestamp"
        }
      }
    ],
    "critical_flags": {
      "total": 5,
      "flags": [
        {
          "report_id": "uuid",
          "patient_name": "Jane Doe",
          "flag": "High Blood Sugar",
          "severity": "critical"
        }
      ]
    }
  }
}
```

---

### `GET /api/doctor/patients`

Get all patients linked to the authenticated doctor, including summary statistics for shared reports.

- **Auth required:** Yes
- **Query Parameters:**
  - `name` (optional): Search filter for patient name
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Results per page (default: 10)

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Patients fetched successfully",
  "data": {
    "patients": [
      {
        "id": "uuid",
        "full_name": "Jane Doe",
        "linked_at": "2026-03-17T12:00:00Z",
        "reports_total": 5,
        "critical_flags": 3,
        "latest_report_at": "2026-03-20T10:00:00Z",
        "status": "critical"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### `GET /api/doctor/patients/:patientId/reports`

Get all reports that a specific patient has shared with the authenticated doctor.

- **Auth required:** Yes

**URL Parameters**

| Param       | Type   | Description     |
| ----------- | ------ | --------------- |
| `patientId` | string | UUID of patient |

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Patient reports fetched successfully",
  "data": [
    {
      "id": "uuid",
      "file_name": "report.pdf",
      "file_type": "application/pdf",
      "status": "done",
      "uploaded_at": "timestamp"
    }
  ]
}
```

---

## 6. Shares Endpoints — `/api/shares`

> **All shares endpoints require authentication and are limited to patient role functionality.**

### `POST /api/shares/:reportId`

Share a specific report with a specifically linked doctor.

- **Auth required:** Yes
- **Content-Type:** `application/json`

**Request Body**

```json
{
  "doctor_id": "uuid"
}
```

**Success Response** — `201 Created`

```json
{
  "success": true,
  "message": "Report shared successfully",
  "data": {
    "id": "uuid",
    "report_id": "uuid",
    "doctor_id": "uuid",
    "patient_id": "uuid",
    "shared_at": "timestamp"
  }
}
```

---

### `DELETE /api/shares/:reportId`

Revoke a doctor's access to a shared report.

- **Auth required:** Yes
- **Content-Type:** `application/json`

**Request Body**

```json
{
  "doctor_id": "uuid"
}
```

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Access revoked successfully",
  "data": null
}
```

---

### `GET /api/shares`

Get the list of all shares belonging to the authenticated patient.

- **Auth required:** Yes

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Shares fetched successfully",
  "data": {
    "shared_report_ids": ["uuid", "uuid"],
    "shares": [
      {
        "report_id": "uuid",
        "doctor_id": "uuid",
        "shared_at": "timestamp"
      }
    ]
  }
}
```

---

### `GET /api/shares/doctor/:doctorId`

Get all reports currently shared with a specific doctor connected to the authenticated patient.

- **Auth required:** Yes

**Success Response** — `200 OK`

```json
{
  "success": true,
  "message": "Shared reports fetched successfully",
  "data": {
    "doctor_id": "uuid",
    "shared_reports": [
      {
        "id": "share_uuid",
        "shared_at": "timestamp",
        "report_id": "uuid",
        "file_name": "report.pdf",
        "file_type": "application/pdf",
        "status": "done",
        "uploaded_at": "timestamp"
      }
    ]
  }
}
```

---

## Quick Reference

| Method   | Endpoint                           | Auth | Description                     |
| -------- | ---------------------------------- | ---- | ------------------------------- |
| `POST`   | `/api/auth/signup`                 | ❌   | Register a new user             |
| `POST`   | `/api/auth/login`                  | ❌   | Log in, receive token           |
| `POST`   | `/api/auth/refresh`                | ❌   | Refresh expired JWT token       |
| `POST`   | `/api/auth/logout`                 | ✅   | Log out of active session       |
| `GET`    | `/api/auth/me`                     | ✅   | Get own user profile            |
| `POST`   | `/api/reports/upload`              | ✅   | Upload a new report             |
| `GET`    | `/api/reports/dashboard`           | ✅   | Get dashboard statistics        |
| `GET`    | `/api/reports`                     | ✅   | List all reports for user       |
| `GET`    | `/api/reports/:id`                 | ✅   | Get a single report             |
| `PUT`    | `/api/reports/:id`                 | ✅   | Replace a report                |
| `DELETE` | `/api/reports/:id`                 | ✅   | Delete a report                 |
| `GET`    | `/api/summary/:reportId`           | ✅   | Get AI summary for a report     |
| `PUT`    | `/api/profile/medical`             | ✅   | Save/update medical profile     |
| `GET`    | `/api/profile/medical`             | ✅   | Fetch medical profile           |
| `PUT`    | `/api/profile/doctor`              | ✅   | Save/update doctor profile      |
| `GET`    | `/api/doctor/dashboard`            | ✅   | Get doctor dashboard stats      |
| `GET`    | `/api/doctor/search`               | ✅   | Search doctors by name          |
| `GET`    | `/api/doctor/my-doctors`           | ✅   | Get all linked doctors          |
| `POST`   | `/api/doctor/link/:doctorId`       | ✅   | Link to a specific doctor       |
| `DELETE` | `/api/doctor/unlink/:doctorId`     | ✅   | Unlink from specific doctor     |
| `GET`    | `/api/doctor/patients`             | ✅   | List patients linked to doctor  |
| `GET`    | `/api/doctor/patients/:id/reports` | ✅   | Get shared reports by patient   |
| `POST`   | `/api/shares/:reportId`            | ✅   | Share report with doctor        |
| `DELETE` | `/api/shares/:reportId`            | ✅   | Revoke report share from doctor |
| `GET`    | `/api/shares`                      | ✅   | Get all active shares           |
| `GET`    | `/api/shares/doctor/:doctorId`     | ✅   | Get reports shared with doctor  |

---

## Frontend Integration Tips

1. **Store the token** from login/signup in `localStorage` or a secure cookie and attach it to every authenticated request.
2. **Token format:** Always send as `Authorization: Bearer <token>`.
3. **File uploads** must use `multipart/form-data` — do **not** set `Content-Type` manually when using `FormData`; the browser sets it automatically with the correct boundary.
4. **Polling for summaries:** After uploading a report, the summary is generated asynchronously. Poll `GET /api/summary/:reportId` every few seconds until data is returned, or check the report's `status` field from `GET /api/reports/:id` (`"processing"` → `"done"`).
5. **Error handling:** Always check `success: false` in the response and surface `message` to the user.
