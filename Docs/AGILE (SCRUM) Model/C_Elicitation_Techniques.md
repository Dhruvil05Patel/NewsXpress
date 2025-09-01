<div align="center">
  <img src="https://www.daiict.ac.in/sites/default/files/inline-images/20250107DAUfinalIDcol_SK-01_0.png" alt="University Logo" width="300">
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

# Task C: Apply elicitation techniques to gather the requirements (functional, non-functional and domain requirements).

## Functional Requirements

### User Authentication

- **Interviews:** This is the most effective way to understand user preferences for login methods (e.g., social login, email/password, biometric) and security concerns. You can ask direct questions about their experiences with authentication on other apps.
- **Questionnaires:** Use a survey to gather data on a large scale. You can ask closed-ended questions like "Do you prefer a password-based or social media-based login?" to quickly gather quantitative data from many potential users.
- **Prototyping:** Create mock-ups of the sign-up and login screens to get immediate feedback from users on the design and flow. This helps you see if the process is intuitive and user-friendly.

### Personalized News Feed

- **Ethnography:** Define scenarios for how users interact with the feed. For example, a scenario could be "User scrolls through the feed and clicks on a post about technology". This helps you model how the AI will track user behavior and update the feed.
- **Brainstorming:** Engage a diverse group of stakeholders, including domain experts and data scientists, in a brainstorming session to generate ideas for new algorithms or features for personalization. 

### Multi-Source Aggregation

- **Studying Documentation:** Analyze existing news APIs and documentation from various publishers. This technique helps you understand the technical requirements for integrating data from different sources, including data formats in JSON.

### AI-Generated Summaries

- **Interviews:** Interview users to understand their specific needs for summaries. For example, do they want a short summary, or one that focuses on a specific aspect of the article?
- **Prototyping:** Create prototypes that show different types of summaries (e.g., extractive vs. abstractive). Allow users to compare them and provide feedback on readability and accuracy.
- **Questionnaires:** Use questionnaires to ask a large group of users about their preferences for summary length and style. This can help you set the default settings for the AI model.

### Save/Share/Bookmark

- **Prototyping:** Design mock-ups for how users will save, share, and bookmark articles. Test these prototypes with users to ensure the process is intuitive and easy to use.
- **Ethnography:** Observe users to understand their motivation for saving or sharing content to understand the value of these features.

### Push Notifications

- **Questionnaires:** Use a questionnaire to determine user preferences for notification frequency and content. This allows you to collect data on a wide scale to inform your strategy for when and how often to send notifications.
- **Prototyping:** Create a prototype of the opt-in process for push notifications to ensure it is clear and persuasive.

### Multi-Lingual News Support & Text-to-Speech

- **Interviews:** Interview users from different regions to understand their language preferences for news content and app navigation. You should also interview potential users with reading difficulties to understand their specific needs for text-to-speech functionality.
- **Questionnaires:** Use surveys to gather data from a large number of users across different languages to find out which languages are most in demand.
- **Prototyping:** Develop a prototype that demonstrates how the app will handle different languages and the text-to-speech function. This allows users to test the feature and provide feedback on the voice quality, speed, and overall user experience

---

## Non-Functional Requirements

### High Availability & Scalability for Global Users

- **Interviews:** You need to interview technical stakeholders, such as developers and system architects, to understand what is required to achieve high availability and scalability. Ask about expected usage patterns and peak traffic of a highly available system.
- **Risk Analysis:** Some use cases have a high risk because their implementation is problematic. You can use risk analysis to identify potential failure points for high availability and scalability, such as a single server failure or a massive influx of users. This helps to prioritize and define specific requirements to mitigate those risks.
- **Studying Documentation:** Analyze existing documentation on cloud infrastructure, server uptime standards, and service level agreements (SLAs) to set a benchmark for your system's availability.

### Fast Response of User Data

- **Interviews:** Interview users and product managers to define what "fast" means to them. Ask specific questions about their expectations for response time and how much data will flow through the system.
- **Questionnaires:** To gather quantitative data on what response time users expect, or how often they would send or receive data. This is an effective way to define performance metrics for a large user base.
- **Studying Documentation:**  Create a prototype with different loading speeds to see what response time users find acceptable. This technique helps to get more precise feedback response time.
 
### Secure Handling of User Data

- **Interviews:** Ask questions about controlling access to the system and isolating user data.
- **Misuse Cases:** In data leak, phishing attacks the data might get stolen by some unkown entity, to prevent that ensure users a safe environment while using this app.

### Accuracy in Multi-Lingual Support

- **Interviews:** Interview a diverse group of users from different language backgrounds to understand their expectations for translation and content quality. You should ask about their preferences for tone, dialect, and how they define "accurate".
- **Questionnaires:** Use surveys to determine the most in-demand languages among your user base. You can also ask about what level of translation accuracy they would find acceptable.
- **Prototyping:** Develop a low-fidelity prototype that demonstrates how multi-lingual support will look and feel, and then have users from different language groups review it. This helps to identify any cultural or linguistic issues early on.

---

## Domain Requirements

### Content Quality & Moderation

- **Interviews:** To understand user preferences for login methods (e.g., social login, email/password, biometric) and security concerns. Ask direct questions about their experiences with authentication on other apps.
- **Studying Documentation:** Analyze the content guidelines, style guides, and documentation of various news publishers. This helps you understand their standards for content, which is crucial for identifying and filtering out inappropriate or low-quality articles.
- **Brainstorming:** Develop creative solutions for detecting duplicate articles, ensuring factual consistency, and moderating content. This is useful when the "news is uncertain" and innovation is important.
  
### Accessibility Standards

- **Studying Documentation:** The requirement explicitly mentions **WCAG 2.1 guidelines**. Analyze this documentation to understand the specific rules for screen reader support, contrast ratios, and other accessibility standards.
- **Interviews:** Interview potential end-users with disabilities to understand their specific needs and challenges with news consumption. Also interview accessibility specialists to ensure compliance with the WCAG guidelines.
- **Prototyping:** Create a prototype that supports a text-to-speech and other accessibility features. Have users test this prototype to get direct feedback on the usability of the text-to-speech function and overall app accessibility.

### Regulatory & Compliance Requirements

- **Studying Documentation:** To understand the implications of **GDPR, CCPA, and data residency laws**. See what precautions need to be taken that user data be isolated and stored.
- **Prototyping:** Review the formal documentation for **GDPR, CCPA, and copyright laws** to ensure the system's design and functionality are in full compliance.
- **Risk Analysis:** The document mentions that some use cases have a "high risk". Perform a risk analysis for a failure to comply with these regulations. For example, a risk could be a large fine due to a data breach. This will help you define security and compliance requirements to mitigate these risks and avoid legal repercussions.

---
