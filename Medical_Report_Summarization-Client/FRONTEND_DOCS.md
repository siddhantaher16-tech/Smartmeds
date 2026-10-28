# SmartMeds AI - Frontend Feature & Workflow Documentation

This document provides a high-level, non-technical overview of the SmartMeds AI client application features, user experience, page workflows, and client-side design. It serves as a companion guide to the backend API documentation.

---

## 1. User Interface Overview

**SmartMeds AI** is designed around a modern, highly secure, and accessible user experience. The interface prioritizes clarity, ease of navigation, and patient confidentiality, aligning with HIPAA-compliant standards.

*   **Design Philosophy & Tone:** The interface features a clinical, reassuring tone, utilizing structured layouts and readable typography to minimize cognitive load. Color schemes are intentionally limited to professional blues, slate grays, and alert colors (emerald, amber, rose) that convey system states without cluttering the screen.
*   **Theme and Visual Cues:** Built-in support for dark mode provides a comfortable viewing experience in clinical settings or low-light environments. Custom shimmers and animated placeholders guide the user's focus during background data processing.
*   **Accessibility & Role Partitioning:** The layout automatically pivots depending on the user's role (Patient vs. Doctor), providing unique sidebars, statistics, actions, and custom view configurations tailored to their tasks.

---

## 2. Key Screens & Workflows

### A. Authentication & Onboarding
*   **Role Selection:** During signup, users select their role (Patient or Doctor) via custom-styled interactive buttons that offer instant visual validation.
*   **Patient Onboarding Flow:** A guided multi-step form walks new patients through setting up their health profile:
    *   *Step 1 (Basic Details):* Date of birth, biological sex, blood group, height, and weight.
    *   *Step 2 (Clinical Background):* Known medical conditions, current medications, drug/food allergies, and emergency contact details.
*   **Doctor Onboarding Flow:** A simplified professional profile builder:
    *   *Step 1 (Professional Intro):* Selecting medical specialty and providing a professional biography.
    *   *Step 2 (Confirmation):* A success screen welcoming the doctor to their clinical dashboard.

### B. Patient Workspace
*   **Dashboard & Key Metrics:** A centralized home screen highlighting key statistics:
    *   *Linked Doctors:* The number of verified medical professionals with shared access.
    *   *Reports Analyzed:* Total medical reports uploaded and processed.
    *   *Critical Flags:* Active abnormal findings from reports.
*   **Drag-and-Drop Upload Zone:** An intuitive file drop zone supporting PDFs, JPEGs, and PNGs (up to 10MB). When a file is dropped:
    *   A details modal prompts the patient to input a friendly name (e.g., "Annual Health Checkup") and select a report type (e.g., Blood Test, Lipid Profile, MRI) to organize their records.
*   **Reports List:** A paginated history of all uploaded documents. Patients can search, delete, check status, or click to open the summary views.
*   **Doctor Connections Directory:** A lookup screen where patients manage clinical relationships:
    *   Lists currently linked doctors with quick-action links to share/revoke access to diagnostic summaries.
    *   Includes a real-time directory search to find new doctors by name or specialty and request a secure link.

### C. Doctor Workspace
*   **Dashboard Overview:** A clinical dashboard focused on patient monitoring and time-sensitive cases:
    *   *Total Patients:* Number of patients linked to the practice.
    *   *Shared Reports:* Total reports received for review.
    *   *Critical Cases Count:* Reports featuring critical markers.
*   **Split Panel Layout:**
    *   *Recent Activity:* A live chronological feed of patient sharing actions with timestamps and patient details.
    *   *Critical Cases Alert Panel:* Highlights specific high-risk abnormal readings (e.g., blood pressure, hemoglobin) from shared reports with direct links to review the analysis.
*   **Patient Directory:** A searchable list of linked patients. Clicking a patient opens a comprehensive profile containing:
    *   A summary of patient demographics (Biological sex, age, etc.).
    *   A list of all records shared by that patient.
    *   An option to download clinical summaries or open summaries for individual reports.

### D. Unified Report & Summary Viewer
The application uses a unified summary viewer that formats AI-extracted lab results into structured, easy-to-read cards. The layout adapts depending on who is viewing the page:
*   **Critical and Pending Status Cards:** High-visibility banner boxes show pending test parameters and call attention to any "Critical Observations" or flags.
*   **Findings Table (Biomarkers):** A clean tabular structure detailing each test parameter:
    *   *Test Parameter Name & Category:* Categorized under medical groups (e.g., Liver Function, Kidney Function, CBC).
    *   *Patient Value vs. Reference Range:* The patient's exact numbers contrasted against normal physiological ranges.
    *   *Interpretation Badge:* Clear markers highlighting whether a level is standard (normal) or flagged (abnormal).
*   **AI Interpretation Summary:** An AI-generated, natural language summary translating dry laboratory data into clear health insights.
*   **Role-Specific Action Center:**
    *   *Patient View:* Displays a "Physician's Note" and an active button to "Request Doctor Review" for professional sign-off.
    *   *Doctor View:* Displays "Further Actions Recommended" and an active button to "Sign Off Records" to finalize patient review.
*   **Clinical Disclaimer:** A persistent notice reminding users that summaries are AI-generated for informational support and require professional evaluation.

---

## 3. Client-Side Features

To ensure maximum responsiveness, reliability, and security, the client application implements several key browser-side capabilities:

*   **Dynamic Data Caching & Preloading:** Uses background query invalidation to ensure dashboards, patient search results, and report lists reflect updates immediately after upload or status changes without requiring manual page refreshes.
*   **Automatic Session Persistence & Security:** Operates a secure background credential interceptor. If a session expires, the client automatically requests a credential renewal behind the scenes. If renewal fails, it gracefully clears local storage and routes the user back to the login screen.
*   **Fluid Responsive Layouts:** The layout automatically resizes from a dual-panel dashboard configuration on desktop monitors to a stacked, single-column dashboard with a mobile menu on touch devices.
*   **Debounced Directory Searching:** To optimize backend performance, search inputs for doctor and patient lists are "debounced" (throttled by half a second), updating results dynamically as the user types without triggering lag or redundant network requests.
*   **Immediate Input Validation:** Custom validation schemas ensure logins, signups, and onboarding entries are validated in real-time in the browser. Clear error descriptions prevent form submission until all medical requirements (e.g., valid email formats, password complexity, required fields) are satisfied.

---

## 4. Frontend Technology Stack

The client-side environment is built using modern web industry standards for speed, security, and type safety:

*   **Core UI Library:** **React 19** – Selected for high-performance rendering and component lifecycle management.
*   **Programming Language:** **TypeScript** – Enforces type safety, reducing client-side runtime crashes.
*   **Application Bundler:** **Vite** – Provides rapid hot-module replacement (HMR) and optimized assets.
*   **Routing Guard:** **React Router (v7)** – Handles user sessions, role checks (Doctor vs. Patient), and private URL routing.
*   **Data Caching & API Integration:** **TanStack React Query (v5)** & **Axios** – Provides state management, query caching, and seamless server communication with automated token-refresh retry logic.
*   **Form & Validation Library:** **React Hook Form** + **Zod** – Provides efficient state tracking and client-side schemas.
*   **File Upload Utility:** **React Dropzone** – Controls files dropped by drag-and-drop actions.
*   **Aesthetic Styling:** **Tailwind CSS (v4)** – Manages styles, color palettes, responsive layouts, grid columns, and dark mode configuration.
*   **Micro-Interactions & Alerts:** **Sonner** – Generates clean toast notifications for successes, errors, and warnings.
*   **Clinical Iconography:** **Lucide React** – Delivers a modern and uniform icon set.
