<div align="center">
  <img src="https://www.daiict.ac.in/sites/default/files/inline-images/20250107DAUfinalIDcol_SK-01_0.png" alt="University Logo" width="300">
</div>
<div align="center">

# Project: News Aggregator  
### Course: IT314 SOFTWARE ENGINEERING  
### University: Dhirubhai Ambani University  
### Professor: Prof. Saurabh Tiwari  

</div>

---

<div align="center">

## Group-5 Members

| Student ID         | Name             | GitHub |
| :----------------- | :--------------- | :----- |
| 202301035 (Leader) | Patel Dhruvil    | <a href="https://github.com/Dhruvil05Patel"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301003          | Kartik Vyas      | <a href="https://github.com/KartikVyas1925"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301016          | Tirth Gandhi     | <a href="https://github.com/tirthgandhi9905"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301017          | Jeet Daiya       | <a href="https://github.com/JeetDaiya"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301025          | Tirth Boghani    | <a href="https://github.com/TirthB01"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301047          | Jeel Thummar     | <a href="https://github.com/Jeel3011"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301049          | Shivam Ramoliya  | <a href="https://github.com/Shivam-Ramoliya"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301062          | Maulik Khoyani   | <a href="https://github.com/Maulik2710"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301063          | Vrajesh Dabhi    | <a href="https://github.com/VrajeshDabhi"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |
| 202301065          | Vansh Padaliya   | <a href="https://github.com/vanshkpadaliya"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="22"/></a> |

</div>

---

# Task D: User Stories

## User Authentication Epic

### US1: Account Registration & Email Verification
### Front of the Card
> **As a New User, I want to register using my basic information and verify my email so that I can create and activate my account securely.**

### Back of the Card
* **Primary Actor:** User
* **Given** the user provides valid **Name**, **Email**, **Username**, and **Password**
    * **When** they submit the registration form
    * **Then** the system creates an **unverified account entry**.
* **Given** the user enters an email that is already registered
    * **When** they attempt to register
    * **Then** the system displays an **“Email already exists”** message.
* **Given** the user enters a username that is taken or violates username rules
    * **When** they attempt to register
    * **Then** the system displays a message indicating the **username is unavailable or invalid**.
* **Given** the user enters a password that does not meet the required constraints (min length 8, uppercase, lowercase, digit, special character)
    * **When** the user attempts registration
    * **Then** the system **rejects the password** and displays **password guidelines**.
* **Given** the account was successfully created
    * **When** the system finalizes registration
    * **Then** the system **sends a verification email** containing a **verification link**.
* **Given** the user clicks the verification link
    * **When** the link is **valid**
    * **Then** the system updates the account status to **Verified**.

---

### US2: User Login
### Front of the Card
> **As a Registered User, I want to log into my account securely so that I can access my personalized news and features.**

### Back of the Card
* **Primary Actor:** User
* **Given** the user enters correct login credentials
    * **When** they attempt to log in
    * **Then** the system **authenticates the user**.
* **Given** the user enters incorrect email or password
    * **When** they attempt to log in
    * **Then** the system displays an **“Invalid email or password”** message.
* **Given** the user’s account is not verified
    * **When** they enter correct credentials
    * **Then** the system **prevents login** and displays a **“Please verify your email”** message.
* **Given** the user logs in from another device
    * **When** they enter valid credentials
    * **Then** the system **grants secure access** to their account.

---

### US3: Password Reset
### Front of the Card
> **As a user, I want to reset my password so that I can regain access if I forget it.**

### Back of the Card
* **Primary Actor:** User
* **Given** the user enters a registered and verified email
    * **When** they request password reset
    * **Then** the system sends an email with a reset link.
* **Given** the reset link is valid
    * **When** the user enters a new password
    * **Then** the system updates the password and confirms success.

### US4: Authentication Persistence
### Front of the Card
> **As a user, I want my login session to persist so that I don't need to log in every time the page reloads or I revisit the site.**

### Back of the Card
* **Primary Actor:** User
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

### US5: Manage Account
### Front of the Card
> **As a User I want to change my account information so that if I made any mistake, I can correct it later and also update my preferences.**

### Back of the Card
* **Primary Actor:** User
* **Given** the user is in account settings
    * **When** the user updates profile information
    * **Then** the system validates and updates the details.
* **Given** the user enters invalid information
    * **When** the system validates the input
    * **Then** an error message is displayed.

### US6: Register with a Unique Username
### Front of the Card
> **As a System Admin, I want to be able to recognize each User uniquely so that we do not mix the User Data.**

### Back of the Card
* **Primary Actor:** System Admin (Functionality executes during US2a)
* **Given** the username field has constraints (e.g., 6-18 characters, alphanumeric/underscore only)
    * **When** the user enters a username that **meets all constraints** and **is not already taken**
    * **Then** the system provides immediate visual confirmation (e.g., a green checkmark) that the username is available and valid.
* **Given** the user is attempting to register
    * **When** the user enters a username that is **already in use** by another account
    * **Then** the system displays an error message indicating the name is unavailable (e.g., "This username is taken. Please choose another.").
* **Given** the constraints require only specific characters
    * **When** the user enters a username containing a disallowed character (e.g., spaces, special symbols)
    * **Then** the system immediately displays an inline error message detailing the constraint violation.

---

## Content Ingestion & AI Epic

### US7: Content Ingestion Engine
### Front of the card: **Source Integration**
> **As a system I want to reliably obtain news articles from various news publishers so I can provide summaries of news articles to the users.**

### Back of the card: Acceptance Criteria
* **Primary Actor:** System
* **Given** the system fetches articles from multiple configured publishers
    * **When** the articles are available and valid
    * **Then** the article content is stored in a queue/database ready for processing (US7 continuation).
* **Given** the system fetches an already ingested article (URL/Title similarity check)
    * **When** it recognizes similarity
    * **Then** the system does not duplicate the entry.
* **Given** articles are unavailable from a source
    * **When** the system fetches from publishers
    * **Then** the system logs the source failure and continues with other sources.

### US8: Attach the Article Reference
### Front of the card: **Source Credibility**
> **As a system I want to attach the original reference link to the article entry, so that users can obtain the original news article for further information.**

### Back of the card: Acceptance Criteria
* **Primary Actor:** System
* **Given** the system has fetched a new article (US7)
    * **When** the article is processed
    * **Then** the valid, original reference link is stored with the article record.
* **Given** the reference link is invalid or missing
    * **When** the system processes the article
    * **Then** the system logs an error and stores the article with a 'No Reference' flag.

### US9: AI Summarization & Storage
### Front of the card: **AI Condensation Service**
> **As a system, I want to generate concise, factually consistent summaries of the full news article, so that I can store them for quick access.**

### Back of the card: Acceptance Criteria
* **Primary Actor:** System
* **Given** the system receives a full article text from the ingestion queue (US7)
    * **When** the AI generates the summary
    * **Then** a valid, concise summary ($\le 400$ words) is produced and stored.
* **Given** the AI cannot generate a summary (e.g., source text too short, irrelevant, API failure)
    * **When** the system attempts generation
    * **Then** the system stores a failure status or placeholder text.
* **Given** the system stores a generated summary
    * **When** the summary generation is complete
    * **Then** the summary must be factually consistent with the original article.

### US10: Update/Correct the News
### Front of the card
> **As a system, I want to update/correct the news in the event where I obtain new information regarding the topic so that the user can be properly informed on that topic.**

### Back of the Card
* **Primary Actor:** System
* **Given** the system fetches new information for an existing topic
    * **When** the original article is updated by the publisher
    * **Then** the system generates a new summary (US9) and updates the reference link (US8) if necessary.
* **Given** no new article is available
    * **When** the system checks for updates
    * **Then** no new summary is generated, and the existing one remains.
* **Given** the topic is concluded or archived
    * **When** the system checks for updates
    * **Then** no update is provided, and the article may be marked as "Concluded."

---

## News Consumption & Features Epic

### US11: View Aggregated News Articles
### Front of the Card: **The Daily Scoop**
> **As a Casual Surfer, I want to see the latest trending News, so I can keep myself effortlessly updated on current events.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** User/Surfer
* **Given** the system has processed articles with summaries (US9)
    * **When** the user opens the platform
    * **Then** the system displays the latest aggregated news feed cards (Title, Source, Date).
* **Given** sources are unavailable
    * **When** the user opens the platform
    * **Then** the system shows cached news.
* **Given** there is no internet connection
    * **When** the user opens the platform
    * **Then** an error message is displayed.

### US12: Read Summary & Link
### Front of the Card: **Viewing the Gist**
> **As a User/Surfer, I want to click an article card and see its AI summary and original source link, so I can quickly decide if I want to read the full article.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** Surfer/User
* **Given** the user selects a news article
    * **When** the summary page loads
    * **Then** the stored AI-generated summary (US9 output) and the original reference link (US8 output) are displayed.
* **Given** the user clicks the "Read Full Article" link
    * **When** the link is clicked
    * **Then** the system navigates to the external source (US8).
* **Given** the stored summary status is "Failed" or "Placeholder" (US9)
    * **When** the summary page loads
    * **Then** the system displays an error message or the placeholder text.

### US13: Read the Whole Article
### Front of the Card
> **As a Surfer I clicked on the News Article Link because I want to read the whole article.**

### Back of the Card
* **Primary Actor:** Surfer
* **Given** the user clicks the news article link
    * **When** the system opens the article
    * **Then** the actual news article is displayed.
* **Given** the source link is broken (US8)
    * **When** the user clicks the link
    * **Then** the system shows a broken link error.

### US14: Text-to-Speech for Summaries
### Front of the Card
> **As a User, I want to listen to the news summary so that I can consume information while I am busy with other tasks.**

### Back of the Card
* **Primary Actor:** User
* **Given** the user is on the article summary page (US12) and device has audio
    * **When** the user clicks the "Listen/Play" button
    * **Then** the system converts text to speech and plays audio.
* **Given** no audio output is present
    * **When** the user clicks the "Listen/Play" button
    * **Then** the user cannot listen to the summary.

### US15: Bookmark/Save Article for Later
### Front of the Card
> **As a User, I want to bookmark/save an interesting article so that I can easily find and read it later.**

### Back of the Card
* **Primary Actor:** User
* **Given** the user is logged in
    * **When** the user clicks the bookmark icon
    * **Then** the article is saved to the user’s bookmark list.
* **Given** the user clicks bookmark on an already saved article
    * **When** the action is performed
    * **Then** the system removes the article from the bookmark list.
* **Given** there is no internet connection
    * **When** the user tries to bookmark an article
    * **Then** the system shows an error notification.

### US16: Share Article
### Front of the card
> **As a User, I want to share a news article so that I can send it to friends, family, or colleagues.**

### Back of the card
* **Primary Actor:** User
* **Given** the user is viewing a news summary (US12)
    * **When** the user clicks the share icon
    * **Then** the system shows sharing menu options.
* **Given** the share menu is displayed
    * **When** the user selects an application
    * **Then** the article link is shared through that application.

### US17: Personalized News Feed
### Front of the card
> **As a user, I want to select my topics of interest so that my news feed is tailored to what I care about.**

### Back of the card
* **Primary Actor:** User
* **Given** the user is logged in
    * **When** the user selects preferences in settings
    * **Then** the system updates the news feed to match selected categories.

### US18: Receive Notifications of Personalized News
### Front of the card
> **As a System, I want to send notifications for breaking news on topics a user follows so that the user can stay informed in real-time.**

### Back of the card
* **Primary Actor:** System
* **Given** the user is logged in, has preferences (US17), and notifications enabled
    * **When** the system finds breaking news in the user’s interest
    * **Then** the system sends a push notification.
* **Given** a push notification is sent
    * **When** the user taps the notification
    * **Then** the app opens directly to the article summary (US12).
* **Given** the user has disabled notifications
    * **When** breaking news is detected
    * **Then** no notification is delivered.

### US19: Translate News Summary
### Front of the card
> **As a User, I want to translate a news summary into a different language so that I can understand content that was not published in my native tongue.**

### Back of the card
* **Primary Actor:** User
* **Given** the user is viewing an article summary (US12)
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
    * **Then** the system shows a translation failure error.

### US20: Submit an Inquiry via Contact Form
### Front of the Card
> **As a User / Surfer I want to easily fill out and submit a "Contact Us" form to send an inquiry.**

### Back of the Card
* **Primary Actor:** User / Surfer
* **Given** the user has entered valid data in all required fields (e.g., Name, Email, Message)
    * **When** the user clicks the **Submit** button
    * **Then** the system sends the form data to the designated support email.
* **Given** the user has left one or more required fields empty
    * **When** the user clicks the **Submit** button
    * **Then** the system prevents form submission.
* **Given** the user enters text in the Email field that is not a valid email format
    * **When** the user attempts to submit the form
    * **Then** the system displays a "Please enter a valid email address" error message.

---

### US21: Delete Account Permanently
### Front of the Card
> **As a User, I need a clear way to permanently delete all but one of my registered accounts to simplify my account management.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** User
* **Given** the user is logged in and navigates to the "Delete Account" section in settings
    * **When** the user clicks "Delete Account" and is prompted to confirm the action by re-entering their password
    * **Then** the system validates the password and displays a final confirmation warning about permanent data loss.
* **Given** the user accepts the final warning
    * **When** the user confirms the deletion
    * **Then** the system **permanently deletes** the user's account record, saved articles, preferences, and logs the event.
* **Given** the user cancels the deletion process at any step
    * **When** the user navigates away or clicks cancel
    * **Then** the account and data remain intact, and the user is redirected to the main settings page.
* **Given** an unauthorized attempt to access the account data is made after deletion
    * **When** the attempt occurs
    * **Then** the system returns an "Account Not Found" error.

---

### US22: Watch Live News Stream
### Front of the Card: **Real-Time Coverage**
> **As a User, I want to access a dedicated section to watch live video feeds of breaking news events so that I can get real-time, immediate updates.**

### Back of the Card: Acceptance Criteria
* **Primary Actor:** User/Surfer
* **Given** the system has integrated a live streaming source (e.g., a YouTube or CDN feed)
    * **When** the user navigates to the "Live News" section
    * **Then** the system displays the available live video stream(s) within the application interface.
* **Given** a live stream is currently active
    * **When** the user selects the stream
    * **Then** the video player loads and begins playing the live feed with controls (Play/Pause, Volume, Fullscreen).
* **Given** no current live breaking news stream is available
    * **When** the user navigates to the "Live News" section
    * **Then** the system displays a placeholder message (e.g., "No live events currently broadcasting, check back later.")
* **Given** the live stream link becomes invalid or fails during playback
    * **When** the system detects the failure
    * **Then** the video player displays an appropriate error message and attempts to reconnect or stops playback.