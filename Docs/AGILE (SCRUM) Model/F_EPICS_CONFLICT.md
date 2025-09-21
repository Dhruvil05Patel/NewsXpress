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

# Task F: Conflicts Between EPICs  

In large software projects, different epics often overlap in scope or dependencies. For our project, the following conflicts have been identified:  

---

##  Conflict 1: Epic 1 (Content Aggregation) ↔ Epic 2 (Core News Consumption Experience)  

### Conflict Summary  
Epic 2 (UI/UX for Surfers) relies directly on the availability of aggregated and validated news data from Epic 1.  
If Epic 1 fails to deliver complete and structured data, Epic 2 will not have meaningful content to display.  

### Resolution  
- Implement a **minimal but stable pipeline** in Epic 1 before UI testing begins.  
- Use **mock data** to allow Epic 2’s development in parallel until Epic 1 matures.  

---

##  Conflict 2: Epic 1 (Content Aggregation) ↔ Epic 4 (Personalization & Engagement Engine)  

### Conflict Summary  
Epic 4 needs structured and categorized news from Epic 1 to generate personalized feeds and notifications.  
If Epic 1’s pipeline is unstable or inconsistent, personalization logic will break or show irrelevant results.  

### Resolution  
- Ensure Epic 1 delivers **reliable metadata (categories, tags, timestamps)** before Epic 4 development.  
- Align delivery milestones so Epic 4 starts **only after validated data is available**.  

---

##  Conflict 3: Epic 3 (User Accounts & Authentication) ↔ Epic 4 (Personalization & Engagement Engine)  

### Conflict Summary  
Personalization features (Epic 4) require user identity and stored preferences, which can only exist after Epic 3 is implemented.  
Without authentication, personalization has no basis.  

### Resolution  
- Complete **account creation, login, and preference storage** in Epic 3 first.  
- Defer personalization testing until Epic 3 is stable.  

---

##  Conflict 4: Epic 2 (Core News Experience) ↔ Epic 5 (Enhanced UX & Accessibility)  

### Conflict Summary  
Epic 5 builds on Epic 2’s user interface by adding accessibility and engagement features (translation, text-to-speech, bookmarking).  
If the base UI in Epic 2 is incomplete, Epic 5 cannot be integrated effectively.  

### Resolution  
- Deliver a **functional and stable version of Epic 2** before introducing Epic 5 features.  
- Roll out accessibility incrementally after the core interface is finalized.  

---

##  Conflict 5: Cross-Epic Resource & Dependency Conflicts  

### Conflict Summary  
Backend-heavy epics (1, 3, 4) and frontend-heavy epics (2, 5) may require the same developers at the same time, causing bottlenecks and sprint delays.  

### Resolution  
- **Role separation**: Assign backend team to Epics 1, 3, 4 and frontend team to Epics 2, 5.  
- **Sprint alignment**: Adjust backlog to minimize overlap and ensure smooth workflow across teams.  

---

#  Final Note  
Most conflicts in this project are **dependency-based** (one epic requiring completion of another). By carefully sequencing the work and aligning backend vs. frontend efforts, these conflicts can be minimized, ensuring smoother sprint execution.
