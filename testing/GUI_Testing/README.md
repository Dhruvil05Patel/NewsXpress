#  GUI Testing

This directory contains all artifacts related to **Graphical User Interface (GUI)** and **System Testing** for the NewsXpress application.

We utilized both **Manual Testing** strategies and **Automated Selenium Scripts** to validate the frontend user experience and functionality.

---

##  Folder Contents

| File / Folder | Description |
| :--- | :--- |
| **`ui_test_cases.md`** | The comprehensive **Manual Test Plan**. Contains a checklist of test scenarios for Login, Homepage, Sidebar, and more. |
| **`initialGuiTesting.spec.js`** | **Automated Selenium Script**. A JavaScript test suite generated/written to automate critical user flows (e.g., Login, Navigation). |
| **`GUI_Testing_Report.md`** | The **Final Test Report**. Contains detailed results, observations, and screenshots for every component tested. |
| **`assets/`** | Contains all **Screenshots** and visual evidence referenced in the test report. |

---

##  Automated Testing (Selenium)

We used **Selenium WebDriver** to automate critical user journeys. The script `initialGuiTesting.spec.js` performs end-to-end validation of the application.

### Prerequisites
* **Node.js** (v18+)
* **Selenium WebDriver** (`npm install selenium-webdriver mocha chai`)
* **Browser Driver** (e.g., ChromeDriver or GeckoDriver)

### How to Run the Script
1.  Ensure the **Frontend Server** is running:
    ```bash
    cd frontend
    npm run dev
    ```
2.  Navigate to this directory:
    ```bash
    cd testing/GUI_Testing
    ```
3.  Run the test script using Mocha (or Node):
    ```bash
    npx mocha initialGuiTesting.spec.js
    ```
    *(Or if running directly with Node)*
    ```bash
    node initialGuiTesting.spec.js
    ```

---

##  Manual Testing Strategy

For complex UI interactions that are difficult to automate (e.g., checking CSS "scroll bleed" or visual alignment), we performed manual testing.

* **Methodology:** Black Box Testing (Validating inputs/outputs without looking at code).
* **Browsers Tested:** Chrome, Edge.
* **Key Findings:** See `../../bug-log.md` for a list of UI bugs discovered during this phase (e.g., Search Focus issue, Translation Modal scroll issue).

---

##  Final Report

For a complete breakdown of every component tested, including:
* Functionality Checklists
* Input/Output Data
* Visual Proof (Screenshots)

 **Please refer to:** [`GUI_Testing_Report.md`](./GUI_Testing_Report.md)