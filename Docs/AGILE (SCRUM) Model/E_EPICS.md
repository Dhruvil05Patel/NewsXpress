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

# Task E: Identification of EPICS

## Epic 1: Content Aggregation

### Epic Summary:

→ This foundational epic covers all backend processes required to build a reliable and intelligent content engine. The primary goal is to autonomously fetch raw news from multiple external publishers, process it into a standardized format, enrich it with AI-generated summaries, and ensure its accuracy and timeliness. This epic is the backbone of the entire platform, as no user-facing features can function without this content.

### Scope & Key Features:

1. Establishing connections and fetching raw articles from a diverse set of news publishers.
2. Validating incoming data, ensuring each article has a headline, date, and a valid, non-broken source URL.
3. Implementing an AI model to generate concise, accurate summaries that capture the essence of the full article.
4. Creating a mechanism to detect and process updates to previously published articles, ensuring users always have the most current information.
5. Defining the data exchange protocol with news publishers.

### Constituent User Stories:

```
User Story: Getting News.

User Story: Attach the reference of that article.

User Story: Generate summaries with AI.

User Story: Update the news.

```

## Epic 2: Core News Consumption Experience

### Epic Summary:

→ This epic focuses on delivering the fundamental value proposition to the end-user (the "Surfer"). It encompasses the entire journey of a user discovering, consuming, and exploring news content in its basic form. The goal is to create a seamless and intuitive interface where a user can open the platform, immediately see trending news, read a quick summary, and effortlessly navigate to the original source if they wish to learn more.

### Scope & Key Features:

Development of the main user interface for displaying a list of aggregated news articles.

Displaying the AI-generated summary when a user selects an article.

Providing a clear and functional link to redirect the user to the original news article on the publisher's website.

Handling basic system states like unavailable sources (by showing cached news) and no internet connectivity.

### Constituent User Stories:

```
User Story: View Aggregated News Articles

User Story: Read AI-generated Summaries

User Story: Read the Whole Article

```

## Epic 3: User Account and Authentication

### Epic Summary:

→ This epic introduces the concept of user identity within the platform. The goal is to allow users to create and manage a personal account, transitioning them from anonymous "Surfers" to registered "Users." This is a gateway epic that enables all subsequent personalization and saved-state features.

### Scope & Key Features:

Implementing a secure user registration and login system.

Managing user sessions to keep users logged in across multiple visits.

Building a user profile/settings area where users can view and update their account information (e.g., email, password, preferences).

Handling credential validation and providing clear error messaging for invalid login attempts or information submission.

### Constituent User Stories:

```
User Story: Register/Login

User Story: Manage Account

```

## Epic 4: Personalization and Engagement Engine

### Epic Summary:

→ This epic aims to transform the generic news feed into a highly personalized and proactive experience tailored to each user's interests. The goal is to significantly increase user engagement and retention by delivering the right content at the right time. This is achieved by learning user preferences and using that data to curate their feed and send timely notifications.

### Scope & Key Features:

Developing a system for users to explicitly declare their topics of interest (e.g., Technology, Sports).

Modifying the feed-generation algorithm to prioritize content that matches a user's saved preferences.

Implementing a push notification system that alerts users to high-importance breaking news within their chosen categories.

Providing granular control for users to manage their notification settings.

### Constituent User Stories:

```
User Story: Personalized News Feed 

User Story: Receive Notifications of Personalized News

```

## Epic 5: Enhanced User Experience & Accessibility Features

### Epic Summary:

→ This epic groups a set of features designed to add layers of utility, accessibility, and sociability on top of the core news consumption experience. The goal is to make the content more accessible to a wider audience and empower users to save, share, and consume information in a way that best fits their lifestyle and needs.

### Scope & Key Features:

Integrating a text-to-speech engine to read summaries aloud and a translation service to present content in multiple languages.

Providing functionality for users to save or bookmark articles for later reading, creating a personal library.

Enabling users to easily share article links through their device's native sharing capabilities to other apps and contacts.

### Constituent User Stories:

```
User Story: Text-to-Speech for Summaries

User Story: Bookmark/Save Article for Later

User Story: Share Article

User Story: Translate News Summary

```
