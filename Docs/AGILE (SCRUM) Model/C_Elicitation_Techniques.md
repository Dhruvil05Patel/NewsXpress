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

# Task C: Apply elicitation techniques to gather the requirements (functional, non-functional and domain requirements).

## Functional Requirements

### User Authentication
- **How identified:** A fundamental need for any system that requires secure user access.  
- **Why important:**  Ensures secure and controlled access to the system for each user.
- **Why these elicitation techniques:**
   - **Questionnaires:** Use a survey to gather data on a large scale. You can ask closed-ended questions like "Do you prefer a password-based or social media-based login?" to quickly gather quantitative data from many potential users.
   - **Prototyping:** Create mock-ups of the sign-up and login screens to get immediate feedback from users on the design and flow. This helps you see if the process is intuitive and user-friendly.

### Personalized News Feed
- **How identified:**  A core feature to enhance user engagement.
- **Why important:**   Improves user experience by providing relevant, tailored content.
- **Why these elicitation techniques:**
   - **Ethnography:** Define scenarios for how users interact with the feed. For example, a scenario could be "User scrolls through the feed and clicks on a post about technology". This helps you model how the AI will track user behavior and update the feed.
   - **Brainstorming:** Engage a diverse group of stakeholders, including domain experts and data scientists, in a brainstorming session to generate ideas for new algorithms or features for personalization.
   - **Prototyping:** We will use different ML models to find the best and most accurate model for our personalization feature.
   -  **Questionnaires:** Use questionnaires to ask how well the personalized feed is working. Users can rate it to provide measurable feedback.

### Multi-Source Aggregation
- **How identified:**  A requirement to provide comprehensive and diverse news content.
- **Why important:**   Offers users a wider variety of news and perspectives from a single platform.
- **Why these elicitation techniques:**
   - **Studying Documentation:** Analyze existing news APIs and documentation from various publishers. This technique helps you understand the technical requirements for integrating data from different sources, including data formats in JSON.
   - **Prototyping:** We can use multiple source aggregation for different APIs and also test via web scraping.


### AI-Generated Summaries
- **How identified:** Identified as a feature to improve content accessibility and quick consumption.
- **Why important:**   Helps users quickly grasp the main points of an article without having to read the full text.
- **Why these elicitation techniques:**
   - **Interviews:** Interview users to understand their specific needs for summaries. For example, do they want a short summary, or one that focuses on a specific aspect of the article?
   - **Prototyping:** Create prototypes that show different types of summaries (e.g., extractive vs. abstractive). Allow users to compare them and provide feedback on readability and accuracy.
   - **Questionnaires:** Use questionnaires to ask a large group of users about their preferences for summary length and style. This can help you set the default settings for the AI model.

### Save/Share/Bookmark
- **How identified:** A common feature for user-generated content management and sharing.
- **Why important:**  Allows users to manage their favorite content and share it with others.
- **Why these elicitation techniques:**
   - **Prototyping:** Design mock-ups for how users will save, share, and bookmark articles. Test these prototypes with users to ensure the process is intuitive and easy to use.

### Push Notifications
- **How identified:** A marketing and user engagement feature.
- **Why important:**   Keeps users informed of breaking news and personalized updates.
- **Why these elicitation techniques:**
   - **Questionnaires:** Use a questionnaire to determine user preferences for notification frequency and content. This allows you to collect data on a wide scale to inform your strategy for when and how often to send notifications.
   - **Prototyping:** Create a prototype of the opt-in process for push notifications to ensure it is clear and persuasive.

### Multi-Lingual News Support & Text-to-Speech
- **How identified:** A requirement to broaden the app's audience and improve accessibility.
- **Why important:**   Makes the application accessible to a global audience and users with reading difficulties.
- **Why these elicitation techniques:**
   - **Interviews:** Interview users from different regions to understand their language preferences for news content and app navigation. You should also interview potential users with reading difficulties to understand their specific needs for text-to-speech functionality.
   - **Questionnaires:** Use surveys to gather data from a large number of users across different languages to find out which languages are most in demand.
   - **Prototyping:** Develop a prototype that demonstrates how the app will handle different languages and the text-to-speech function. This allows users to test the feature and provide feedback on the voice quality, speed, and overall user experience

---

## Non-Functional Requirements

### High Availability & Scalability for Global Users
- **How identified:** Inferred from the need to support a large, global user base.
- **Why important:**  Guarantees system reliability and consistent performance under high load.
- **Why these elicitation techniques:**
   - **Interviews:** You need to interview technical stakeholders, such as developers and system architects, to understand what is required to achieve high availability and scalability. Ask about expected usage patterns and peak traffic of a highly available system.
   - **Risk Analysis:** Some use cases have a high risk because their implementation is problematic. You can use risk analysis to identify potential failure points for high availability and scalability, such as a single server failure or a massive influx of users. This helps to prioritize and define specific requirements to mitigate those risks.
   - **Studying Documentation:** Analyze existing documentation on cloud infrastructure, server uptime standards, and service level agreements (SLAs) to set a benchmark for your system's availability.

### Fast Response of User Data
- **How identified:** A performance requirement to ensure a smooth user experience.
- **Why important:**  Prevents user frustration and ensures quick access to content.
- **Why these elicitation techniques:**
   - **Interviews:** Interview users and product managers to define what "fast" means to them. Ask specific questions about their expectations for response time and how much data will flow through the system.
   - **Questionnaires:** To gather quantitative data on what response time users expect, or how often they would send or receive data. This is an effective way to define performance metrics for a large user base.
   - **Studying Documentation:**  Create a prototype with different loading speeds to see what response time users find acceptable. This technique helps to get more precise feedback response time.
 
### Secure Handling of User Data
- **How identified:**  An essential requirement to protect user privacy and build trust.
- **Why important:**   Prevents unauthorized access, data breaches, and ensures compliance with privacy laws.
- **Why these elicitation techniques:**
   - **Interviews:** Ask questions about controlling access to the system and isolating user data.
   - **Misuse Cases:** In data leak, phishing attacks the data might get stolen by some unkown entity, to prevent that ensure users a safe environment while using this app.

### Accuracy in Multi-Lingual Support
- **How identified:** A quality requirement to ensure the integrity of translated content.
- **Why important:**   Ensures that news content is accurately and effectively communicated to users in different languages.
- **Why these elicitation techniques:**
   - **Interviews:** Interview a diverse group of users from different language backgrounds to understand their expectations for translation and content quality. You should ask about their preferences for tone, dialect, and how they define "accurate".
   - **Questionnaires:** Use surveys to determine the most in-demand languages among your user base. You can also ask about what level of translation accuracy they would find acceptable.
   - **Prototyping:** Develop a low-fidelity prototype that demonstrates how multi-lingual support will look and feel, and then have users from different language groups review it. This helps to identify any cultural or linguistic issues early on.

---

## Domain Requirements

### Content Quality & Moderation
- **How identified:** A business requirement to ensure the credibility and reliability of the news service.
- **Why important:**  Maintains the system's credibility and provides a reliable user experience.
- **Why these elicitation techniques:**
    - **Interviews:** To understand user preferences for login methods (e.g., social login, email/password, biometric) and security concerns. Ask direct questions about their experiences with authentication on other apps.
    - **Studying Documentation:** Analyze the content guidelines, style guides, and documentation of various news publishers. This helps you understand their standards for content, which is crucial for identifying and filtering out inappropriate or low-quality articles.
    - **Brainstorming:** Develop creative solutions for detecting duplicate articles, ensuring factual consistency, and moderating content. This is useful when the "news is uncertain" and innovation is important.
  
### Accessibility Standards
- **How identified:** A legal and ethical requirement to make the app usable for everyone.
- **Why important:**   Ensures the application is inclusive and complies with legal standards for users with disabilities.
- **Why these elicitation techniques:**
   - **Studying Documentation:** The requirement explicitly mentions **[WCAG 2.1 guidelines](https://www.w3.org/TR/WCAG21/)**. Analyze this documentation to understand the specific rules for screen reader support, contrast ratios, and other accessibility standards.
   - **Interviews:** Interview potential end-users with disabilities to understand their specific needs and challenges with news consumption. Also interview accessibility specialists to ensure compliance with the WCAG guidelines.
   - **Prototyping:** Create a prototype that supports a text-to-speech and other accessibility features. Have users test this prototype to get direct feedback on the usability of the text-to-speech function and overall app accessibility.

### Regulatory & Compliance Requirements
- **How identified:** A legal requirement to adhere to data privacy and copyright laws.
- **Why important:**  Protects the organization from legal and financial penalties related to non-compliance.
- **Why these elicitation techniques:**
   - **Studying Documentation:** To understand the implications of **GDPR, CCPA, and data residency laws**. See what precautions need to be taken that user data be isolated and stored.
   - **Prototyping:** Review the formal documentation for **GDPR, CCPA, and copyright laws** to ensure the system's design and functionality are in full compliance.
   - **Risk Analysis:** The document mentions that some use cases have a "high risk". Perform a risk analysis for a failure to comply with these regulations. For example, a risk could be a large fine due to a data breach. This will help you define security and compliance requirements to mitigate these risks and avoid legal repercussions.

---
