# YatraAI Scout Pro — Frontend

> AI-powered travel intelligence platform for Indian heritage exploration. Built with React 18, Vite, Firebase, and Groq AI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| Auth & DB | Firebase Authentication + Firestore |
| AI Chat | Groq API (llama-3.1-8b-instant) |
| Maps | Leaflet + OpenStreetMap + OSRM |
| Weather | Open-Meteo API (free, no key needed) |
| UI | shadcn/ui + Material UI Icons + Framer Motion |
| Languages | 7 Indian languages via LanguageContext |

---

## Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org)
- **npm** v9 or higher (comes with Node)
- A **Firebase project** with Email/Password auth and Firestore enabled
- A **Groq API key** — [Get one free](https://console.groq.com)

---

## 1. Clone the Repository

```bash
git clone https://github.com/AI-Mercenary/yatra-ai.git
cd yatra-ai/yatraai-scout-main
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in `yatraai-scout-main/`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
VITE_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"

# AI Configuration
VITE_GROQ_API_KEY="gsk_your_groq_key_here"
```

---

## 4. Firebase Setup (One-time)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project or open your existing one
3. Go to **Authentication → Sign-in method** → Enable **Email/Password**
4. Go to **Firestore Database** → Create database (start in test mode)
5. Under **Project Settings → General**, copy your web app config into `.env`

---

## 5. Run the Development Server

```bash
npm run dev
```

The app will be available at:
```
http://localhost:8080
```

> **Note:** The ML Landmark Identification feature requires the backend server running separately on port 5001. See the backend README.

---

## 6. Create Your First Account

- Visit `http://localhost:8080/signup`
- Register with your email and password
- Firebase creates the account — **do not use** any previous Supabase credentials

---

## Application Structure

```
src/
├── contexts/
│   ├── AuthContext.tsx       # Firebase auth state
│   ├── ThemeContext.tsx      # Dark/Light mode
│   └── LanguageContext.tsx   # 7 Indian languages
├── pages/
│   ├── DashboardHome.tsx     # Main dashboard
│   ├── LandmarkPage.tsx      # AI landmark scanner
│   ├── MapPage.tsx           # Map + routing + hotels
│   ├── ScoutAIPage.tsx       # AI chatbot (Groq)
│   ├── WeatherPage.tsx       # 7-day forecast
│   ├── BudgetPage.tsx        # Expense tracker (Firestore)
│   ├── BuddyPage.tsx         # AI travel matching
│   ├── HotelBookingPage.tsx  # Heritage hotel browser
│   └── ProfilePage.tsx       # User profile manager
└── components/
    ├── AppSidebar.tsx        # Collapsible nav sidebar
    ├── TopBar.tsx            # Language switcher + theme
    └── HotelCard.tsx         # Hotel card + booking modal
```

---

## Features Overview

| Feature | Technology | API Required |
|---|---|---|
| Landmark ID | TensorFlow (backend) | Backend on port 5001 |
| Scout AI Chat | Groq llama-3.1-8b | `VITE_GROQ_API_KEY` |
| Travel Buddy Match | Groq llama-3.1-8b | `VITE_GROQ_API_KEY` |
| Map + Routing | OSRM + OSM | None (free) |
| Weather | Open-Meteo | None (free) |
| Budget Tracker | Firestore | Firebase config |
| Hotel Booking | Static (dummy) | None |
| Multilingual UI | LanguageContext | None |

---

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## Supported Languages

The UI is fully translated into:

- English
- हिन्दी (Hindi)
- తెలుగు (Telugu)
- தமிழ் (Tamil)
- ಕನ್ನಡ (Kannada)
- বাংলা (Bengali)
- मराठी (Marathi)

Switch language from the **top navigation bar** → language dropdown.

---

## Common Issues

| Problem | Fix |
|---|---|
| `auth/invalid-credential` | Sign up first — old Supabase accounts won't work |
| Landmark ID fails | Make sure backend is running on port 5001 |
| Map doesn't load | Check browser allows location access |
| Groq not responding | Verify `VITE_GROQ_API_KEY` is set in `.env` |
| Voice not working | Chrome/Edge required for Web Speech API |

---

## License

MIT © YatraAI Team
