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

### US1: View Aggregated News Articles
> **As a User / Surfer I want see the trending News to keep myself updated.**

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

### US2: Register/Login
> **As a Surfer I want to Login/Register so that I can use the additional features.**

**Primary Actor:** Surfer

**Acceptance Criteria:**
* **Given** the user provides valid credentials
    * **When** the user enters credentials
    * **Then** the system validates and logs the user in.
* **Given** the user provides invalid credentials
    * **When** the user attempts to log in
    * **Then** an error message is displayed.

---

### US3: Manage Account
> **As a User I want to change my account information so that if I made any mistake, I can correct it later and also update my preferences.**

**Primary Actor:** User

**Acceptance Criteria:**
* **Given** the user is in account settings
    * **When** the user updates profile information
    * **Then** the system validates and updates the details.
* **Given** the user enters invalid information
    * **When** the system validates the input
    * **Then** an error message is displayed.

---

### US4: Read AI-generated Summaries
> **As a surfer/User I clicked on the news article so that I can read the summary of that Article.**

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

### US5: Read the Whole Article
> **As a Surfer I clicked on the News Article Link because I want to read the whole article.**

**Primary Actor:** Surfer

**Acceptance Criteria:**
* **Given** the user clicks the news article link
    * **When** the system opens the article
    * **Then** the actual news article is displayed.
* **Given** there is no internet connection
    * **When** the user clicks the link
    * **Then** an error message is displayed.

---

### US6: Text-to-Speech for Summaries

## Front of the Card
> **As a User, I want to listen to the news summary so that I can consume information while I am busy with other tasks.**

## Back of the Card
**Primary Actor:** User

**Acceptance Criteria:**
* **Given** the user is on the article summary page and device has audio
    * **When** the user clicks the "Listen/Play" button
    * **Then** the system converts text to speech and plays audio.
* **Given** no audio output is present
    * **When** the user clicks the "Listen/Play" button
    * **Then** the user cannot listen to the summary.

---

### US7: Bookmark/Save Article for Later

## Front of the Card
> **As a User, I want to bookmark/save an interesting article so that I can easily find and read it later.**

## Back of the Card
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

### US8: Share Article

## Front of the card
> **As a User, I want to share a news article so that I can send it to friends, family, or colleagues.**

## Back of the card
**Primary Actor:** User

**Acceptance Criteria:**
* **Given** the user is viewing a news summary
    * **When** the user clicks the share icon
    * **Then** the system shows sharing menu options.
* **Given** the share menu is displayed
    * **When** the user selects an application
    * **Then** the article link is shared through that application.

---

### US9: Personalized News Feed

## Front of the card
> **As a user, I want to select my topics of interest so that my news feed is tailored to what I care about.**

## Back of the card
**Primary Actor:** User

**Acceptance Criteria:**
* **Given** the user is logged in
    * **When** the user selects preferences in settings
    * **Then** the system updates the news feed to match selected categories.

---

### US10: Receive Notifications of Personalized News

## Front of the card
> **As a System, I want to send notifications for breaking news on topics a user follows so that the user can stay informed in real-time.**

## Back of the card
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

### US11: Translate News Summary

## Front of the card
> **As a User, I want to translate a news summary into a different language so that I can understand content that was not published in my native tongue.**

## Back of the card
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
> As a system I want to obtain news from various news publishers so I can provide summaries of news articles to the users. 

### Back of the card
- **Preconditions:** System can fetch news articles form at least 3 different publishers, news articles include headline, publication date, and URL, and news articles from different publishers should be easily distinguishable. 
- **Postconditions:** The system has the news article available from the publisher, and the system is able to generate a summary of the news article. 
- **Primary Actor:** System
- **Secondary Actor:** News Publisher

#### Main Flow
1. The user opens the system to view/obtain news summaries. 
2. System determines if the article's category matches a user's saved preferences.
3. The system requests new articles on the topic of interest from multiple news publishers.
4. The request is granted and the system has available multiple news articles of the topic of interest. 
5. The system is able to generate valid news summaries of the articles obtained. 

#### Alternate Flow
2.a. The system attempts to fetch articles from publishers but those articles are not available. 
3.a. The system recognizes that these articles are similar or have already been provided & summarized before.

#### Exceptions
3.a. **There is only one news publisher currently exploring this topic:** The system only receives news articles from one publisher at the moment.

---

## US13: Attach the reference of that Article

### Front of the card
> As a system I want to attach the reference of that article so that the users that obtain the original news article for further information or use it as a reference. 

### Back of the card
- **Preconditions:** News articles must provide or have provided a valid URL to their original article, 
- **Postconditions:** The system has the news article available from the publisher, and the system is able to generate a summary of the news article. The reference link attached shall not be invalid or lead to 404 pages. 
- **Primary Actor:** System
- **Secondary Actor:** News Publisher

#### Main Flow
1. The system requests news articles from the news publishers based on the topic of interest of the user. 
2. The system checks if a valid reference link has been attached to the news article or not. 
3. If the reference link has been attached and is valid than the system will provide the link with the summary generated. 

#### Alternate Flow
3.a. The reference link is not valid. 

#### Exceptions
3.a. **The reference link has become invalid a short period after:** The reference link was valid in the beginning but became invalid after receving the article. 

---

## US14: Generate Summaries with AI

### Front of the card
> As a system, I want to generate summaries of the news article so the users do not have to read the entire article. 

### Back of the card
- **Preconditions:** The summary must be no longer than a specified length (for example 400 words). The summary should capture the main points of the articles. Headline/main topic, key facts or findings, and conclusion of significant outcomes. If system fails to generate summary it should display an error message. The system should automatically update summaries based on the new update it finds.
- **Postconditions:** The system generates a valid summary of the provided news article.
- **Primary Actor:** User
- **Secondary Actor:** System

#### Main Flow
1. The user requests a summary of the news article. 
2. The system uses AI to create the summary of the article. 
3. The system provides the summary with the reference link to the user. 

#### Alternate Flow
2.a. AI is not able to generate a summary at the moment. 

#### Exceptions
3.a. **The summary is inaccurate:**  The system AI generates an inaccurate summary of the news article. 

---

## US15: Update/Correct the News 

### Front of the card
> As a system, I want to update/correct the news in the event where I obtain new information regarding the topic so that the user can be properly informed on that topic. 

### Back of the card
- **Preconditions:** The system should automatically update information to reflect the news article that they have obtained from the publisher. The system must recognize the new information provided in the latest news article compared to the older version. System must verify that the content of the latest news article provided is relevant to the topic (the update cannot be of another topic). The system must correct the news within a correct time frame. The system should update the date of the latest published article to reflect the most recent information. 
- **Postconditions:** The user has an updated summary and reference link to the updates news article. 
- **Primary Actor:** System
- **Secondary Actor:** News Publisher

#### Main Flow
1. The system fetches an updated news article along with its reference link 
2. The system creates a summary of that updated article and then provides it to the user. 


#### Alternate Flow
1.a. There is no updated news article on the topic of interest for the user. 

#### Exceptions
3.a. **The topic is a concluded one:**  Since the topic is concluded, there is no update to provide about the news.
