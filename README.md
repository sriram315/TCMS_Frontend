
# 📘 TCMS-JIRA Integration

> A seamless integration to sync issues between TCMS (Test Case Management System) and JIRA Cloud.

---

## 📌 Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)

---

## 📖 About the Project

This project connects TCMS with JIRA Cloud, allowing issue synchronization and automated updates from TCMS to JIRA.

---

## 🛠 Tech Stack

- Node.js
- Express.js
- Ngrok
- JIRA Cloud API

---

## ✅ Prerequisites

Before starting the project, follow these setup steps:

```bash
1. Create a JIRA account
2. Generate a JIRA API Token
   - Go to https://id.atlassian.com/manage-profile/security/api-tokens
   - Paste token in backend config file under ATLASSIAN_API_KEY
   - Configure JIRA username and domain
3. Go to JIRA Cloud > Projects > Select Project > Project Details
   - Copy Project name and key
   - Paste in TCMS backend config
4. Run backend server on port 3000
   - npm start
5. Install and configure ngrok
   - ngrok config add-authtoken <your-auth-token>
   - ngrok http 3000
   - Copy forwarding URL and update localBaseUrl in TCMS backend config
6. Upload App to JIRA Cloud
   - Copy deployed app's JSON URL
   - Go to Apps > Manage Apps > Settings > Enable Dev Mode > Upload App
7. Generate and apply TCMS token in JIRA Cloud > TCMS Configuration
8. Create issue in TCMS > it should reflect in JIRA
```

---

## 🚀 Installation

```bash
git clone https://github.com/your-username/tcms-jira-integration.git
cd tcms-jira-integration
npm install
npm start
```

---

## ⚙️ Environment Variables

Create a `.env` file and include:

```env
ATLASSIAN_API_KEY=your_api_token
ATLASSIAN_EMAIL=your_email
ATLASSIAN_DOMAIN=your_domain
PROJECT_KEY=your_project_key
PROJECT_NAME=your_project_name
TCMS_BASE_URL=http://localhost:3000
```

---

## 💻 Usage

```bash
1. Start backend: npm start
2. Start ngrok: ngrok http 3000
3. Copy ngrok URL to config
4. Upload app in JIRA using JSON URL
5. Generate TCMS token and apply
```



