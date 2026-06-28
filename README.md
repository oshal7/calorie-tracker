# Calorie Tracker

A personal calorie tracker for Indian/Bangalore-context eating: log meals by typing or speaking a free-text description (e.g. "2 idlis with sambar and filter coffee"), and Claude extracts the food items and estimated calories. Set a weight goal and the app computes a daily calorie budget (Mifflin-St Jeor BMR/TDEE) and tracks consumption against it.

## Structure

- `mobile/` — Expo (React Native) app. Local-only storage (AsyncStorage), on-device speech-to-text (`expo-speech-recognition`).
- `backend/` — Cloudflare Worker. The only place the Anthropic API key lives. Receives `{ text, mealType }`, calls Claude Haiku 4.5 with a structured JSON schema, returns parsed calories.
- `.github/workflows/build-apk.yml` — builds an Android APK entirely in CI (no Android Studio required).

## Why a backend at all?

The Anthropic API key can never be embedded in a distributed APK — it's trivially extractable by decompiling the app. The Worker is a thin proxy: it holds the real API key and is protected by a shared-secret bearer token that the app sends. That secret is also embedded in the APK, but the worst case if it leaks is someone burns your Claude API quota on this one endpoint — not a compromised Anthropic account.

## Backend setup (Cloudflare Worker)

```bash
cd backend
npm install
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put APP_SHARED_SECRET   # any long random string you choose
npx wrangler deploy
```

`npx wrangler dev` for local testing — copy `.dev.vars.example` to `.dev.vars` first and fill in real values (this file is gitignored).

## Mobile app setup

```bash
cd mobile
npm install
cp .env.example .env   # fill in EXPO_PUBLIC_API_BASE_URL (your deployed Worker URL) and EXPO_PUBLIC_APP_SHARED_SECRET (must match the backend secret)
npx expo start
```

Run on a physical device via Expo Go for quick iteration, but note `expo-speech-recognition` requires a custom dev client or a full prebuild — Expo Go does not support it. Use `npx expo run:android` for a local dev build with speech recognition working, or just rely on the CI-built APK below.

## Building the APK via GitHub Actions

The workflow at `.github/workflows/build-apk.yml` runs on every push to `main` that touches `mobile/**`, or manually via the Actions tab ("Run workflow").

Before the first run, add these repository secrets (Settings → Secrets and variables → Actions):

- `EXPO_PUBLIC_API_BASE_URL` — your deployed Worker URL
- `EXPO_PUBLIC_APP_SHARED_SECRET` — must match `APP_SHARED_SECRET` set on the backend

Without these, the workflow still produces an installable APK — Expo's default Android template signs release builds with the bundled debug keystore, so the artifact (`calorie-tracker-debug-signed`) can be sideloaded as-is. Add these secrets only if you want it signed with your own release key instead:

- `ANDROID_KEYSTORE_BASE64` — output of `base64 -w0 your-release.keystore`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Generate a keystore once with: `keytool -genkeypair -v -keystore release.keystore -alias calorie-tracker -keyalg RSA -keysize 2048 -validity 10000`

The build artifact (`calorie-tracker-signed` or `calorie-tracker-debug-signed`) appears on the workflow run's summary page — download the APK from there and sideload it (enable "Install unknown apps" for your file manager/browser on Android).

## How calorie estimation works

The backend system prompt anchors Claude's estimates to standard Indian nutrition references (IFCT 2017-style values) for common dishes, and flags `confidence: "low"` when portion sizes are ambiguous so the app can surface that uncertainty instead of presenting a falsely precise number.

## Daily budget

Calculated client-side via Mifflin-St Jeor BMR × activity multiplier, adjusted ±500/+300 kcal for lose/gain goals (see `mobile/lib/calories.ts`). No LLM call needed for this part.
