# ⚡ AxionDrive — Car Analytics AI Query Engine

> Ask questions about cars in plain English and get instant AI-powered answers with charts, maps, and dashboards.

---

## 🚀 Features

- 🔍 Natural language queries (e.g. *"most expensive car?"*)
- 📊 Interactive dashboard with KPI strips and doughnut charts
- 🗺️ India map integration with Leaflet.js
- 📧 Send email reports as HTML attachments
- 📥 Download results as CSV
- ⚡ Powered by Groq + Llama 3.3 AI

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| **n8n (local)** | Workflow automation — connects all tools together |
| **Google Sheets** | Data storage — stores all car data |
| **Groq + Llama 3.3** | AI engine — understands your questions |
| **React + TypeScript** | Frontend dashboard |

---

## 📋 Requirements

Before starting, make sure you have:
- A Windows PC
- A free [GitHub account](https://github.com)
- A free [Groq account](https://console.groq.com)
- A Google account (for Sheets + Gmail)

---

## ⚙️ Installation Guide

### Step 1 — Install Node.js

Node.js is required to run both n8n and the React website.

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** version (the big green button)
3. Run the installer — click Next → Next → Install
4. Open Command Prompt (`Win + R` → type `cmd` → Enter) and verify:

```bash
node --version   # should show v20.x.x
npm --version    # should show 10.x.x
```

---

### Step 2 — Install n8n

n8n is the automation engine that powers AxionDrive's AI workflows.

```bash
npm install -g n8n
```

> ⚠️ If you get an "Access Denied" error, close CMD and reopen it by right-clicking → **Run as Administrator**

Verify it installed:
```bash
n8n --version
```

---

### Step 3 — Install Git

Git lets you download and manage this project.

1. Go to [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Run the installer — just keep clicking **Next** (all defaults are fine)
3. Open a **new** Command Prompt and verify:

```bash
git --version   # should show git version 2.x.x
```

---

### Step 4 — Download This Project

Open Command Prompt, navigate to the folder where you want to save it, then run:

```bash
git clone https://github.com/tanishqwadhwa25/AxionDrive.git
cd AxionDrive
```

---

### Step 5 — Install Project Dependencies

Inside the `AxionDrive` folder, run:

```bash
npm install
```

> 💡 This only needs to be done once. It takes 1–3 minutes and installs all required packages.

---

## 🔄 n8n Workflow Setup

### Import the Workflows

1. Start n8n by opening Command Prompt and running:
   ```bash
   n8n start
   ```
2. Open [http://localhost:5678](http://localhost:5678) in your browser
3. Create a free account (first time only)
4. Click **Workflows** in the left sidebar
5. Click the **⋯ menu** (top right) → **Import from File**
6. Import both files from the `n8n/` folder inside the project:
   - `n8n-data-cleaning-workflow.json`
   - `n8n-gmail-workflow.json`
7. After importing, credentials will show as red/broken — that's expected, fix them below

---

### Add Groq API Key

**Get your free API key:**
1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Click **API Keys** in the left sidebar → **Create API Key**
4. Give it any name → **Copy the key immediately** (it won't be shown again!)

**Add it to n8n:**
1. In n8n, click any Groq node in your workflow
2. In the right panel: **Credential** → **Create New**
3. Paste your API key → click **Save**
4. The node turns green ✅

---

### Add Google Sheets Credential

**Step A — Create Google OAuth credentials:**
1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Click **Select project** → **New Project** → name it `AxionDrive` → Create
3. In the search bar, search **Google Sheets API** → click it → **Enable**
4. Go to **APIs & Services** → **Credentials** → **+ Create Credentials** → **OAuth client ID**
5. If asked to configure consent screen: choose **External** → fill App name `AxionDrive` → Save
6. Application type: **Web application**
7. Under **Authorized redirect URIs**, add exactly:
   ```
   http://localhost:5678/rest/oauth2-credential/callback
   ```
8. Click **Create** → copy the **Client ID** and **Client Secret**

**Step B — Add to n8n:**
1. Click any Google Sheets node → **Credential** → **Create New** → **OAuth2**
2. Paste your Client ID and Client Secret
3. Click **Sign in with Google** → log into your Google account → Allow
4. The node turns green ✅

> ⚠️ Keep your Client Secret private — never share it or upload it to GitHub!

---

### Add Gmail Credential

1. In n8n, click the **Gmail / Send Email** node
2. Click **Credential** → **Create New** → **Gmail OAuth2**
3. Use the **same Google Cloud project** from the step above
4. In Google Cloud Console, also enable the **Gmail API** (same way as Sheets)
5. Complete the OAuth flow → the node turns green ✅

> 💡 One Google Cloud project can enable both Sheets and Gmail — no need to create two projects.

---

### Activate the Workflows

1. In each imported workflow, toggle the **Active** switch to ON (top-right, turns green)
2. Do this for both workflows

---

## ▶️ Running AxionDrive

You need **two** Command Prompt windows open at the same time:

**Window 1 — Start n8n:**
```bash
n8n start
```

**Window 2 — Start the website:**
```bash
cd path\to\AxionDrive
npm run dev
```

Then open your browser:
- 🖥️ **Dashboard:** [http://localhost:3000](http://localhost:3000)
- ⚙️ **n8n Editor:** [http://localhost:5678](http://localhost:5678)

Try typing *"most expensive car?"* in the search box — you should get an AI-powered answer!

---

## 🔑 Credentials Summary

| Service | Where to Get It | Cost |
|---------|----------------|------|
| Groq API Key | [console.groq.com](https://console.groq.com) | Free |
| Google Sheets OAuth | [console.cloud.google.com](https://console.cloud.google.com) | Free |
| Gmail OAuth | Same Google Cloud project as above | Free |

---

## 📁 Project Structure

```
AxionDrive/
├── src/                              → React + TypeScript frontend
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── n8n/
│   ├── n8n-data-cleaning-workflow.json   → Import this into n8n
│   └── n8n-gmail-workflow.json           → Import this into n8n
├── public/                           → Static assets
├── index.html
├── server.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example                      → Copy to .env and fill in your values
```

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| `'n8n' is not recognized` | Restart CMD after installing Node.js |
| Port 5678 already in use | n8n is already running — check Task Manager |
| `npm install` fails | Try: `npm install --legacy-peer-deps` |
| `git push` asks for password | Use a Personal Access Token — GitHub Settings → Developer Settings → Tokens |
| Groq nodes show red error | API key wrong or expired — regenerate at [console.groq.com](https://console.groq.com) |
| Google Sheets auth expired | Delete and re-create the Google Sheets credential in n8n |
| Website shows blank page | Check the CMD running `npm run dev` for error messages |
| n8n workflow not triggering | Make sure the workflow **Active** toggle is ON (green) |

---

## 🔗 Quick Reference — All URLs

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | AxionDrive dashboard |
| http://localhost:5678 | n8n workflow editor |
| https://console.groq.com | Manage Groq AI API key |
| https://console.cloud.google.com | Google OAuth (Sheets + Gmail) |
| https://nodejs.org | Download Node.js |
| https://git-scm.com | Download Git |

---

*Built with n8n + Groq + React ⚡*
