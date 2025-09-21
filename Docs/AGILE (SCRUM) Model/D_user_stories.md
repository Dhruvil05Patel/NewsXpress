<div align="center">
  <img src="https://www.daiict.ac.in/sites/default/files/inline-images/20250107DAUfinalIDcol_SK-01_0.png" alt="University Logo" width="150">
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

## US1: View Aggregated News Articles

### Front of the Card
> **As a User / Surfer I want see the trending News to keep myself updated.**

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

## US2: Register/Login

### Front of the Card
> **As a Surfer I want to Login/Register so that I can use the additional features.**

### Back of the Card
**Primary Actor:** Surfer

**Acceptance Criteria:**
* **Given** the user provides valid credentials
    * **When** the user enters credentials
    * **Then** the system validates and logs the user in.
* **Given** the user provides invalid credentials
    * **When** the user attempts to log in
    * **Then** an error message is displayed.

---

## US3: Manage Account

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

## US4: Read AI-generated Summaries

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

## US5: Read the Whole Article

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

## US6: Text-to-Speech for Summaries

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

## US7: Bookmark/Save Article for Later

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

## US8: Share Article

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

## US9: Personalized News Feed

### Front of the card
> **As a user, I want to select my topics of interest so that my news feed is tailored to what I care about.**

### Back of the card
**Primary Actor:** User

**Acceptance Criteria:**
* **Given** the user is logged in
    * **When** the user selects preferences in settings
    * **Then** the system updates the news feed to match selected categories.

---

## US10: Receive Notifications of Personalized News

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

## US11: Translate News Summary

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
    * **Then** the system shows poorly translated news.

---

## US12: Getting News

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

## US13: Attach the reference of that Article

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
    * **Then** the link is not attached.
* **Given** the reference link becomes invalid later
    * **When** the user tries to access it
    * **Then** the system shows a broken link error.

---

## US14: Generate Summaries with AI

### Front of the card
> **As a system, I want to generate summaries of the news article so the users do not have to read the entire article.**

### Back of the card
**Primary Actor:** System

**Acceptance Criteria:**
* **Given** the user requests a summary
    * **When** the system generates it
    * **Then** a valid summary (≤400 words) is displayed with reference.
* **Given** the AI cannot generate a summary
    * **When** the user requests one
    * **Then** the system displays an error message.
* **Given** the system generates a summary
    * **When** it is inaccurate
    * **Then** the user gets an inaccurate summary.

---

## US15: Update/Correct the News 

### Front of the card
> **As a system, I want to update/correct the news in the event where I obtain new information regarding the topic so that the user can be properly informed on that topic.**

### Back of the Card
**Primary Actor:** System

**Acceptance Criteria:**
* **Given** the system fetches new information
    * **When** the article is updated
    * **Then** the system generates a new summary and updates the reference link.
* **Given** no new article is available
    * **When** the system fetches updates
    * **Then** no new summary is generated.
* **Given** the topic is concluded
    * **When** the system checks for updates
    * **Then** no update is provided.
