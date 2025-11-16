<div align="center">
  <img src="https://www.daiict.ac.in/sites/default/files/inline-images/20250107DAUfinalIDcol_SK-01_0.png" alt="University Logo" width="150">
</div>
<div align="center">

# 📰 Project: News Aggregator 📰
### Course: IT314 SOFTWARE ENGINEERING
### University: Dhirubhai Ambani University
### Professor: Prof. Saurabh Tiwari

</div>

---

<div align="center">

## 👥 Group-5 Members

| Student ID | Name | GitHub |
| :--- | :--- | :--- |
| **202301035 (Leader)** | **Patel Dhruvil** | <a href="https://github.com/Dhruvil05Patel"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301003 | Kartik Vyas | <a href="https://github.com/KartikVyas1925"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301016 | Tirth Gandhi | <a href="https://github.com/tirthgandhi9905"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301017 | Jeet Daiya | <a href="https://github.com/JeetDaiya"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301025 | Tirth Boghani | <a href="https://github.com/TirthB01"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301047 | Jeel Thummar | <a href="https://github.com/Jeel3011"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301049 | Shivam Ramoliya | <a href="https://github.com/Shivam-Ramoliya"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301062 | Maulik Khoyani | <a href="https://github.com/Maulik2710"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301063 | Vrajesh Dabhi | <a href="https://github.com/VrajeshDabhi"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301065 | Vansh Padaliya | <a href="https://github.com/vanshkpadaliya"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |

</div>

---

# 📜 Task D: User Stories

## US1: View Aggregated News Articles
### Front of the Card
> **As a User / Surfer I want to see the trending News to keep myself updated.**

### Back of the Card
**Primary Actor:** User/Surfer

**Acceptance Criteria:**
* **Given** the system is connected to news sources
    * **When** the user opens the platform
    * **Then** the system displays the latest aggregated news.
* **Given** sources are unavailable
    * **When** the user opens the platform
    * **Then** the system shows cached news.
* **Given** there is no internet connection
    * **When** the user opens the platform
    * **Then** an error message is displayed.

---

## US2: User Signup
### Front of the Card
> **As a user, I want to create an account so that I can access personalized news, bookmarks, and interact with the system securely.**

### Back of the Card
**Primary Actor:** User

**Acceptance Criteria:**
* **Given** the user provides valid signup details (email, password, name)
    * **When** they submit the signup form
    * **Then** the system sends a verification email and creates the account after verification.
* **Given** the user enters an already registered email
    * **When** they attempt to sign up
    * **Then** the system shows an “Email already exists” message.
* **Given** the user enters Invalid Password (e.g., Min character $\neq 8$, No Uppercase letter, No lowercase letter, No digit, No special character like $!@\#$%^&*()_+$)
    * **When** they attempt to register
    * **Then** the system rejects it and shows password guidelines.

---

## US3: Email Verification
### Front of the Card
> **As a user, I want to verify my email so that the system knows the account truly belongs to me and can grant full access.**

### Back of the Card
**Primary Actor:** User

**Acceptance Criteria:**
* **Given** the user signs up with valid details
    * **When** the signup is completed
    * **Then** the system sends a verification email.
* **Given** the user is unverified
    * **When** they attempt to log in
    * **Then** the system restricts access and prompts email verification.
* **Given** the user's Email does not exist
    * **When** they attempt to log in
    * **Then** the system restricts access.

---

## US4: User Login
### Front of the Card
> **As a user, I want to log into my account from multiple devices so that I can access my personalized news and bookmarks anywhere.**

### Back of the Card
**Primary Actor:** User

**Acceptance Criteria:**
* **Given** the user enters valid credentials
    * **When** they attempt login
    * **Then** the system authenticates and grants access.
* **Given** the user enters incorrect credentials (Email or password does not match)
    * **When** they attempt login
    * **Then** an “Invalid email or password” message is shown.
* **Given** the user is not email-verified
    * **When** they enter correct credentials
    * **Then** the system restricts access and shows a “Verify Your Email” banner.

---

## US5: Password Reset
### Front of the Card
> **As a user, I want to reset my password so that I can regain access if I forget it.**

### Back of the Card
**Primary Actor:** User

**Acceptance Criteria:**
* **Given** the user enters a registered and verified email
    * **When** they request password reset
    * **Then** the system sends an email with a reset link.
* **Given** the reset link is valid
    * **When** the user enters a new password
    * **Then** the system updates the password and confirms success.

---

## US6: Authentication Persistence
### Front of the Card
> **As a user, I want my login session to persist so that I don't need to log in every time the page reloads or I revisit the site.**

### Back of the Card
**Primary Actor:** User

**Acceptance Criteria:**
* **Given** the user has successfully logged in
    * **When** they revisit the page
    * **Then** the system automatically restores their session.
* **Given** the user manually logs out
    * **When** they reopen the website
    * **Then** the system does not restore the session and shows the login page.
* **Given** the user resets their password
    * **When** the system attempts session restore
    * **Then** it invalidates the old session and requires fresh login.
* **Given** the user is unverified
    * **When** their session is restored
    * **Then** the system still enforces verification restrictions.

---

## US7: Manage Account
### Front of the Card
> **As a User I want to change my account information so that if I made any mistake, I can correct it later and also update my preferences.**

### Back of the Card
**Primary Actor:** User

**Acceptance Criteria:**
* **Given** the user is in account settings
    * **When** the user updates profile information
    * **Then** the system validates and updates the details.
* **Given** the user enters invalid information
    * **When** the system validates the input
    * **Then** an error message is displayed.

---

## US8: Read AI-generated Summaries
### Front of the Card
> **As a surfer/User I clicked on the news article so that I can read the summary of that Article.**

### Back of the Card
**Primary Actor:** Surfer/User

**Acceptance Criteria:**
* **Given** the user selects a news article
    * **When** the system processes the article
    * **Then** the AI-generated summary is displayed.
* **Given** the user selects to read the whole article
    * **When** the link is clicked
    * **Then** the system navigates to the full article page.
* **Given** the user wants a different language
    * **When** the user changes the language
    * **Then** the summary is displayed in the selected language.
* **Given** the user wants to listen instead of reading
    * **When** the user enables text-to-speech
    * **Then** the system plays the summary audio.
* **Given** the user wants to save, share, or bookmark
    * **When** the user clicks the respective option
    * **Then** the action is completed successfully.

---

## US9: Read the Whole Article
### Front of the Card
> **As a Surfer I clicked on the News Article Link because I want to read the whole article.**

### Back of the Card
**Primary Actor:** Surfer

**Acceptance Criteria:**
* **Given** the user clicks the news article link
    * **When** the system opens the article
    * **Then** the actual news article is displayed.
* **Given** there is no internet connection
    * **When** the user clicks the link
    * **Then** an error message is displayed.

---

## US10: Text-to-Speech for Summaries
### Front of the Card
> **As a User, I want to listen to the news summary so that I can consume information while I am busy with other tasks.**

### Back of the Card
**Primary Actor:** User

**Acceptance Criteria:**
* **Given** the user is on the article summary page and device has audio
    * **When** the user clicks the "Listen/Play" button
    * **Then** the system converts text to speech and plays audio.
* **Given** no audio output is present
    * **When** the user clicks the "Listen/Play" button
    * **Then** the user cannot listen to the summary.

---

## US11: Bookmark/Save Article for Later
### Front of the Card
> **As a User, I want to bookmark/save an interesting article so that I can easily find and read it later.**

### Back of the Card
**Primary Actor:** User

**Acceptance Criteria:**
* **Given** the user is logged in
    * **When** the user clicks the bookmark icon
    * **Then** the article is saved to the user’s bookmark list.
* **Given** the user clicks bookmark on an already saved article
    * **When** the action is performed
    * **Then** the system removes the article from the bookmark list.
* **Given** there is no internet connection
    * **When** the user tries to bookmark an article
    * **Then** the system shows an error notification.

---

## US12: Share Article
### Front of the card
> **As a User, I want to share a news article so that I can send it to friends, family, or colleagues.**

### Back of the card
**Primary Actor:** User

**Acceptance Criteria:**
* **Given** the user is viewing a news summary
    * **When** the user clicks the share icon
    * **Then** the system shows sharing menu options.
* **Given** the share menu is displayed
    * **When** the user selects an application
    * **Then** the article link is shared through that application.

---

## US13: Personalized News Feed
### Front of the card
> **As a user, I want to select my topics of interest so that my news feed is tailored to what I care about.**

### Back of the card
**Primary Actor:** User

**Acceptance Criteria:**
* **Given** the user is logged in
    * **When** the user selects preferences in settings
    * **Then** the system updates the news feed to match selected categories.

---

## US14: Receive Notifications of Personalized News
### Front of the card
> **As a System, I want to send notifications for breaking news on topics a user follows so that the user can stay informed in real-time.**

### Back of the card
**Primary Actor:** System

**Acceptance Criteria:**
* **Given** the user is logged in, has preferences, and notifications enabled
    * **When** the system finds breaking news in the user’s interest
    * **Then** the system sends a push notification.
* **Given** a push notification is sent
    * **When** the user taps the notification
    * **Then** the app opens directly to the article summary.
* **Given** the user has disabled notifications
    * **When** breaking news is detected
    * **Then** no notification is delivered.

---

## US15: Translate News Summary
### Front of the card
> **As a User, I want to translate a news summary into a different language so that I can understand content that was not published in my native tongue.**

### Back of the card
**Primary Actor:** User

**Acceptance Criteria:**
* **Given** the user is viewing an article summary
    * **When** the user selects the "Translate" option
    * **Then** the system displays available languages.
* **Given** the user selects a language
    * **When** the system translates the summary
    * **Then** the translated summary is shown.
* **Given** the summary is translated
    * **When** the user selects "Show Original"
    * **Then** the original text is displayed.
* **Given** no internet connection
    * **When** the user attempts translation
    * **Then** an error is displayed.
* **Given** translation fails
    * **When** the user attempts translation
    * **Then** the system shows poorly translated news (or an error indicating failure).

---

## US16: Getting News
### Front of the card
> **As a system I want to obtain news from various news publishers so I can provide summaries of news articles to the users.**

### Back of the card
**Primary Actor:** System

**Acceptance Criteria:**
* **Given** the system fetches articles from multiple publishers
    * **When** the articles are available
    * **Then** the system generates valid summaries.
* **Given** articles are unavailable
    * **When** the system fetches from publishers
    * **Then** no new articles are shown.
* **Given** the system fetches an already summarized article
    * **When** it recognizes similarity
    * **Then** the system does not duplicate it.
* **Given** only one publisher covers a topic
    * **When** the system fetches articles
    * **Then** the system provides only that publisher’s articles.

---

## US17: Attach the reference of that Article
### Front of the card
> **As a system I want to attach the reference of that article so that the users can obtain the original news article for further information or use it as a reference.**

### Back of the card
**Primary Actor:** System

**Acceptance Criteria:**
* **Given** the system has fetched articles
    * **When** the reference link is valid
    * **Then** the system attaches it with the summary.
* **Given** the reference link is invalid
    * **When** the system processes the article
    * **Then** the link is not attached, and the system logs an error.
* **Given** the reference link becomes invalid later
    * **When** the user tries to access it
    * **Then** the system shows a broken link error.

---

## US18: Generate Summaries with AI
### Front of the card
> **As a system, I want to generate summaries of the news article so the users do not have to read the entire article.**

### Back of the card
**Primary Actor:** System

**Acceptance Criteria:**
* **Given** the user requests a summary
    * **When** the system generates it
    * **Then** a valid, concise summary ($\le 400$ words) is displayed with the original reference.
* **Given** the AI cannot generate a summary (e.g., source text too short, irrelevant)
    * **When** the system attempts generation
    * **Then** the system displays an error message or a placeholder text.
* **Given** the system generates a summary
    * **When** the summary generation is complete
    * **Then** the summary is factually consistent with the original article.

---

## US19: Update/Correct the News
### Front of the card
> **As a system, I want to update/correct the news in the event where I obtain new information regarding the topic so that the user can be properly informed on that topic.**

### Back of the Card
**Primary Actor:** System

**Acceptance Criteria:**
* **Given** the system fetches new information for an existing topic
    * **When** the original article is updated by the publisher
    * **Then** the system generates a new summary and updates the reference link if necessary.
* **Given** no new article is available
    * **When** the system checks for updates
    * **Then** no new summary is generated, and the existing one remains.
* **Given** the topic is concluded or archived
    * **When** the system checks for updates
    * **Then** no update is provided, and the article may be marked as "Concluded."
