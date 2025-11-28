# 📰 NewsXpress - AI Powered News Aggregator

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-v18%2B-green.svg)
![React](https://img.shields.io/badge/react-v18-blue.svg)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)

**NewsXpress** is an AI-powered, personalized news aggregation platform designed to deliver real-time, summarized news content tailored to user preferences. It combines advanced machine learning for recommendations with a robust, microservices-inspired backend architecture.

---

## 🚀 Key Features

* **🤖 AI Summarization:** Automatically condenses long articles into concise summaries using Groq SDK.
* **🌍 Multi-Language Support:** Real-time translation of news content into multiple languages.
* **🗣️ Text-to-Speech (TTS):** Listen to news summaries on the go with integrated audio playback.
* **🧠 Smart Recommendations:** Hybrid ML system (Content-based + Collaborative filtering) suggests articles based on reading history and time spent.
* **📱 Responsive UI:** Modern, mobile-first interface built with React and Tailwind CSS.
* **🔒 Secure Authentication:** Robust user management using Firebase Auth synced with a PostgreSQL database.
* **🔖 Bookmarks & Notes:** Save articles for later and add personal notes to them.

---

## 🛠️ Tech Stack

### **Backend**
* **Runtime:** Node.js & Express.js
* **Database:** PostgreSQL (hosted on Supabase)
* **ORM:** Sequelize
* **Testing:** Jest (100% Code Coverage)
* **External APIs:** SerpAPI (News), Groq (AI), Google Cloud (Translate/TTS)

### **Frontend**
* **Framework:** React (Vite)
* **Styling:** Tailwind CSS
* **Testing:** Vitest & React Testing Library
* **Icons:** Lucide React

### **Machine Learning**
* **Language:** Python (Flask API)
* **Libraries:** Scikit-learn, Pandas, NumPy
* **Models:** TF-IDF Vectorization, Cosine Similarity

---

## 📂 Project Structure

```plaintext
NewsXpress/
├── backend/                # Express.js Server & API
│   ├── config/             # Database & App Configuration
│   ├── models/             # Sequelize Database Models
│   ├── services/           # Business Logic (100% Unit Tested)
│   ├── controllers/        # API Route Controllers
│   ├── Ml_model/           # Python ML Recommendation Engine
│   └── ...
├── frontend/               # React Client Application
│   ├── src/components/     # UI Components
│   ├── src/contexts/       # Context API (Auth, State)
│   ├── src/hooks/          # Custom React Hooks
│   └── ...
├── testing/                # QA Documentation
│   ├── 1_Unit_Testing/     # Coverage Reports & Logs
│   ├── 2_System_Testing/   # Postman API Test Plans
│   └── 3_GUI_Testing/      # UI Test Cases & Bug Logs
└── README.md
```

---
### Contributors

This project exists thanks to all the people who contribute.  
<a href="https://github.com/Dhruvil05Patel/NewsXpress/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Dhruvil05Patel/NewsXpress" />
</a>

