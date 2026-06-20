# Flowtech AI Flow Sizing Calculator — Desktop App Build Guide

## Option 1: Quick Start (No Build Required)

The `Flowtech-AI-Flow-Sizing-Standalone.zip` file contains the complete app.

1. Extract the zip file anywhere on your computer
2. Double-click `index.html` to open in any web browser
3. The app runs entirely offline — no internet connection needed

## Option 2: Full Desktop App (Electron)

To build a true Windows `.exe` / Mac `.app` / Linux AppImage:

### Prerequisites
- Node.js 22+ (download from https://nodejs.org)
- npm (comes with Node.js)

### Step 1: Get the Source
Copy the entire `app/` folder to your local machine.

### Step 2: Install Dependencies
```bash
cd app
npm install
```

### Step 3: Build the Desktop App

**For Windows (.exe installer):**
```bash
npm run dist -- --win
```
Output: `release/Flowtech AI Flow Sizing Calculator Setup.exe`

**For Mac (.dmg):**
```bash
npm run dist -- --mac
```
Output: `release/Flowtech AI Flow Sizing Calculator.dmg`

**For Linux (AppImage):**
```bash
npm run dist -- --linux
```
Output: `release/Flowtech AI Flow Sizing Calculator.AppImage`

**For all platforms at once:**
```bash
npm run dist
```

### What's Included in the Desktop App
- Runs as a standalone window (no browser needed)
- Works fully offline — all 306 fluids, all sizing tables built-in
- PDF export for sizing reports
- AI MOC Recommendation per product
- Temperature-viscosity correction with warnings
- No internet connection required after installation

### Project Structure
```
app/
├── electron/
│   └── main.cjs          ← Electron main process (entry point)
├── dist/                  ← Built web app (auto-generated)
├── src/
│   ├── data/              ← Factory tables, fluid database, MOC engine
│   ├── components/        ← UI components
│   ├── hooks/             ← Calculator logic
│   └── App.tsx            ← Main app
├── package.json           ← Build scripts & Electron config
└── vite.config.ts
```
