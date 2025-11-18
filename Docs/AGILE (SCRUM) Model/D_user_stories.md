<div align="center">
  <img src="https://www.daiict.ac.in/sites/default/files/inline-images/20250107DAUfinalIDcol_SK-01_0.png" alt="University Logo" width="150">
</div>
<div align="center">

#  Project: News Aggregator 
### Course: IT314 SOFTWARE ENGINEERING
### University: Dhirubhai Ambani University
### Professor: Prof. Saurabh Tiwari

</div>

---

<div align="center">

##  Group-5 Members: The Development Team

| Student ID | Name | GitHub |
| :--- | :--- | :--- |
| **202301035 (Leader)** | **Patel Dhruvil** | <a href="https://github.com/Dhruvil05Patel">GitHub</a> |
| 202301003 | Kartik Vyas | <a href="https://github.com/KartikVyas1925">GitHub</a> |
| 202301016 | Tirth Gandhi | <a href="https://github.com/tirthgandhi9905">GitHub</a> |
| 202301017 | Jeet Daiya | <a href="https://github.com/JeetDaiya">GitHub</a> |
| 202301025 | Tirth Boghani | <a href="https://github.com/TirthB01">GitHub</a> |
| 202301047 | Jeel Thummar | <a href="https://github.com/Jeel3011">GitHub</a> |
| 202301049 | Shivam Ramoliya | <a href="https://github.com/Shivam-Ramoliya">GitHub</a> |
| 202301062 | Maulik Khoyani | <a href="https://github.com/Maulik2710">GitHub</a> |
| 202301063 | Vrajesh Dabhi | <a href="https://github.com/VrajeshDabhi">GitHub</a> |
| 202301065 | Vansh Padaliya | <a href="https://github.com/vanshkpadaliya">GitHub</a> |

</div>

---

#  Task D: User Stories (Product Backlog)

##  US1: View Aggregated News Articles
### Front of the Card: **The Daily Scoop**
> **As a Casual Surfer, I want to see the latest trending News immediately when I visit the platform, so I can keep myself effortlessly updated on current events.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** User/Surfer
* **A. Live Feed Display:**
    * **Given** the system is successfully connected to all news sources
    * **When** the user opens the platform
    * **Then** the system displays the latest aggregated news feed.
* **B. Offline Fallback:**
    * **Given** external news sources are temporarily unavailable or slow
    * **When** the user opens the platform
    * **Then** the system shows the most recently cached news articles.
* **C. Connection Error Handling:**
    * **Given** there is no active internet connection
    * **When** the user opens the platform
    * **Then** a clear, non-intrusive error message is displayed (e.g., "Offline. Please check your connection.").

---

##  US2: User Signup
### Front of the Card: **Secure Account Creation**
> **As a New User, I want to easily create a secure account, so I can access personalized news features, manage my bookmarks, and interact with the system.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** User
* **A. Successful Registration & Verification:**
    * **Given** the user provides valid signup details (Email, Password, Full Name, Unique Username)
    * **When** they submit the signup form
    * **Then** the system sends a verification email and *temporarily* creates the account, granting full access only after email verification.
* **B. Duplicate Email Prevention:**
    * **Given** the user enters an email address that is already registered
    * **When** they attempt to sign up
    * **Then** the system shows a prominent “Email already exists. Try logging in or resetting your password.” message.
* **C. Strong Password Enforcement:**
    * **Given** the user enters a password that fails the complexity requirements (e.g., must be $\ge 8$ characters, include Uppercase, lowercase, digit, and special character)
    * **When** they attempt to register
    * **Then** the system rejects the submission and displays clear, actionable password guidelines *inline*.

---

##  US3: Email Verification
### Front of the Card: **Confirming Identity**
> **As a New User, I want to verify my email address, so the system can confirm the account's authenticity and grant me full, unrestricted access.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** User
* **A. Verification Email Trigger:**
    * **Given** the user completes the signup process with valid details
    * **When** the signup is finalized
    * **Then** the system automatically sends a time-sensitive verification email to the registered address.
* **B. Access Restriction for Unverified Accounts:**
    * **Given** the user is registered but currently unverified
    * **When** they attempt to log in
    * **Then** the system restricts access to personalized features and prompts for immediate email verification.
* **C. Non-existent Email Login:**
    * **Given** the user attempts to log in with an email address that does not exist in the database
    * **When** they attempt to log in
    * **Then** the system restricts access and displays the standard "Invalid email or password" message (for security reasons).

---

##  US4: User Login
### Front of the Card: **Access My Hub**
> **As a Registered User, I want to securely log into my account from any of my devices, so I can consistently access my personalized news feed and bookmarks wherever I am.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** User
* **A. Successful Authentication:**
    * **Given** the user enters valid, verified credentials
    * **When** they attempt to log in
    * **Then** the system securely authenticates the user and grants full access.
* **B. Invalid Credential Feedback:**
    * **Given** the user enters incorrect credentials (Email or password mismatch)
    * **When** they attempt to log in
    * **Then** an “Invalid email or password” message is shown.
* **C. Unverified Account Handling on Login:**
    * **Given** the user is registered and correct credentials are provided, but the account is **not** email-verified
    * **When** they attempt to log in
    * **Then** the system prevents access to personalized features and prominently shows a “Verify Your Email” banner with a resend option.

---

##  US5: Password Reset
### Front of the Card: **Regaining Access**
> **As a Registered User, I want a secure process to reset my password, so I can quickly regain access to my account if I forget my credentials.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** User
* **A. Reset Link Delivery:**
    * **Given** the user enters an email address that is both registered and verified
    * **When** they request a password reset via the designated link
    * **Then** the system sends a secure, time-sensitive email with a unique password reset link.
* **B. Successful Password Change:**
    * **Given** the provided reset link is currently valid and unused
    * **When** the user enters and confirms a new password (meeting complexity requirements)
    * **Then** the system updates the password, invalidates all prior sessions, and confirms the success to the user.

---

##  US6: Authentication Persistence
### Front of the Card: **Stay Logged In**
> **As a User, I want my active login session to remain persistent (i.e., "Remember Me"), so I don't have to re-enter my credentials every time I refresh the page or revisit the site.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** User
* **A. Automatic Session Restoration:**
    * **Given** the user has successfully logged in and not manually logged out
    * **When** they revisit or refresh the application
    * **Then** the system automatically restores their authenticated session, bypassing the login screen.
* **B. Manual Logout Takes Precedence:**
    * **Given** the user explicitly clicks the "Log Out" button
    * **When** they reopen the website
    * **Then** the system terminates the session and presents the login/home page.
* **C. Password Reset Invalidates All Sessions:**
    * **Given** the user resets their password (US5 is completed)
    * **When** the system attempts session restore using an old token
    * **Then** it invalidates the old session token and requires a fresh login with the new password.
* **D. Persistence Respects Verification:**
    * **Given** a user's session is restored, but their account remains unverified (US3)
    * **When** the session is restored
    * **Then** the system still enforces the unverified restrictions and displays the "Verify Your Email" banner.

---

##  US7: Manage Account
### Front of the Card: **Profile Maintenance**
> **As a Registered User, I want to be able to change my personal and account information (like name, username, or password) and update my news preferences, so I can correct mistakes and keep my profile current.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** User
* **A. Successful Profile Update:**
    * **Given** the user is in the account settings section
    * **When** the user submits updated profile information (e.g., Name, preferences)
    * **Then** the system validates the input, successfully updates the details in the database, and displays a "Profile updated successfully" confirmation.
* **B. Invalid Input Handling:**
    * **Given** the user attempts to update information with an invalid entry (e.g., an already taken username, an invalid email format)
    * **When** the system validates the input
    * **Then** an immediate, specific error message is displayed *inline* for the problematic field.

---

##  US8: Read AI-generated Summaries
### Front of the Card: **Getting the Gist**
> **As a Surfer or User, I want to click on a news article and be presented with a concise, AI-generated summary, so I can quickly absorb the key information without reading the whole piece.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** Surfer/User
* **A. Summary Display:**
    * **Given** the user selects a news article from the feed
    * **When** the system processes the article
    * **Then** the AI-generated, factually consistent summary is immediately displayed on the article page.
* **B. Accessing the Full Article:**
    * **Given** the user is reading the summary
    * **When** the user clicks the "Read Full Article" link
    * **Then** the system navigates directly to the original article source (US9).
* **C. Language Translation Integration:**
    * **Given** the user changes the preferred display language (US15)
    * **When** the summary page loads
    * **Then** the summary is displayed in the selected language.
* **D. Text-to-Speech Integration:**
    * **Given** the user enables the text-to-speech function (US10)
    * **When** the summary loads
    * **Then** the system plays the summary as an audio file.
* **E. Interaction Features:**
    * **Given** the user clicks the Save, Share, or Bookmark options
    * **When** the action is performed
    * **Then** the respective feature (US11 or US12) is executed successfully.

---

##  US9: Read the Whole Article
### Front of the Card: **Original Source**
> **As a Surfer, I want to click on the full article link, because I require the comprehensive, original source material for in-depth reading or further reference.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** Surfer
* **A. Successful Navigation:**
    * **Given** the user clicks the full news article link (the reference from US17)
    * **When** the system opens the article
    * **Then** the user is successfully redirected to the actual, original news article on the publisher's website.
* **B. Broken Link Error:**
    * **Given** there is a valid internet connection, but the source link is broken (US17)
    * **When** the user clicks the link
    * **Then** the system shows a "Source Link Broken" error or a standard 404 page.

---

##  US10: Text-to-Speech for Summaries
### Front of the Card: **Listen On-the-Go**
> **As a User, I want a reliable option to listen to the news summary, so I can consume information hands-free while I'm commuting, exercising, or busy with other tasks.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** User
* **A. Successful Audio Playback:**
    * **Given** the user is viewing the article summary page and their device has a functional audio output
    * **When** the user clicks the "Listen/Play" button
    * **Then** the system converts the summary text to speech using a clear voice and plays the audio.
* **B. Device Limitation Handling:**
    * **Given** the device has no detected audio output or the browser API is unsupported
    * **When** the user clicks the "Listen/Play" button
    * **Then** the button is disabled, or a message is shown: "Audio playback not supported on this device/browser."

---

##  US11: Bookmark/Save Article for Later
### Front of the Card: **My Reading List**
> **As a Registered User, I want an easy way to bookmark/save any interesting article, so I can find it later in a dedicated list and read it at a more convenient time.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** User
* **A. Successful Bookmark:**
    * **Given** the user is logged in
    * **When** the user clicks the bookmark icon on an article
    * **Then** the article is instantly saved to the user’s bookmark list, and the icon state changes (e.g., from outline to filled).
* **B. Removing a Bookmark:**
    * **Given** the user clicks the bookmark icon on an already saved article
    * **When** the action is performed
    * **Then** the system removes the article from the bookmark list, and the icon reverts to its unsaved state.
* **C. Offline Bookmark Handling:**
    * **Given** there is no active internet connection
    * **When** the user tries to bookmark an article
    * **Then** the system shows an error notification: "Could not save. Check your connection."

---

##  US12: Share Article
### Front of the Card: **Spreading the News**
> **As a User, I want a quick way to share a news article, so I can easily send it to friends, family, or colleagues via various communication channels.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** User
* **A. Sharing Menu Display:**
    * **Given** the user is viewing a news summary
    * **When** the user clicks the "Share" icon
    * **Then** the system displays a native or custom sharing menu with relevant platform options (e.g., Email, WhatsApp, Twitter, Copy Link).
* **B. Successful Content Sharing:**
    * **Given** the share menu is displayed
    * **When** the user selects an application (e.g., WhatsApp)
    * **Then** the system securely shares a link to the article summary page through that application.

---

##  US13: Personalized News Feed
### Front of the Card: **Tailored Content**
> **As a Registered User, I want to explicitly select my topics of interest, so my main news feed is automatically filtered and tailored to show me exactly what I care about most.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** User
* **A. Feed Customization:**
    * **Given** the user is logged in and is in the "Preferences" or "Settings" menu
    * **When** the user selects or deselects specific news categories/topics (e.g., Technology, Finance, Sports)
    * **Then** the system saves the preferences and updates the main news feed display to exclusively match the selected categories.

---

##  US14: Receive Notifications of Personalized News
### Front of the Card: **Breaking News Alerts**
> **As a System, I want to be able to send real-time notifications for breaking news on topics a user follows, so the user can stay informed on their interests without constantly checking the app.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** System
* **A. Notification Trigger:**
    * **Given** the user is logged in, has saved preferences (US13), and has notifications enabled globally
    * **When** the system detects *high-priority* breaking news relevant to the user’s interests
    * **Then** the system sends a push notification to the user’s device.
* **B. Direct Article Access:**
    * **Given** a push notification is successfully delivered
    * **When** the user taps the notification
    * **Then** the app opens and navigates directly to the corresponding article summary page (US8).
* **C. Respecting User Preference:**
    * **Given** the user has explicitly disabled notifications in their settings
    * **When** breaking news is detected
    * **Then** no notification is delivered for that user.

---

##  US15: Translate News Summary
### Front of the Card: **Global Understanding**
> **As a User, I want the ability to translate a news summary into a different language with a single click, so I can easily understand content published outside of my native tongue.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** User
* **A. Translation Option Display:**
    * **Given** the user is viewing an article summary
    * **When** the user clicks the "Translate" option
    * **Then** the system displays a drop-down menu or list of available translation languages.
* **B. Successful Translation:**
    * **Given** the user selects a language (e.g., Spanish) and the translation service is available
    * **When** the system translates the summary
    * **Then** the fully translated summary is immediately shown in place of the original text.
* **C. Reverting to Original:**
    * **Given** the summary is currently translated
    * **When** the user selects a "Show Original" option
    * **Then** the original language text is displayed again.
* **D. Connection Failure:**
    * **Given** no active internet connection exists
    * **When** the user attempts translation
    * **Then** an "Translation Service Unavailable" error is displayed.
* **E. Translation Service Failure:**
    * **Given** the translation service fails due to an API error
    * **When** the user attempts translation
    * **Then** the system shows an error indicating a temporary failure, rather than a poor or inaccurate translation.

---

##  US16: Getting News
### Front of the Card: **Content Ingestion Engine**
> **As a System, I need to reliably and continuously obtain news articles from a diverse set of news publishers, so I can consistently provide fresh, summarized content to our users.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** System
* **A. Article Fetching and Summarization:**
    * **Given** the system fetches a new article from a publisher (via API or scraping)
    * **When** the article data is processed
    * **Then** the system successfully generates a valid, new summary (US18).
* **B. Handling Source Unavailability:**
    * **Given** one or more integrated news sources are unresponsive or offline
    * **When** the system attempts to fetch articles from that source
    * **Then** the system gracefully logs the error and continues fetching from the remaining available sources, displaying only existing articles for the failed source.
* **C. Duplicate Prevention:**
    * **Given** the system fetches an article that is highly similar (via title/body text) to an already summarized article
    * **When** it recognizes the similarity
    * **Then** the system flags it as a duplicate and does **not** create a new entry or summary.
* **D. Content Diversity:**
    * **Given** only one publisher covers a specific topic
    * **When** the system fetches articles
    * **Then** the system correctly presents only that publisher's article(s) on the topic, without generating placeholder or duplicate content.

---

##  US17: Attach the reference of that Article
### Front of the Card: **Source Credibility**
> **As a System, I must attach the original source link for every article, so that users can easily access the publisher's site for the full text, ensuring transparency and providing a reference.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** System
* **A. Valid Link Attachment:**
    * **Given** the system has successfully fetched a news article and the original reference link is available
    * **When** the summary is generated
    * **Then** the system securely attaches the valid, functional reference link with the summary.
* **B. Invalid Link Logging:**
    * **Given** the system fetches an article where the reference link is improperly formatted or missing
    * **When** the system processes the article
    * **Then** the link is **not** attached to the summary, and the system logs an error for manual review.
* **C. Broken Link Detection on Access:**
    * **Given** the original publisher later removes the article, making the stored link invalid
    * **When** the user tries to access the link (US9)
    * **Then** the system should display a broken link error page (e.g., "The original article has been removed by the publisher.").

---

##  US18: Generate Summaries with AI
### Front of the Card: **AI Condensation**
> **As a System, I need to accurately generate concise, informative summaries of every news article using AI, so that users can save time and quickly decide if they want to read the full article.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** System
* **A. Valid and Concise Summary:**
    * **Given** a full news article text is provided
    * **When** the system generates the summary
    * **Then** a valid, concise summary ($\le 400$ words) is produced and displayed alongside the original reference link.
* **B. Summary Generation Failure:**
    * **Given** the AI summarization service fails (e.g., source text too short, API is down, or the content is non-textual)
    * **When** the system attempts generation
    * **Then** the system displays a professional error message (e.g., "Summary temporarily unavailable, please read the full article.") or a placeholder text instead of an empty field.
* **C. Factual Consistency/Hallucination Check:**
    * **Given** the system generates a summary
    * **When** the summary is compared against the original article
    * **Then** the summary must be factually consistent with the original article, avoiding AI "hallucinations" or misrepresentations.

---

##  US19: Update/Correct the News
### Front of the Card: **Continuous Relevance**
> **As a System, I must automatically check for and update/correct news summaries when I detect new information regarding an existing topic, so that the user is always properly informed with the latest developments.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** System
* **A. Proactive Update Cycle:**
    * **Given** the system's content ingestion cycle runs (e.g., every 6 hours)
    * **When** the system finds an original article link has been updated by the publisher (e.g., new headline, new paragraphs)
    * **Then** the system generates a **new summary** (US18) to reflect the changes and updates the article entry.
* **B. No Change Handling:**
    * **Given** the system checks for updates on an article
    * **When** no new information or updates are found in the source
    * **Then** no new summary is generated, and the existing summary and reference remain in place.
* **C. Topic Conclusion:**
    * **Given** the publisher marks a topic/article as concluded, archived, or retracted
    * **When** the system checks for updates
    * **Then** no further updates are provided, and the article may be visually marked on the platform as "Topic Concluded."

---

##  US20: Submit an Inquiry via Contact Form
### Front of the Card: **Getting Help**
> **As a User or Casual Surfer, I want to easily fill out and submit the "Contact Us" form, so I can send an inquiry or feedback to the support team.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** User / Surfer
* **A. Successful Submission:**
    * **Given** the user has entered valid data in all required fields (Name, Email, Message)
    * **When** the user clicks the **Submit** button
    * **Then** the system displays a "Thank You" message and successfully sends the form data to the designated support email/system.
* **B. Required Field Validation:**
    * **Given** the user has left one or more required fields empty
    * **When** the user clicks the **Submit** button
    * **Then** the system prevents form submission and highlights the missing fields with an immediate error message.
* **C. Email Format Validation:**
    * **Given** the user enters text in the Email field that does not conform to a valid email format (e.g., missing '@' or '.com')
    * **When** the user attempts to submit the form
    * **Then** the system displays a clear "Please enter a valid email address" error message *inline*.

---

##  US21: Register with a Unique Username
### Front of the Card: **Unique Identity**
> **As a System Administrator, I want a unique identifier for each registered User (the Username), so that we can easily recognize, reference, and manage each user's data without conflicts.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** System Admin (Functionality executed by User)
* **A. Valid and Available Username:**
    * **Given** the username field has constraints (e.g., 6-18 characters, alphanumeric/underscore only)
    * **When** the user enters a username that **meets all constraints** and **is not already taken**
    * **Then** the system provides immediate visual confirmation (e.g., a green checkmark/status text) that the username is available and valid.
* **B. Unavailable Username Prevention:**
    * **Given** the user is attempting to register
    * **When** the user enters a username that is **already in use** by another account
    * **Then** the system displays a prominent error message indicating the name is unavailable (e.g., "This username is taken. Please choose another.").
* **C. Constraint Violation Feedback:**
    * **Given** the system constraints require only specific characters and length
    * **When** the user enters a username containing a disallowed character (e.g., spaces, special symbols, or wrong length)
    * **Then** the system immediately displays an inline error message detailing the specific constraint violation.
