# SplitEasy

A shared expense manager for friends, flatmates, and travel groups. Built for the **CodGen MERN Full Stack internship**. Week 1 delivered the React frontend; Week 2 adds the Express and MongoDB backend.

- **Repository:** [github.com/shashank03-dev/splitease-Shashank](https://github.com/shashank03-dev/splitease-Shashank)
- **Live application:** [splitease-shashank.vercel.app](https://splitease-shashank.vercel.app)

## Overview

SplitEasy replaces manual shared-expense arithmetic with a focused, browser-based workflow. A group of 2–6 people can add themselves, log who paid for what, see each person's equal share and net balance, delete mistakes, and follow a clear “Who pays whom” settlement plan.

The Week 1 frontend works without an account. Group data is saved in the current browser and restored after a refresh. The Week 2 backend foundation lives in `server/`; the React app will be connected to it during the week.

## Problem statement

Splitting shared costs in a small group is easy to get wrong. People usually track expenses in chat, a notes app, or memory, which makes it difficult to answer basic questions:

- How much has the group spent in total?
- What is each person's equal share?
- Who overpaid, who still owes money, and by how much?
- What is the shortest clear set of payments that settles everyone?

SplitEasy solves those problems with an equal-share model, exact currency arithmetic, visible balances, and a suggested payment plan. Week 1 deliberately stayed frontend-only: no authentication, backend, or database. Week 2 introduces the API and database.

## Implemented features

### Group management

- Add and remove 2–6 members
- Trim and normalize names
- Reject empty, overlong, and case-insensitive duplicate names
- Show group capacity, remaining slots, and validation feedback
- Prevent removing a member who is linked to an expense

### Expense management

- Add an expense with description, amount, and payer
- Reject empty descriptions, invalid amounts, and unknown payers
- List expenses newest first
- Delete any expense with a labelled, keyboard-accessible control
- Recalculate totals, shares, balances, and settlement arrows immediately

### Split summary and balances

- Total spent, equal share, and group size
- Paid amount and equal share for every member
- Positive, negative, and settled balances with `+`, `−`, and `=` markers, so meaning does not depend on color alone
- Exact INR formatting using `Intl.NumberFormat`

### Who pays whom

- Converts balances into a short list of suggested payments
- Shows one animated, hand-drawn arrow per payment
- Handles one debtor paying several people or several debtors paying one person
- Shows an “Everyone is settled up” state when no transfer is needed
- Draws arrows when the section scrolls into view and respects reduced-motion preferences

### Persistence and data safety

- Saves members and expenses together under `splitease:state:v1`
- Restores state after browser refresh
- Recovers safely from missing, malformed, unreadable, or edited saved data
- Drops invalid records and reports skipped entries
- Shows a warning if browser storage is unavailable or a save fails

### Responsive and accessible UI

- Tested layouts from 320 px mobile through tablet and desktop
- Semantic headings, real labels, visible focus rings, and a skip link
- Inline field errors connected with `aria-invalid` and `aria-describedby`
- Live regions for changing counts, totals, and action feedback
- Decorative icons and arrows hidden from assistive technology
- Screen-reader sentences for every suggested payment
- Reduced-motion support

## Technology stack

| Area | Technology |
| --- | --- |
| UI | React 19 |
| Build tool | Vite 8 |
| Language | JavaScript (ES modules), JSX |
| Styling | CSS custom properties, Grid, Flexbox, media queries |
| Persistence (Week 1) | Browser `localStorage` |
| Money formatting | `Intl.NumberFormat` (`en-IN`, INR) |
| Linting | ESLint 10 with React Hooks and React Refresh plugins |
| Testing | Node's built-in test runner |
| Fonts | Instrument Serif via `@fontsource` |
| API | Node.js, Express 5 |
| Database | MongoDB Atlas with Mongoose 9 |
| Backend config | dotenv, CORS |
| Deployment target | Vercel (Vite preset) for the client |

Week 1 required no backend or environment variables. Week 2 adds `server/` and its own `.env`.

## Expense calculation

For a group with `n` members:

```text
equal share = total expenditure / n
member balance = amount paid by member - equal share
```

- A **positive balance** means the member is owed money.
- A **negative balance** means the member owes money.
- A **zero balance** means the member is settled.

All arithmetic is performed in integer paise instead of floating-point rupees. When a total cannot be divided evenly, the base share is rounded down and the remaining paise are assigned to the first members, keeping the sum of balances at exactly zero.

### Official example

Aman pays ₹900, Riya pays ₹300, and Karan pays ₹0. The group total is ₹1,200 and the equal share for three people is ₹400.

| Member | Paid | Equal share | Balance | Result |
| --- | ---: | ---: | ---: | --- |
| Aman | ₹900.00 | ₹400.00 | **+₹500.00** | Is owed |
| Riya | ₹300.00 | ₹400.00 | **−₹100.00** | Owes |
| Karan | ₹0.00 | ₹400.00 | **−₹400.00** | Owes |

Suggested settlement:

- Karan pays Aman ₹400.00
- Riya pays Aman ₹100.00

This example is covered by both unit and browser tests.

## Project structure

```text
splitease-Shashank/
├── client/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── HandNote.jsx
│   │   │   │   └── Icons.jsx
│   │   │   ├── ExpenseForm.jsx
│   │   │   ├── ExpenseList.jsx
│   │   │   ├── ExpenseManager.jsx
│   │   │   ├── ExpenseSummary.jsx
│   │   │   ├── GroupManager.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── MemberBalances.jsx
│   │   │   ├── MemberForm.jsx
│   │   │   ├── MemberList.jsx
│   │   │   ├── SettlementPlan.jsx
│   │   │   └── StorageNotice.jsx
│   │   ├── hooks/
│   │   │   ├── useExpenses.js
│   │   │   └── useGroupMembers.js
│   │   ├── styles/
│   │   │   ├── base.css
│   │   │   ├── components.css
│   │   │   ├── index.css
│   │   │   ├── layout.css
│   │   │   └── tokens.css
│   │   ├── utils/
│   │   │   ├── balanceUtils.js
│   │   │   ├── expenseUtils.js
│   │   │   ├── id.js
│   │   │   ├── memberUtils.js
│   │   │   └── storage.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tests/
│   │   ├── balanceUtils.test.js
│   │   ├── expenseUtils.test.js
│   │   ├── memberUtils.test.js
│   │   └── storage.test.js
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── notFound.js
│   │   ├── routes/
│   │   │   └── health.routes.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── .editorconfig
├── .gitignore
└── README.md
```

The frontend and backend are independent packages: `client/` owns the Vite/React app, and `server/` owns the Express API. Component files use PascalCase, hooks use the `use*` convention, and utilities use camelCase. Styling is split by responsibility rather than by component file, keeping shared tokens, layout, and component rules centralized.

The server separates concerns so it can grow without becoming one large file:

- `server.js` is the entry point: validate configuration, connect to MongoDB, then listen for HTTP requests.
- `app.js` builds the Express application and defines middleware order.
- `config/` loads environment variables and owns the Mongoose connection.
- `routes/` contains route handlers. Today it only has the health check.
- `middleware/` contains shared 404 and error handling.

## Installation

Requires Node.js `^20.19.0` or `>=22.12.0`.

```bash
git clone https://github.com/shashank03-dev/splitease-Shashank.git
cd splitease-Shashank

# Frontend
cd client
npm install

# Backend
cd ../server
npm install
cp .env.example .env
```

Then open `server/.env` and set `MONGO_URI` to your own MongoDB Atlas connection string. Never commit that file.

## Local development commands

Run the client and server in two separate terminals.

**Terminal 1 - frontend (`client/`):**

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint all JavaScript and JSX with ESLint |
| `npm test` | Run unit tests with Node's test runner |
| `npm run check` | Run lint, tests, and the production build |

Start developing at the URL printed by Vite, normally `http://localhost:5173`.

**Terminal 2 - backend (`server/`):**

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API and restart it when files change (`node --watch`) |
| `npm start` | Start the API without file watching |

The API listens on `http://localhost:5000` by default. The health check is `GET http://localhost:5000/api/health`.

> **macOS note:** AirPlay Receiver often occupies port 5000. If startup fails with `EADDRINUSE`, set `PORT=5001` in `server/.env` and use `http://localhost:5001` instead.

## Backend environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB Atlas connection string, including the database name |
| `PORT` | No | HTTP port, default `5000` |
| `NODE_ENV` | No | `development`, `production`, or `test` |
| `CLIENT_ORIGIN` | No | Comma-separated browser origins allowed by CORS, default `http://localhost:5173` |

To connect Atlas:

1. Create a free cluster in MongoDB Atlas.
2. Create a database user under **Database Access**.
3. Add your current IP under **Network Access**.
4. Copy the driver connection string, add a database name such as `splitease`, and put it in `server/.env` as `MONGO_URI`.
5. URL-encode special characters in the password (for example, `@` becomes `%40`).

The health endpoint returns `200` with `database: "connected"`, or `503` with `database: "disconnected"` if the API is up but the database is not.

## Data and privacy

- Week 1 group and expense data is still stored only in the current browser under `splitease:state:v1`.
- The frontend does not send group or expense data to the API yet; only the backend health check exists.
- Clearing site data removes the saved group.
- Storage is per browser and per device; it does not sync between people or tabs.
- LocalStorage is not encrypted and should not be used for sensitive financial records.

## Deployment

The frontend is ready for Vercel's Vite preset. Because the app now lives in `client/`, set the Vercel project's **Root Directory** to `client`:

1. Import the GitHub repository into Vercel.
2. Set **Root Directory** to `client`.
3. Keep the framework preset as **Vite**.
4. Use `npm run build` as the build command.
5. Use `dist` as the output directory.
6. No frontend environment variables are required.

The Express API is not deployed by this Vercel project. Deploy `server/` separately when the API is ready.

- **Repository:** https://github.com/shashank03-dev/splitease-Shashank
- **Live application:** [splitease-shashank.vercel.app](https://splitease-shashank.vercel.app)

## Scope and limitations

- Splitting is always equal across current members.
- No custom shares, recurring expenses, settlement history, or “mark as paid” action.
- No authentication or cross-device synchronization yet.
- Removing a member requires deleting their linked expenses first.
- Week 2 currently contains the backend foundation only: Express, MongoDB Atlas, environment configuration, CORS, and a health check. Models and CRUD routes come next.
