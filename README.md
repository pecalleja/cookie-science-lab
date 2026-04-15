# Cookie Science Lab

A web application for a baking science project that compares cookies made with different types of flour. Tasters evaluate each cookie batch on three texture dimensions (crispiness, softness, chewiness) and the app generates radar charts, leaderboards, and science insights from the collected data.

## Flour Types

| Flour | Protein | Expected Texture |
|-------|---------|-----------------|
| Almond Flour | High fat, no gluten | Crumbly, delicate |
| Whole Wheat | ~14% | Dense, hearty |
| Gluten Free | Varies (blend) | Crumbly, varied spread |
| Cake Flour | 5-8% | Tender, soft |
| Bread Flour | 12-14% | Chewy, puffy |
| All Purpose | 10-12% (control) | Balanced |

## Features

- **Taste Test** - Select a flour type, enter your name, rate crispiness/softness/chewiness on sliders (1-10)
- **Results Dashboard** - Stats overview, individual radar charts per flour, leaderboard, and full ratings table
- **Compare** - Overlay radar chart of all flours, bar breakdowns per dimension, auto-generated science insights
- **Science Notebook** - Record hypothesis, observations, and conclusions with persistent storage
- **CSV Export** - Download all ratings data for use in reports or spreadsheets
- **Offline Ready** - All assets (Chart.js, fonts, images) are bundled locally; no internet required
- **iPad PWA** - Add to Home Screen on iPad for a fullscreen app-like experience

## Tech Stack

- HTML, CSS, JavaScript (no frameworks)
- [Chart.js](https://www.chartjs.org/) for radar/spider charts (bundled in `vendor/`)
- [Fredoka](https://fonts.google.com/specimen/Fredoka) + [Nunito](https://fonts.google.com/specimen/Nunito) fonts (bundled in `fonts/`)
- localStorage for data persistence

## Project Structure

```
.
├── index.html              # Main HTML with all four views
├── styles.css              # Cookie-themed responsive CSS
├── logic.js                # Pure data functions (shared by app and tests)
├── app.js                  # UI/DOM logic
├── logic.test.js           # Jest test suite (30 tests)
├── manifest.json           # PWA manifest for iPad home screen
├── eslint.config.mjs       # ESLint configuration
├── package.json            # npm scripts and dev dependencies
├── vendor/
│   └── chart.umd.min.js   # Chart.js (local copy)
├── fonts/
│   ├── fonts.css           # @font-face declarations
│   ├── fredoka.woff2       # Fredoka variable font
│   └── nunito.woff2        # Nunito variable font
├── images/
│   └── cookie-*.svg        # SVG cookie illustrations per flour type
├── .husky/
│   └── pre-commit          # Runs lint + tests before each commit
└── .github/
    └── workflows/
        └── ci-deploy.yml   # CI (lint + test) and GitHub Pages deployment
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm (comes with Node.js)

### Install Dependencies

```bash
npm install
```

### Run Locally

No build step needed. Open `index.html` directly in a browser:

```bash
open index.html
```

Or use any local HTTP server:

```bash
npx serve .
```

Then visit `http://localhost:3000`.

### Run Tests

```bash
npm test
```

This runs the Jest test suite (30 tests) covering data validation, average calculations, leaderboard sorting, insight generation, CSV export, and input validation.

### Run Linter

```bash
npm run lint
```

### Run Both (same as pre-commit hook)

```bash
npm run precommit
```

## Using on iPad

1. Deploy to GitHub Pages (automatic on push to `main`) or serve from any URL
2. Open the URL in Safari on the iPad
3. Tap the **Share** button and select **Add to Home Screen**
4. The app launches fullscreen without the Safari toolbar

## Replacing Cookie Images

The app ships with SVG placeholder images. To use real photos of your cookie batches:

1. Take a photo of each cookie batch
2. Save them in the `images/` folder (e.g., `cookie-almond.jpg`)
3. Update the `image` field for each flour in `logic.js`

## CI/CD

Every push to `main` triggers a GitHub Actions workflow that:

1. Runs ESLint
2. Runs the Jest test suite
3. Deploys to GitHub Pages (if tests pass)

To enable Pages deployment, go to **Settings > Pages > Source** and select **GitHub Actions**.
