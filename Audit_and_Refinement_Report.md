# Utah GPA Planner — Audit & Refinement Report

**Date:** March 9, 2026
**Project:** GPA Estimation & Graduation Planning Tool
**Focus:** Math verification, credit model logic, state law conformance, and architectural refinement.

---

## 1. Executive Summary

The original GPA estimation tool was audited for mathematical accuracy, conformance to Utah state graduation laws (Utah Admin Code R277-700-6), and overall usability. While the original tool provided a helpful baseline, several critical discrepancies in credit allocation and edge-case GPA math were identified. 

The application has been completely rewritten into a **100% client-side React application**. It now features mathematically rigorous GPA projection, strict adherence to state law, and a robust new system for handling **Credit Recovery (CR)** and failing grades.

**Privacy & Architecture Note:** The application runs entirely within the user's browser. Zero user data is transmitted to any server. State persistence is handled locally via the browser's `localStorage`, ensuring complete student privacy.

---

## 2. Audit Findings & Corrections

### A. Credit Model Conformance (R277-700-6)
The original application's subject model contained structural inaccuracies compared to the state's 24-credit and 27-credit diploma paths.

| Subject | Original App | State Law / Refined App | Issue Fixed |
|---------|--------------|-------------------------|-------------|
| **Social Studies (SS)** | 2.5 | 3.0 | The original app split "GOV" (0.5) out from SS. State law requires 2.5 core + 0.5 LEA discretion = 3.0 total SS credits. This has been unified. |
| **Electives (EL)** | 2.75 + 2.75 (EL2) | 5.5 | The original app artificially split electives into "EL" and "EL2" with arbitrary 2.75 credit values. This has been unified into a single flexible EL category requiring 5.5 credits (or 8.5 for the 27-credit path). |
| **Total Slots** | Hardcoded | Dynamic | The original app's grid lacked the capacity to hold the 5.5 credits of electives (it capped at 5.0). The grid capacity has been dynamically expanded for electives. |

### B. GPA Math Verification
The mathematical logic for GPA calculation was audited against standard educational practices.

1. **Failing Grades (F):** The original app correctly included F grades in the GPA denominator while awarding 0.0 quality points and 0 credits. This logic was sound and has been preserved.
2. **Pass/Fail (P/P+):** The original app correctly awarded credit for P/P+ grades while excluding them from the GPA calculation entirely. This has been preserved.
3. **The Credit Recovery Gap:** The most significant flaw in the original math model was the inability to handle **Credit Recovery**. If a student earned an F, and later retook the course, there was no way to represent both the permanent GPA impact of the F *and* the newly earned credit/GPA impact of the recovery course.

---

## 3. Key Enhancements & New Features

### A. Credit Recovery & Alternative Credit Support
To address the complaint regarding students earning alternative credit after failing, a dedicated **"Recovery / Alt Credit"** system was engineered:
* **The "Recovery ★" Row:** A new, distinct row at the bottom of the grid allows students to enter courses taken outside the normal 4-year sequence (summer school, credit recovery, concurrent enrollment).
* **The "CR" Grade:** A new "CR" (Credit Recovery) grade option was added. When selected, it earns 0.25 credits and defaults to a C (2.0) in the GPA calculation (the typical minimum standard for recovery).
* **Mathematical Accuracy:** If a student fails 9th Grade Math (F) and recovers it in summer school (CR), *both* entries remain on the grid. The F continues to drag down the GPA denominator (as it does on real transcripts), while the CR adds new quality points and fulfills the graduation requirement.
* **Capacity:** The Recovery row features expanded slot capacity (up to 12 slots for electives) to accommodate students who need extensive alternative credits.

### B. Graduation Planning & Projection Engine
A new "GPA Projection" tab was built to give students actionable intelligence on their academic future.
* **Target Scenarios:** The engine calculates the exact average grade required across all *remaining* unearned credits to reach specific target GPAs (e.g., 3.0, 3.5, 4.0).
* **Feasibility Checking:** The system prevents impossible projections (e.g., warning a student if they need a 4.4 average on a 4.0 scale).
* **Year-by-Year Breakdown:** A visual breakdown shows GPA, credits earned, and warning badges for F/CR grades per grade level, helping pinpoint "bad years."

### C. Professional Reporting
The tool now includes a "Report" tab designed specifically for counselors, parents, and students to print or save as a PDF.
* **Print-Optimized CSS:** The stylesheet includes dedicated `@media print` rules that strip away UI navigation, format tables cleanly, and force background colors to print accurately.
* **Comprehensive View:** The report fits neatly onto standard letter paper, showing cumulative stats, subject-by-subject progress bars, per-year breakdowns, and the projection scenarios in one unified document.

### D. UI/UX Modernization
* **Dark Mode:** A fully integrated dark mode was added to improve accessibility and student preference.
* **Scenario Testing:** "Quick Fill" buttons were expanded to include "Bad Year + Recovery" simulations, allowing users to instantly see how failing core courses and recovering them affects the math.
* **No External Dependencies:** The heavy Tailwind CSS CDN dependency was removed in favor of a clean, bespoke CSS file, ensuring the app loads instantly and works flawlessly offline or in restricted school network environments.

---

## 4. Conclusion

The refined Utah GPA Planner is now a mathematically rigorous, legally conformant, and highly practical tool. By solving the credit recovery gap and adding robust projection capabilities, it empowers students to recover from a "bad year" and chart a realistic path to graduation.
