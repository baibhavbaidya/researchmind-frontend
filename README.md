# ResearchMind — Frontend

> React frontend for the ResearchMind multi-agent AI research assistant.

Live App: [https://researchmind-bb.vercel.app](https://researchmind-bb.vercel.app)  
Backend API: [https://baibhavbaidya-researchmind-backend.hf.space](https://baibhavbaidya-researchmind-backend.hf.space)

---

## Overview

ResearchMind is a production-grade AI research assistant where five specialized agents collaborate in real-time to search, verify, and synthesize answers from web sources and uploaded PDF documents.

This repository contains the React frontend — a clean, minimal dark-themed interface inspired by the design aesthetic of ChatGPT and v0.dev.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite |
| State Management | Zustand |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Authentication | Firebase (Google OAuth + Email/Password) |
| Real-time | WebSockets (native browser API) |
| Markdown Rendering | react-markdown |
| Deployment | Vercel |

---

## Features

- **Real-time agent streaming** — Watch all 5 agents work live via WebSocket
- **Unified chat interface** — Single input box handles both research queries and follow-up questions
- **Follow-up mode** — After a result appears, the same input bar switches to conversational follow-up mode automatically
- **PDF document upload** — Drag and drop PDFs, search against them with hybrid RAG
- **Per-document deletion** — Remove individual uploaded documents
- **Chat history** — Browse and re-read all past research queries
- **Firebase authentication** — Google sign-in and Email/Password with display name support
- **Profile page** — View account info, clear history, delete account
- **Responsive design** — Works on mobile and desktop
- **Minimal dark UI** — Clean aesthetic with no visual clutter

---

## Project Structure

```
frontend/
├── public/
│   └── logo.png
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatPanel.jsx       # Main chat interface, unified input bar
│   │   │   ├── Sidebar.jsx         # Document upload, nav, New Chat button
│   │   │   └── AgentPanel.jsx      # Real-time agent activity logs
│   │   ├── DarkVeil.jsx            # Animated background (WebGL)
│   │   └── OrbitAgents.jsx         # Orbiting agent visualization on landing
│   ├── pages/
│   │   ├── LandingPage.jsx         # Home page with animation
│   │   ├── ChatPage.jsx            # Main chat layout
│   │   ├── LoginPage.jsx           # Sign in / Sign up
│   │   ├── HistoryPage.jsx         # Chat history browser
│   │   └── ProfilePage.jsx         # Account settings and danger zone
│   ├── store/
│   │   └── useStore.js             # Zustand global state
│   └── utils/
│       ├── api.js                  # Axios instance + all API calls
│       └── firebase.js             # Firebase init + auth helpers
```

---

## Pages

### Landing Page (`/`)
Animated entry page with orbiting agent visualization. Shows personalized welcome message for authenticated users.

### Chat Page (`/chat`)
Main research interface with three panels:
- **Sidebar** — document upload, navigation, New Chat button
- **Chat Panel** — unified input that auto-switches between research mode and follow-up mode
- **Agent Panel** — real-time log of what each agent is doing

### History Page (`/history`)
Grid of all past research queries with answer previews. Click any card to open full answer in a modal.

### Profile Page (`/profile`)
Account info, danger zone with options to clear history or permanently delete account.

---

## Chat Input Modes

The bottom input bar has two modes that switch automatically:

| Mode | Trigger | Behavior |
|---|---|---|
| Research mode | No result yet | Sends to full 5-agent pipeline via WebSocket |
| Follow-up mode | Result exists | Fast single LLM call with context |

The placeholder text and input border change to indicate which mode is active. Click **New Chat** in the sidebar to reset back to research mode.

---

## Local Development

### Prerequisites
- Node.js 18+
- ResearchMind backend running locally on port 8000

### Setup

```bash
git clone https://github.com/baibhavbaidya/researchmind-frontend
cd researchmind-frontend
npm install
```

Create a `.env` file:
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Run:
```bash
npm run dev
```

App available at `http://localhost:5173`

---

## Build

```bash
npm run build
```

Output in `dist/` — ready for static hosting.

---

## Deployment

Deployed on **Vercel** with automatic deployments on push to `main`.

Environment variables set in Vercel project settings:
- `VITE_API_URL`
- `VITE_WS_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

---