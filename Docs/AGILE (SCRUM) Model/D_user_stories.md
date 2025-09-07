<div align="center">
  <img src="https://www.daiict.ac.in/sites/default/files/inline-images/20250107DAUfinalIDcol_SK-01_0.png" alt="University Logo" width="150">
</div>

# Project: News Aggregator
### Course: IT314 SOFTWARE ENGINEERING
### University: Dhirubhai Ambani University
### Professor: Prof. Saurabh Tiwari

---

## Group-5 Members

| Student ID         | Name             |
| :----------------- | :--------------- |
| 202301035 (Leader) | Patel Dhruvil    |
| 202301003          | Kartik Vyas      |
| 202301016          | Tirth Gandhi     |
| 202301017          | Jeet Daiya       |
| 202301025          | Tirth Boghani    |
| 202301047          | Jeel Thummar     |
| 202301049          | Shivam Ramoliya  |
| 202301062          | Maulik Khoyani   |
| 202301063          | Vrajesh Dabhi    |
| 202301065          | Vansh Padaliya   |

---

# Task D: User Stories

## UC1: View Aggregated News Articles

### Front of the card
> As a User / Surfer I want see the trending News to Keep my self Updated.

### Back of the card
- **Preconditions:** System is connected to news sources.
- **Postconditions:** User / Surfer sees a list of news articles.
- **Primary Actor:** User/Surfer
- **Secondary Actor:** System

#### Main Flow
1. User opens platform.
2. System displays latest aggregated news.

#### Alternate Flow
2.a. If sources are unavailable show cached news.

#### Exceptions
1.a. No internet error message.

---

## UC2: Register/Login

### Front of the card
> As a surfer I want to Login/Register so that I can use the additional features.

### Back of the card
- **Preconditions:** User provides valid credentials.
- **Postconditions:** Session created.
- **Primary Actor:** Surfer
- **Secondary Actor:** System

#### Main Flow
1. Surfer enters credentials.
2. System validates.
3. Surfer logged in as a User.

#### Exceptions
1.a. Invalid credentials error message.

---

## UC3: Manage Account

### Front of the card
> As a User I want to change My account Information so that if I made any mistake, I can correct it later and also update my preferences.

### Back of the card
- **Preconditions:** User opens the setting.
- **Postconditions:** Details Are Updated.
- **Primary Actor:** User
- **Secondary Actor:** System

#### Main Flow
1. User Goes to the Change the Profile Information.
2. System validates.
3. User Successfully changes the details.

#### Exceptions
1.a. Invalid Information error message.

---

## UC4: Read AI-generated Summaries

### Front of the card
> As a surfer/User I clicked on the news article so that I can read the summary of that Article.

### Back of the card
- **Preconditions:** Surfer/User Selects the Article.
- **Postconditions:** Summary displayed to the surfer/User.
- **Primary Actor:** Surfer/User
- **Secondary Actor:** System

#### Main Flow
1. Surfer/User selects news article.
2. System displays AI-generated summary.
3. If surfer/user Want to read the whole Article the He/she can read it by clicking of the News Article Link. (Extension Point)
4. If user want to read the Article in Different Language then He/She can change the language. (Extension Point)
5. If User wants to listen the News instead of reading them then He/She can do with Text - To - Speech functionality. (Extension Point)
6. If User want to save / share / Bookmark the News then He/She can do that. (Extension Point)

---
## UC5: Read the Whole Article

### Front of the Card
> As a Surfer I clicked on the News Article Link because I want to read the whole article.

### Back of the Card
- **Preconditions:** User Clicks on the News Article Link.
- **Postconditions:** Actual News Article displayed to the surfer.
- **Primary Actor:** Surfer
- **Secondary Actor:** system, News Source

#### Main Flow
1. Surfer clicks on the news Article Link.
2. Surfer Reaches to the page where the Actual News is.

#### Exceptions
1.a.1. No internet error message.

---

## UC6: Text-to-Speech for Summaries

### Front of the Card
> As a User, I want to listen to the news summary so that I can consume information while I am busy with other tasks.

### Back of the Card
- **Preconditions:**
    1. User is on the article summary page.
    2. The device has audio output.
    3. User is logged in.
- **Primary Actor:** User
- **Secondary Actor:** System

#### Main Flow
5.a. User clicks the Listen / Play Audio icon on the summary page. \
5.b. System initiates text-to-speech conversion of the summary text. \
5.c. System plays the generated audio through the user's device.

#### Exceptions
5.b.1. No audio output is present. The user would be unable to listen to the news summary.

---

## UC7: Bookmark/Save Article for Later

### Front of the Card
> As a User, I want to bookmark/save an interesting article so that I can easily find and read it later.

### Back of the Card
- **Preconditions:** User is logged in.
- **Postconditions:** The selected article is added to the user's personal "Bookmark" list.
- **Primary Actor:** User
- **Secondary Actor:** System

#### Main Flow
6.a. User clicks the "Save"/"Bookmark" icon on an article Summary. \
6.b. System adds the article to the user's bookmark list. \
6.c. System provides visual feedback confirming the article is saved.

#### Alternate Flow
6.a.1. If the user clicks the "Save" icon on an already saved article, the system removes it from the bookmark list.

#### Exceptions
6.a.1. **No internet connection:** User is notified to check their internet connection.

---

## UC8: Share Article

### Front of the card
> As a User, I want to share a news article so that I can send it to friends, family, or colleagues.

### Back of the card
- **Preconditions:** User is viewing an article summary.
- **Postconditions:** The user is presented with options to share the article link.
- **Primary Actor:** User
- **Secondary Actor:** System

#### Main Flow
7.a User clicks the "Share" icon. \
7.b System opens the sharing menu (e.g., options for WhatsApp, Email, etc.). \
7.c User selects an application to share the article link with. \

---

## UC9: Personalized News Feed

### Front of the card
> As a user, I want to select my topics of interest so that my news feed is tailored to what I care about.

### Back of the card
- **Preconditions:** User is logged in.
- **Postconditions:** The user's home feed is updated to show news based on their selected preferences.
- **Primary Actor:** User
- **Secondary Actor:** System

#### Main Flow
1. User navigates to their profile or settings page.
2. User selects the "Preferences" or "Interests" option.
3. User chooses from a list of categories (e.g., "Technology", "Sports", "World News").
4. User saves the changes.
5. System reloads the main news feed, curating it based on the new preferences.

---

## UC10: Receive Notifications of Personalized News

### Front of the card
> As a System, I want to send notifications for breaking news on topics a user follows so that the user can stay informed in real-time.

### Back of the card
- **Preconditions:** User is logged in, has set their preferences, and has granted the app notification permissions.
- **Postconditions:** A notification is delivered to the user's device for relevant news.
- **Primary Actor:** System
- **Secondary Actor:** User

#### Main Flow
1. System identifies a new, high-importance article based on the preferences.
2. System determines if the article's category matches a user's saved preferences.
3. System sends a push notification to the user's device with the article headline.
4. User taps on the notification.
5. System opens the app directly to the corresponding article summary.

#### Alternate Flow
3.a. The user can enable or disable notifications for specific categories within the app settings.

#### Exceptions
3.a. **User has disabled notifications:** The notification is not delivered.

---

## UC11: Translate News Summary

### Front of the card
> As a User, I want to translate a news summary into a different language so that I can understand content that was not published in my native tongue.

### Back of the card
- **Preconditions:** User is viewing an article summary. The system is connected to a translation service.
- **Postconditions:** The summary text is displayed in the user's selected language.
- **Primary Actor:** User
- **Secondary Actor:** System

#### Main Flow
1. User clicks on the "Translate" option available on the summary page.
2. System displays a list of available languages.
3. User selects their desired language from the list.
4. System translates the summary text using AI.
5. System displays the translated summary to the user.

#### Alternate Flow
5.a. The system provides a button to "Show Original" to revert the text to its original language.

#### Exceptions
4.a. **No internet connection:** The system displays an error notifying the user of no internet connection. \
4.b. **Translation Failure:** Translation for the selected language fails, the user may get poorly translated news.

---

## UC12: Getting News

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

## UC13: Attach the reference of that Article

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

## UC14: Generate Summaries with AI

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

## UC15: Update/Correct the News 

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
