# 📰 NewsXpress: UI & UX Test Case Log

- **Project:** NewsXpress
- **Document Version:** 1.0 (Last Updated: 04-11-2025)

---

## Status Key

| Status | Description |
| :--- | :--- |
| `Not Run` | The test case has not been executed yet. |
| `Pass` | The test case executed and the actual result matched the expected result. |
| `Fail` | The test case executed and the actual result did *not* match the expected result. (Requires a Bug Report) |
| `Blocked` | The test case cannot be executed due to an external issue (e.g., the page is not built yet, a bug blocks access). |

---

## 1. Authentication (Login / Registration)

Test cases for the user login and registration pages.

| TC ID | Page | Test Scenario | Test Steps | Test Data | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AUTH-UI-001** | Homepage | **Positive:** Valid user login. | 1. Navigate to the Homepage (/). 2. Click the "Login" button in the header/navbar. 3. Verify the login modal/bar appears. 4. Enter valid email... 5. Enter valid password... 6. Click the "Login" button inside the modal. | `email: "test@user.com"` <br> `pass: "password123"` |1. The login modal closes. 2. A "Login successful!" toast message appears. 3. The header updates (e.g., "Login" button is replaced by "Profile" or the user's name). | `Not Run` |
| **AUTH-UI-002** | Homepage | **Negative:** Invalid password. | 1. Navigate to the Homepage (/). 2. Click the "Login" button in the header. 3. Verify the login modal appears. 4. Enter valid email in the "Email" field. 5. Enter an invalid password. 6. Click the "Login" button inside the modal. | `email: "test@user.com"` <br> `pass: "wrongpassword"` | 1. The login modal remains open. 2. An error message "Invalid email or password" appears inside the modal. 3. The input fields are not cleared. | `Not Run` |
| **AUTH-UI-003** | Homepage | **Validation:** Empty email field. | 1. Navigate to the Homepage (/). 2. Click the "Login" button in the header. 3. Verify the login modal appears. 4. Leave the "Email" field blank. 5. Enter a password. 6. Click the "Login" button inside the modal. | `email: ""` <br> `pass: "password123"` | 1. The login modal remains open. 2. An error message "Email is required" appears inside the modal, below the email field. 3. The form is not submitted. | `Not Run` |
| **AUTH-UI-004** | Login | **Validation:** "Forgot Password" link. |1. Navigate to the Homepage (/). 2. Click the "Login" button in the header. 3. Verify the login modal appears. 4. Click the "Forgot Password?" link inside the modal. | N/A | 1. User is navigated to the `/forgot-password` bar. <br> 2. A form with an "Email" field is displayed. | `Not Run` |

---

## 2. Homepage & Article Feed

Test cases for the main dashboard/feed.

| TC ID | Page | Test Scenario | Test Steps | Test Data | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **HOME-UI-001** | Feed | **Positive:** Articles load on page visit. | 1. Log in as a valid user. <br> 2. Navigate to the homepage (`/`). | (Logged-in user) | 1. A loading spinner is briefly displayed. <br> 2. A list of 10+ article cards appears. <br> 3. Each card clearly shows a title, image, and source name. | `Pass` |
| **HOME-UI-002** | Feed | **Action:** Bookmark an article. | 1. Navigate to the homepage. <br> 2. Find any article card. <br> 3. Click the "Bookmark" (save) icon on the card. | N/A | 1. The bookmark icon immediately changes color (e.g., from hollow to filled). <br> 2. A toast message "Article saved" appears briefly. | `Not Run` |
| **HOME-UI-003** | Feed | **Action:** Un-bookmark an article. | 1. **(Pre-req)** Complete `HOME-UI-002`. <br> 2. Find the same article from the previous step. <br> 3. Click the filled "Bookmark" icon. | N/A | 1. The bookmark icon changes back to its original state (e.g., hollow). <br> 2. A toast message "Bookmark removed" appears. | `Not Run` |
| **HOME-UI-004** | Feed | **Navigation:** Click an article title. | 1. Navigate to the homepage. <br> 2. Click on the title of any article card. | N/A | 1. User is redirected to the `original_url` (from the `articles` table) in a new browser tab. | `Not Run` |
| **HOME-UI-005** | Homepage | **Validation:** Search input focus. | 1. Navigate to the Homepage (`/`). <br> 2. Click into the "Search headlines" input box. <br> 3. Type a multi-letter word (e.g., "tech"). <br> 4. Press the "Backspace" key multiple times. | 1. The cursor must remain in the input box. <br> 2. The text should be typed and deleted normally without the user having to re-click the box. | **Fail** <br> (See `BUG-001`) |
| **HOME-UI-006** | Homepage | **Validation:** Overlapping Text-to-Speech. | 1. On the main feed, click the "Play" (TTS) button on "Article 1". <br> 2. While Article 1 is speaking, click the "Play" (TTS) button on "Article 2". | 1. The audio for "Article 1" should immediately stop. <br> 2. The audio for "Article 2" should begin. <br> 3. Only one audio stream should be active at a time. | **Fail** <br> (See `BUG-002`) |
| **HOME-UI-007** | Homepage | **Validation:** Data integrity of article cards. | 1. Navigate to the Homepage (`/`). <br> 2. Visually inspect all loaded article cards in the feed. | N/A | 1. All text (titles, summaries, source) must be human-readable. <br> 2. No raw code, JSON, HTML, or error strings (like `null`, `undefined`) should be visible on any card. | **Fail** <br> (See `BUG-003`) |

---


## 3. Translation & Text-to-Speech (TTS)

Test cases for the article translation and audio playback features.

| TC ID | Page | Test Scenario | Test Steps | Test Data | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TRANS-UI-001** | Homepage | **Validation:** Scroll behavior on "Translate To" modal. | 1. Click the "Translate" button on any article. <br> 2. Hover the mouse cursor over the language list. <br> 3. Use the mouse wheel to scroll up and down. | N/A | 1. The language list inside the modal must scroll. <br> 2. The main page (news feed) behind the modal must *not* scroll. | **Fail** <br> (See `BUG-004`) |
| **TRANS-UI-002** | Homepage | **Positive:** Translate an article. | 1. Click the "Translate" button. <br> 2. Select a language from the list (e.g., "Hindi"). <br> 3. Click the "Translate" button in the modal. | `language: "Hindi"` | 1. The modal closes. <br> 2. The text on the article card (title, summary) is replaced with the translated Hindi text. <br> 3. A "Revert" button might appear. | `Not Run` |