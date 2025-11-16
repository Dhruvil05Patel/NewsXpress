# 🐞 NewsXpress: Bug Report Log

- **Project:** NewsXpress
- **Document Version:** 1.0 (Last Updated: 04-11-2025)

---

## Status Key

| Status | Description |
| :--- | :--- |
| `Open` | The bug has been reported and is waiting to be fixed. |
| `In Progress` | A developer is actively working on a fix. |
| `Ready for Retest` | A fix has been committed and is ready for you to test. |
| `Closed` | You have re-tested and confirmed the bug is fixed. |
| `Wont Fix` | The team has decided not to fix this bug. |

---

## Active Bugs

| Bug ID | Severity | Status | Feature | Title | Steps to Reproduce | Expected Result | Actual Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | **🔴 High** | `Closed` | Search | **Search input loses focus on every keystroke.** | 1. Navigate to the Homepage. <br> 2. Click into the "Search headlines" input box. <br> 3. Type a single character (e.g., "t"). <br> 4. Press the "Backspace" key. | The cursor should remain in the input box, allowing for continuous typing (e.g., "tech") or deleting. | After typing one character or pressing backspace, the input box loses focus. The user must click the box again *for every single letter*, making the search unusable. |
| **BUG-002** | **🔴 High** | `Open` | Text-to-Speech (TTS) | **Overlapping audio: Multiple TTS streams play simultaneously.** | 1. Click the "Play" (TTS) button on "Article 1". <br> 2. **While Article 1 is speaking**, click the "Play" (TTS) button on "Article 2". | The audio for "Article 1" should immediately stop, and the audio for "Article 2" should begin. Only one audio stream should be active. | The audio for "Article 1" continues to play, and the audio for "Article 2" *also* starts, causing two audio streams to overlap. |
| **BUG-003** | **🟠 Medium** | `Open` | Article Feed | **Article card displays raw JSON string instead of summary.** | 1. Navigate to the Homepage (`/`). <br> 2. Scroll through the loaded article feed. | All article cards should display a clean, human-readable summary. | At least one card ("India vs South Africa LIVE SCORE") displays a raw JSON string, starting with "json: ('summary',...". <br><br> **Note:** This is likely a bug in the AI summarization or database saving step. |
| **BUG-004** | **🟠 Medium** | `Open` | Translation | **Scroll bleed: Scrolling on "Translate To" modal scrolls the main page.** | 1. Click the "Translate" button on any article. <br> 2. The "Translate To" modal appears. <br> 3. Hover the mouse cursor over the list of languages. <br> 4. Use the mouse wheel to scroll. | The list of languages inside the modal should scroll up and down. The main page (news feed) behind the modal should be locked and not move. | The main page (news feed) behind the modal scrolls. The list of languages in the modal does not scroll at all, making it impossible to select languages not visible on screen. |
| | | | | | | | |