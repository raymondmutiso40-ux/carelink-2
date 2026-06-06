# CareLink Pro — Deployment & Setup Guide

## What's in this project

```
carelink-pro/
├── public/
│   └── index.html          ← Main app (dashboard + chatbot + WhatsApp)
├── api/
│   ├── gemini.js           ← Gemini AI proxy (server-side key)
│   ├── send-whatsapp.js    ← WhatsApp Cloud API sender
│   └── webhook.js          ← Receives patient replies (confirm/reschedule)
├── vercel.json             ← Vercel routing config
├── package.json
└── README.md
```

---

## STEP 1 — Get Your API Keys

### A) Gemini API Key (Free)
1. Go to https://aistudio.google.com
2. Click **"Get API Key"** → **"Create API key"**
3. Copy the key (starts with `AIzaSy…`)

### B) WhatsApp Business Cloud API (Meta)
1. Go to https://developers.facebook.com
2. Create an App → Select **Business** → Add **WhatsApp** product
3. Go to **WhatsApp → API Setup**
4. You'll get:
   - **Phone Number ID** (16-digit number)
   - **Temporary Access Token** (for testing — valid 24h)
   - For production: create a **Permanent Token** via System User in Business Manager
5. Add a test phone number under "To" in the API setup panel
6. Send a test message to verify it works

---

## STEP 2 — Deploy to Vercel (Free, 2 minutes)

### Option A: Via Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Go into project folder
cd carelink-pro

# Deploy (follow prompts — select defaults)
vercel

# Add environment variables
vercel env add GEMINI_API_KEY
# paste your Gemini key

vercel env add WHATSAPP_TOKEN
# paste your WA Access Token

vercel env add WHATSAPP_PHONE_ID
# paste your WA Phone Number ID

vercel env add WEBHOOK_VERIFY_TOKEN
# make up any random string, e.g. carelink2024

# Deploy to production
vercel --prod
```

### Option B: Via GitHub + Vercel Dashboard
1. Create a GitHub repo and push this folder
2. Go to https://vercel.com → **New Project** → Import your repo
3. In **Environment Variables**, add:
   - `GEMINI_API_KEY` = your Gemini key
   - `WHATSAPP_TOKEN` = your WA token
   - `WHATSAPP_PHONE_ID` = your WA phone number ID
   - `WEBHOOK_VERIFY_TOKEN` = any random string
4. Click **Deploy**

Your URL will be: `https://carelink-pro-[yourname].vercel.app`

---

## STEP 3 — Set Up WhatsApp Webhook (For Receiving Replies)

1. In Meta Developer Console → WhatsApp → Configuration
2. Set **Webhook URL**: `https://your-vercel-url.vercel.app/api/webhook`
3. Set **Verify Token**: same as your `WEBHOOK_VERIFY_TOKEN` env variable
4. Subscribe to **messages** webhook field
5. Click **Verify and Save**

Now when patients reply CONFIRM or RESCHEDULE, CareLink auto-responds!

---

## STEP 4 — Use the App

1. Open your Vercel URL
2. In the sidebar, paste:
   - Gemini API Key
   - WhatsApp Phone Number ID
   - WhatsApp Access Token
3. Click **Run AI Triage** — Gemini scores every patient
4. Click **Send via WhatsApp** on any patient
5. Real message lands on the patient's phone ✓

---

## WhatsApp Sandbox vs Production

- **Testing**: Meta gives you a sandbox number. You can message up to 5 test numbers.
- **Production**: Submit your app for Meta review (takes 1-3 days). Required for messaging any number.
- For the hackathon demo: sandbox is enough — judges can see real WA delivery.

---

## Features Built
- ✅ Gemini 2.0 Flash AI triage (risk score + multilingual reminders)
- ✅ Real WhatsApp Business Cloud API sending
- ✅ Patient auto-reply handling (CONFIRM/RESCHEDULE)
- ✅ Multilingual messages (English, Swahili, Kikuyu, Luo, Kamba)
- ✅ AI chatbot assistant (powered by Gemini)
- ✅ Live analytics dashboard
- ✅ Add patients with phone numbers
- ✅ Bulk send all reminders
- ✅ Vercel serverless deployment
