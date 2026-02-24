# Fix it Please — Deployment Guide

## Two Distribution Channels

### 1. PWA (Progressive Web App) — Works immediately
Users visit your website → see an **"Install Fix it Please"** button → tap it → the app installs to their home screen like a native app. No app store needed.

**Setup:** Already done. Just deploy the `dist/` folder to your web host.

### 2. Google Play Store — For discoverability
Submit as an Android app so people can find it by searching the Play Store.

---

## Deploying the PWA (your website)

The app is already PWA-ready. When you deploy the built files to your domain:

```bash
npm run build
# Upload the dist/ folder to your web server
```

Users on Android Chrome will see the install banner automatically. Users on iOS Safari can tap Share → "Add to Home Screen".

> **Important:** PWA install prompts only work over HTTPS. Make sure your domain has SSL.

---

## Deploying to Google Play Store

### Prerequisites
- [Android Studio](https://developer.android.com/studio) installed on your Linux machine
- [Google Play Console](https://play.google.com/console) account ($25 one-time)

### Step 1: Open in Android Studio
```bash
cd ~/dev/tenant-toolbox-mobile
npx cap open android
```

### Step 2: Generate Signed App Bundle
1. In Android Studio: **Build → Generate Signed Bundle / APK**
2. Choose **Android App Bundle**
3. Create a new keystore (first time only)
   - ⚠️ **Save this keystore file securely** — you'll need it for ALL future updates
4. Follow the wizard to generate the `.aab` file

### Step 3: Upload to Play Console
1. Go to [play.google.com/console](https://play.google.com/console)
2. Create a new app
3. Fill in the store listing (copy from `STORE_LISTING.md`)
4. Upload the `.aab` file under **Release → Production**
5. Set content rating, privacy policy URL
6. Submit for review (usually 1-3 days)

### App Icon
The app icon is at `public/app-icon.png`. For Play Store, you can use [appicon.co](https://www.appicon.co/) to generate all the required sizes from this file.

---

## Updating the App

### PWA
```bash
npm run build
# Re-upload dist/ to your web server
```
Users get the update automatically (service worker handles it).

### Play Store
```bash
npm run build
npx cap sync android
npx cap open android
```
Then Build → Generate Signed Bundle → Upload new version to Play Console.

---

## Privacy Policy
A privacy policy page is included at `public/privacy.html`.
- Update the contact email in the file
- Host it alongside the app (it'll be at `yourdomain.com/privacy.html`)
- Use this URL when the Play Store asks for a privacy policy link
