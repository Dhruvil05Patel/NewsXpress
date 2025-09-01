<!-- 
  =====================================================================
  INSTRUCTIONS:
  1. Replace "https://placehold.co/150x150/F0F0F0/333?text=Your+Logo" 
     with the direct URL of your university's logo.
  2. You can adjust the width="150" to resize the logo as needed.
  =====================================================================
-->
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
2.a) If sources are unavailable show cached news.

#### Exceptions
1.a) No internet error message.

---

## UC2: Read the Whole Article

### Front of the Card
> As a Surfer I clicked on the News Article Link because I want to read the whole article.

### Back of the Card
- **Preconditions:** User Clicks on the News Article Link.
- **Postconditions:** Actual News Article displayed to the surfer.
- **Primary Actor:** Surfer
- **Secondary Actor:** system, News Source

#### Main Flow
3.a) Surfer clicks on the news Article Link.
3.b) Surfer Reaches to the page where the Actual News is.

#### Exceptions
3.a.1) No internet error message.

---

## UC3: Register/Login

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
1.a) Invalid credentials error message.

---

## UC4: Manage Account

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
1.a) Invalid Information error message.

---

## UC5: Read AI-generated Summaries

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