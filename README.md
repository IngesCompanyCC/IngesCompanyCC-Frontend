# DoofPlus Web Application

![Vue](https://img.shields.io/badge/Vue-3-42b883?style=for-the-badge&logo=vuedotjs)
![PrimeVue](https://img.shields.io/badge/PrimeVue-5-41b883?style=for-the-badge)
![Pinia](https://img.shields.io/badge/Pinia-4-ffd859?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite)

Web Application of **DoofPlus**, the platform of IngesCompanyCC for pharmaceutical laboratories: quality documents, deviations and CAPA, batch release with electronic signature, manufacturing against approved master formulas and IoT monitoring of critical equipment.

It follows the course base project (`learning-center`): Vue 3, Vite, PrimeVue, Pinia, vue-i18n (English and Spanish), axios and a fake REST API with json-server. Each bounded context has its own `domain`, `application`, `infrastructure` and `presentation` layers, and the shared base classes (`BaseApi`, `BaseEndpoint`) live in `src/shared`. Until the DoofPlus RESTful API (C#) is deployed, the data comes from the fake API.

## 🚀 Run locally

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later and npm.

### Setup

```bash
npm install
npm run server
```

In a second terminal:

```bash
npm run dev
```

- `npm run server` starts the fake API at `http://localhost:3000/api/v1`. Its data lives in `server/db.json`, and every change made in the app is saved there.
- `npm run dev` opens the app at `http://localhost:5173/`.

To restore the demo data after testing, discard the changes of `server/db.json` (`git checkout -- server/db.json`) and restart `npm run server`.

## 🔐 Test accounts

Every account uses the password `DoofPlus2026!` and the two-factor code `482106`.

| User | Email | Environment |
|------|-------|-------------|
| María México · QA Specialist (QA release privilege) | `maria.mexico@andinos.com.pe` | QA/QC |
| Alberto Valle · Production Supervisor | `alberto.valle@andinos.com.pe` | Production |
| Carlos Medina · Laboratory Administrator | `carlos.medina@andinos.com.pe` | Administration |

1. Open `/sign-in`, choose the environment and enter the email and password.
2. Enter the two-factor code `482106`.
3. The workspace of the environment opens. Signing in to an environment that does not match the role shows the "Access not authorized" state.

Other flows to try:

- **Organization registration:** `/register` (also from "New laboratory?" in the sign-in). The RUC `20512345678` is already registered; any other RUC of 11 digits that starts with 10 or 20 creates the organization, its plant, a pending subscription and an invited administrator.
- **Batch release:** María signs the release of `B-26038` in *Batch release* by entering her password again. `B-26041` is blocked by its deviation.
- **Separation of duties:** María cannot approve `SOP-QA-014 v2.4` because she is its author.

## 🧩 Bounded contexts and routes

| Bounded context | Folder | Routes |
|-----------------|--------|--------|
| Identity & Access Management | `src/iam` | `/sign-in`, `/sign-in/:environment` (credentials, two-factor code, not authorized) |
| Organization Management | `src/organizations` | `/register`, `/administration/overview`, `/<environment>/profile` |
| Subscriptions & Payments | `src/subscriptions` | `/administration/subscription` (declined payment, plan change review) |
| Manufacturing & Batch Management | `src/manufacturing` | `/production/overview`, `/production/orders`, `/production/orders/:code`, `/production/products`, `/production/batches`, `/production/batches/:code`, `/production/raw-materials` |
| IoT Monitoring | `src/monitoring` | `/production/iot`, `/production/equipment`, `/production/sensors/:code`, `/production/incidents`, `/production/batches/:code/iot` |
| Quality & Compliance | `src/quality` | `/qa/overview`, `/qa/indicators`, `/qa/documents`, `/qa/deviations`, `/qa/capa`, `/qa/batch-release`, `/qa/analytical-results`, `/qa/audits`, `/qa/regulatory-reports`, `/<environment>/audit-trail`, `/<environment>/tasks` |

`src/shared` has the base API and endpoint, the workspace and public layouts, the page header, the language switcher, the number and date formats and the navigation of each environment (`workspace-environments.js`). The route guard (`src/iam/infrastructure/authentication.guard.js`) sends users without a session to the sign-in of the environment and users of another environment back to their own.

## 🏗️ Architecture (DDD)

```text
src/<bounded-context>/
├── domain/model/     # Entities and commands (plain JavaScript classes)
├── application/      # Pinia store: state, business rules and use cases
├── infrastructure/   # <Context>Api over BaseApi, one BaseEndpoint per collection, assemblers
└── presentation/     # Views (.vue) with PrimeVue and the routes of the context
```

## 💡 Business rules implemented

- Two-factor code after the password; the environment is checked after the identity is verified.
- Separation of duties: the author of a document version cannot approve it; a CAPA owner cannot be its reviewer.
- A batch can only be created with a unique code and an approved master formula; operations are recorded in sequence and not while one is on hold.
- Equipment that is not fit for use, or whose sensors feed another batch in progress, cannot be associated with a batch. Acknowledging an IoT alert does not close it.
- An out-of-specification result requires a deviation; a deviation needs reviewed evidence before its risk assessment is submitted.
- Batch release requires the six readiness checks and the re-entered password of a user with the QA release privilege. Every change is recorded in the audit trail with its author.

## ⚙️ Environment variables

| File | Used by | API |
|------|---------|-----|
| `.env.development` | `npm run dev` | `http://localhost:3000/api/v1` (local json-server) |
| `.env.production` | `npm run build` | `https://ingescompanycc-api.onrender.com/api/v1` (json-server on Render) |

Both files define `VITE_PLATFORM_API_URL`, one `VITE_<COLLECTION>_ENDPOINT_PATH` per collection, `VITE_LANDING_PAGE_URL` (legal links of the footer) and `VITE_PRIME_UI_LICENSE_KEY`. A new collection needs its endpoint path in **both** files.

## ☁️ Deployment

The Web Application is static and is published on **Firebase Hosting**; the fake API is published on **Render**.

### 1. Fake API on Render

1. In [Render](https://render.com/), create a **Web Service** from this repository (branch `main`).
2. Runtime **Node**, build command `npm install`, start command `npm run server:prod`, free plan.
3. `server:prod` serves `server/db.json` on `0.0.0.0:10000`, the default port of Render.
4. Check `https://<service>.onrender.com/api/v1/plans`. If the service name is different, update `VITE_PLATFORM_API_URL` in `.env.production`.

> The free plan stops the service after 15 minutes without requests. The first request after that takes about 50 seconds, so open the API once before a demo. Changes made in the published app are lost when the service restarts.

### 2. Web Application on Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase use --add
```

Choose the Firebase project of the team and an alias; this creates `.firebaserc`, which is committed. Then build and deploy:

```bash
npm run build
firebase deploy --only hosting
```

`firebase.json` publishes the `dist` folder and rewrites every route to `index.html`, so links such as `/sign-in/qa` work when they are opened directly.

### 3. Landing Page

In the Landing Page repository (`IngesCompanyCC-LandingPage`), set `WEB_APP_URL` to the Firebase URL and point the segment buttons to `/sign-in/qa`, `/sign-in/production` and `/register`.

## 📜 Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Development server with hot reload |
| `npm run server` | Fake API for development (port 3000) |
| `npm run build` | Production build in `dist/` with `.env.production` |
| `npm run preview` | Serves the production build locally |
| `npm run server:prod` | Fake API for Render (port 10000) |

## 🛠️ Tech stack and conventions

- **Framework:** Vue 3 (`<script setup>`) with Vite.
- **UI library:** PrimeVue 5 with the Material preset and the DoofPlus teal, PrimeFlex and PrimeIcons.
- **State:** Pinia setup stores, one per bounded context.
- **i18n:** vue-i18n (English and Spanish); the language is remembered between visits.
- **HTTP:** axios through `BaseApi` and `BaseEndpoint`.
- **Mock backend:** json-server 0.17 with the `/api/v1` prefix (`server/routes.json`).
- **Version control:** GitFlow (`feature/<bounded-context>` → `develop` → `release` → `main`) and Conventional Commits.

## 👥 Team IngesCompanyCC

| Member | GitHub |
|--------|--------|
| Angulo Ramírez, Marcelo Martín | [Zock2005](https://github.com/Zock2005) |
| Cobades Zamora, Yhoshua Hebert | [YhoshuaCZ](https://github.com/YhoshuaCZ) |
| Rojas Ambicho, Nestor Daniel | [danRO-20](https://github.com/danRO-20) |
| Yarleque Ruiz, Cristina Marcela | [Cris06luna](https://github.com/Cris06luna) |
| Zavaleta Gutierrez, Rodolfo Martin | [gutierrezrodolfo360-bit](https://github.com/gutierrezrodolfo360-bit) |

UPC · Ingeniería de Software · 1ASI0730 Aplicaciones Web · 2026-20

