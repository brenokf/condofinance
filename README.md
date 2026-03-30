<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2728e832-5d84-4e1d-b41e-0ab4bd47d9c4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy [.env.example](.env.example) to [.env.local](.env.local) and fill secrets:
   - `GEMINI_API_KEY`
   - `APP_URL`
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, etc.
3. Run the app:
   `npm run dev`

> NOTE: `firebase-applet-config.json` is now ignored by git; prefer env vars (or local file with non-production keys).
