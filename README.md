# HERVERSE — MERN Stack

A women's health tracking app: period tracking, LUNA (AI assistant powered by Groq), diet planning,
health tracking, a symptom checker, emergency contacts, and reminders.

## Project structure

```
herverse-mern/
├── backend/           Express + MongoDB API
│   ├── config/         DB connection
│   ├── models/         Mongoose schemas (User, PeriodLog, HealthLog, FoodLog, Reminder, EmergencyContact)
│   ├── controllers/     Route logic
│   ├── routes/          Express routers
│   ├── middleware/      Auth + error handling
│   ├── data/             Shared datasets (symptom library, care directory, food database)
│   ├── utils/            JWT + Groq API client
│   ├── .env               <-- your MongoDB URI is already here; paste your Groq key in
│   └── server.js
│
└── frontend/          React (Vite) app
    ├── src/
    │   ├── api/             axios client
    │   ├── context/         AuthContext (login/session state)
    │   ├── components/      One folder per feature (auth, period, luna, diet, health, doctors, emergency, settings...)
    │   └── styles/theme.css  Feminine color palette + shared component styles
    └── .env                 <-- points to the backend URL
```

Each feature is deliberately split into its own model + controller + route (backend) and its own
component (frontend), so you can change or extend any single feature without touching the others.

---

## 1. Prerequisites

- **Node.js** 18+ and npm — check with `node -v`
- A **MongoDB Atlas** cluster (you already have one — the connection string is in `backend/.env`)
- A **Groq API key** — get one free at https://console.groq.com/keys

## 2. Backend setup

```bash
cd backend
npm install
```

Open `backend/.env` and paste your Groq key into the empty `GROQ_API_KEY=` line:

```
GROQ_API_KEY=gsk_your_key_here
```

Your MongoDB URI is already filled in. **Important:** since that connection string was shared in
plain text, rotate the password in MongoDB Atlas (Database Access → edit user → new password) once
you're done testing, and update `MONGODB_URI` in `.env` if you do.

Start the server:

```bash
npm run dev
```

You should see:
```
MongoDB connected: ac-p6cwvbz-shard-00-...
HERVERSE API running on port 5000
```

Test it's alive: open http://localhost:5000/api/health-check in a browser — you should see `{"status":"ok"}`.

## 3. Frontend setup

Open a **second terminal** (leave the backend running):

```bash
cd frontend
npm install
npm run dev
```

Vite will print a local URL, usually **http://localhost:5173**. Open that in your browser.

`frontend/.env` already points to `http://localhost:5000/api` — no changes needed unless you deploy
the backend elsewhere.

## 4. Using the app

1. Go to `/` → **Get started** → sign up with a name, phone number, and password (consent checkbox is required)
2. Pick a subscription plan → complete your profile
3. You land on the dashboard. Try:
   - **Period tracker** — add a period start date, see cycle predictions
   - **AI assistant (LUNA)** — chat; if `GROQ_API_KEY` is blank or invalid, LUNA automatically falls
     back to the built-in rule-based responses so the feature still works
   - **Health tracker** — log sleep/steps/water/weight; the top stat bar and health score update live
   - **Diet planner** — generate an AI plan by diet type + goal, log food you ate
   - **Doctors & hospitals** — run the symptom checker
   - **Emergency** — add/remove emergency contacts

## 5. How LUNA + Groq fits together

`backend/utils/groqClient.js` calls Groq's OpenAI-compatible endpoint
(`https://api.groq.com/openai/v1/chat/completions`) with a system prompt that keeps LUNA in
"suggest, never diagnose or prescribe" mode. `backend/controllers/lunaController.js` also cross-checks
the message against the local symptom library (`backend/data/symptomLibrary.js`) so replies stay
consistent with the rest of the app, and falls back to a rule-based reply if Groq isn't reachable
(e.g. key not set yet, or a network hiccup) — so the chat never just breaks.

To change the model, edit `GROQ_MODEL` in `backend/.env` (see https://console.groq.com/docs/models
for available model names).

## 6. Extending a feature

Because each feature has its own model/controller/route/component, adding something new usually
touches only 2–3 files. Example — adding a "mood" field to health tracking:

1. Add `mood: String` to `backend/models/HealthLog.js`
2. Add a `logMood` function to `backend/controllers/healthController.js` + a route in `healthRoutes.js`
3. Add the UI bit to `frontend/src/components/health/HealthTracker.jsx`

## 7. Common issues

- **"MongoDB connection error"** — double check `MONGODB_URI` in `backend/.env`, and that your IP is
  allowed in MongoDB Atlas → Network Access (add `0.0.0.0/0` for testing, or your specific IP).
- **CORS errors in the browser console** — make sure `CLIENT_ORIGIN` in `backend/.env` matches the
  exact URL Vite is running on (default `http://localhost:5173`).
- **LUNA replies with the fallback message every time** — check `GROQ_API_KEY` is set correctly and
  that you haven't hit a Groq rate limit; check the backend terminal for the actual error.
- **401 errors on every request** — your login session expired or `JWT_SECRET` changed; log out and
  back in.

## 8. Security reminders

- `.env` files are already in `.gitignore` for both frontend and backend — never commit them.
- Rotate your MongoDB password (it was shared in this chat) and never paste API keys/passwords into
  a chat again — set them directly in your local `.env` files instead.
- Before deploying anywhere public, change `JWT_SECRET` in `backend/.env` to a long random string.
