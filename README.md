# 🍲 Meal Planner – Let AI Decide What’s for Dinner!

[![Next.js](https://img.shields.io/badge/Next.js-13-black?logo=next.js)](https://nextjs.org/)[![Firebase](https://img.shields.io/badge/Firebase-Build-orange?logo=firebase)](https://firebase.google.com/) [![Twilio](https://img.shields.io/badge/Twilio-WhatsApp-green?logo=twilio)](https://www.twilio.com/whatsapp) [![Gemini AI](https://img.shields.io/badge/GenAI-Powered-blue?logo=google)](https://deepmind.google/technologies/gemini/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) [![Contributions welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg)](#-contributing) [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Adarshg315_meal-planner&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Adarshg315_meal-planner)

Tired of the *“What’s for dinner?”* debate every single day? 🥲
We got you. **Meal Planner** is here to save families, roommates, and shared apartments from the eternal chaos of meal planning.

This project uses **GenAI** to:
✅ Suggest 3 delicious meal options for lunch or dinner
✅ Let everyone vote (democracy in action, but tastier)
✅ Notify your cook and voters of the final winner 🥳
✅ Keep track of ingredients so no one screams “We’re out of onions again!” 🧅

Whether you’re feeding a family of four or managing a flat with five foodies, **Meal Planner keeps meals fair, fresh, and fun.**

---

## ✨ Why this exists

Because let’s be real…

* Families spend more time *arguing about food* than actually eating it.
* Roommates in shared apartments never agree on anything (except maybe Netflix).
* Everyone has preferences (veg, non-veg, spicy, mild, gluten-free, “just give me Maggi”).
* And cooks? They just want clarity, not 10 different WhatsApp messages.

Meal Planner solves this by bringing **structure + democracy + automation** into your kitchen.

---

## ⚡ Features

* 🍴 **AI Meal Suggestions** – Pick from 3 fresh, non-repeating recipes daily.
* 🗳 **Voting System** – Everyone gets a say (even that one picky roommate).
* 📩 **Notifications** – Automatically updates the voters *and* your cook via WhatsApp.
* 🛒 **Ingredient Tracking** – Ensures the right stuff is ready in the kitchen.
* 🧑‍🍳 **Cook Mode** – Sends the selected recipe + ingredients to the cook, no confusion.

---

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see it in action.

You can start editing by modifying `app/page.tsx`. The page auto-updates as you edit.

---

## 🔑 Environment Variables

Create a `.env` file and set these up:

```env
NEXT_PUBLIC_BASE_URL=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
COOK_WHATSAPP_TO=
WHATSAPP_RECIPIENTS=
GEMINI_API_KEY=
YOUTUBE_API_KEY=
```

👉 Make sure to grab your own Firebase, Twilio, Gemini, and YouTube API keys.
👉 WhatsApp numbers should be in the format: `whatsapp:+91782*****34`.

---

## 🤝 Contributing

This is a **hobby project** turned into a potential lifesaver for families and roommates.
If you:

* Love food 🍕
* Hate repetitive meals 🥲
* Are into Next.js, Firebase, Twilio, or GenAI 🤖
* Or just want to make life easier for cooks 👩‍🍳

…then **come join me!** Fork this repo, open PRs, share recipes, improve the AI prompts, or even just fix typos in the README.

[![GitHub forks](https://img.shields.io/github/forks/your-username/meal-planner?style=social)](https://github.com/your-username/meal-planner/fork)
[![GitHub stars](https://img.shields.io/github/stars/your-username/meal-planner?style=social)](https://github.com/your-username/meal-planner/stargazers)

---

## 📚 Learn More

* [Next.js Documentation](https://nextjs.org/docs)
* [Learn Next.js](https://nextjs.org/learn)
* [Firebase Docs](https://firebase.google.com/docs)
* [Twilio WhatsApp API](https://www.twilio.com/whatsapp)

---

## 🚢 Deploy

Easiest way: deploy to [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app).

---

## 📸 Screenshots / Demo

👉 *(Add screenshots or a demo GIF of the meal voting & WhatsApp notification here!)*

---

## 🥳 Closing Note

Stop fighting over food.
Start voting.
Let **Meal Planner** be the hero your kitchen deserves.

“Because democracy works better with biryani.” 🍛✨
