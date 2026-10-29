# HERVERSE — Run Guide

Full-stack MERN app: public homepage (no login needed) + authenticated tracker app + admin dashboard + LUNA AI assistant with token-based tiers + demo/live Razorpay payments.

## 1. Requirements
- Node.js 18+ and npm
- A MongoDB Atlas connection string (already set in `backend/.env`)

## 2. Backend setup
```
cd backend
npm install
npm run seed     # creates admin login + default pricing + token packs + sample testimonials
npm run dev       # or: npm start
```
The API runs on **http://localhost:5000**.

Your `backend/.env` already contains:
- Your 5 Groq API keys (`GROQ_API_KEYS`, comma-separated) — the app rotates across all of them automatically and skips any key that hits a rate limit or error, moving to the next. Model is set to `openai/gpt-oss-120b` (Groq deprecated `llama-3.3-70b-versatile` on Aug 16, 2026 — this was the cause of the "model does not exist" errors you saw; it's fixed now).
- Your MongoDB Atlas connection string.
- `ADMIN_PHONE` / `ADMIN_PASSWORD` — the login `npm run seed` creates for you (defaults: `9999999999` / `ChangeMe123!` if left blank — **change these** before going live).
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — your Razorpay **test mode** keys are already in there. This means checkout for Gold and Platinum now opens a real Razorpay test-mode payment widget (use Razorpay's [test card numbers](https://razorpay.com/docs/payments/payments/test-card-upi-details/) to complete a test payment — no real money moves). The Free plan never triggers payment. Swap in **live** keys only when you're ready to accept real money.

⚠️ Security note: the Groq keys you sent me were shared in a plain text file, so treat them as already exposed — rotate them in the Groq console once you're happy everything works, then just paste the new ones into `GROQ_API_KEYS`.

## 3. Frontend setup
```
cd frontend
npm install
npm run dev
```
Runs on **http://localhost:5173**. `frontend/.env` already points `VITE_API_URL` at your local backend.

## 4. Log in as admin
Go to `/auth`, log in with the phone/password from `ADMIN_PHONE` / `ADMIN_PASSWORD` (or the seed defaults), then open the **Admin Panel** link in the dashboard sidebar (or go straight to `/admin`). From there you can:
- See live stats (users by tier, revenue, AI usage)
- See Groq key rotation status + recent failures (`/admin/groq`)
- Edit subscription prices and monthly token allowance per tier, any time (`/admin/pricing`)
- Add/edit/delete buy-token packs, e.g. 8/50/100 tokens (`/admin/tokens`)
- Search users and manually adjust their tier, token balance, or promote to admin (`/admin/users`)
- Add testimonials and toggle which ones show on the public homepage (`/admin/testimonials`)
- View the payment log, demo or live (`/admin/payments`)

## 5. Standalone public pages (no login)
Every homepage section is now also its own page, so you can link/share them directly:
- `/articles` — Health Knowledge articles
- `/calculators` — BMI / water / calorie calculators
- `/luna` — LUNA AI demo (3 free questions per IP)
- `/awareness` — Women's Health Awareness Calendar
- `/faq` — FAQs + medical awareness note
- `/stories` — Full testimonials list

The navbar and footer link to these directly now instead of scrolling to a homepage anchor.

## 6. How the tiers work
| Tier | Monthly tokens | Default price |
|---|---|---|
| Free | 3 | ₹0 |
| Gold | 50 | ₹199 |
| Platinum | Unlimited | ₹499 |

Every LUNA AI message costs 1 token (except Platinum, which is unlimited). Anonymous visitors on the public homepage get **3 free questions total per IP address**, enforced on the backend (not just localStorage), before being asked to sign up.

Prices, token allowances, and token-pack sizes are all editable from the admin panel at any time — no code changes needed.

## 8. New in this update
- **Signup now requires email, address and pincode** (in addition to name, phone, password) — LUNA uses the pincode to find real nearby hospitals/doctors.
- **Change password bug fixed** — the auth middleware excludes the password hash from `req.user` for security, so the old code was comparing against `undefined`. It now re-fetches the user with the password field just for that check.
- **Forgot password via email OTP** — `/auth` → "Forgot password?" → enter email → 6-digit code emailed → enter code → set new password. Backend endpoints: `POST /api/auth/forgot-password`, `POST /api/auth/verify-otp`, `POST /api/auth/reset-password`.
- **Live hospital/doctor lookup by pincode** — no paid map API needed. Uses free OpenStreetMap services (Nominatim for geocoding, Overpass for nearby hospitals/clinics/doctors) to return 5–10 real results for *any* Indian pincode, with a graceful fallback to the old Ahmedabad-only list if the live lookup is unreachable. If you ask LUNA about something painful/urgent and haven't shared a pincode yet (and don't have one saved on your profile), she'll ask for it before recommending places.
- **SMTP email service** (`backend/utils/mailer.js`, configured via `SMTP_*` env vars in `backend/.env`):
  - Payment invoices are emailed automatically as a PDF after a successful payment.
  - Password-reset OTPs are emailed.
  - **Day-wise health reports**: Dashboard → **Reports** — pick a date, then Download PDF or Email me this report. Pulls that day's sleep/steps/water/weight, meals, and period-tracker entries into a formatted PDF (`backend/utils/pdfBuilder.js`).
- **Footer**: Login/Sign Up links removed (per request) — the "Account" column now just links to FAQs and Feedback/Stories.

### SMTP setup notes
If you ever need to change the sender account, edit these in `backend/.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password   # Gmail: 2-Step Verification -> App Passwords
SMTP_FROM=HERVERSE <your_email@gmail.com>
```
If `SMTP_USER`/`SMTP_PASS` are left blank, the app still runs fine — it just logs a warning and skips sending emails instead of crashing.

## 9. Deploying
- Backend: deploy `backend/` (e.g. Render/Railway), set the same env vars there.
- Frontend: `npm run build` in `frontend/`, deploy the `dist/` folder (e.g. Vercel), set `VITE_API_URL` to your deployed backend URL, and set `CLIENT_ORIGIN` on the backend to your deployed frontend URL.
- Set `NODE_ENV=production` on the backend in production so error responses don't leak stack traces.

