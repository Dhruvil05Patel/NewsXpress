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
| **BUG-001** | **🔴 High** | `Open` | Search | **Search input loses focus on every keystroke.** | 1. Navigate to the Homepage. <br> 2. Click into the "Search headlines" input box. <br> 3. Type a single character (e.g., "t"). <br> 4. Press the "Backspace" key. | The cursor should remain in the input box, allowing for continuous typing (e.g., "tech") or deleting. | After typing one character or pressing backspace, the input box loses focus. The user must click the box again *for every single letter*, making the search unusable. |
| **BUG-002** | **🔴 High** | `Open` | Text-to-Speech (TTS) | **Overlapping audio: Multiple TTS streams play simultaneously.** | 1. Click the "Play" (TTS) button on "Article 1". <br> 2. **While Article 1 is speaking**, click the "Play" (TTS) button on "Article 2". | The audio for "Article 1" should immediately stop, and the audio for "Article 2" should begin. Only one audio stream should be active. | The audio for "Article 1" continues to play, and the audio for "Article 2" *also* starts, causing two audio streams to overlap. |
| | | | | | | | |