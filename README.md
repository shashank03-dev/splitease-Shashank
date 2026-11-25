# SplitEasy

A shared expense manager for friends, flatmates, and travel groups. Built for the **CodGen MERN Full Stack internship**.

- **Repository:** [github.com/shashank03-dev/splitease-Shashank](https://github.com/shashank03-dev/splitease-Shashank)
- **Live application:** [splitease-shashank.vercel.app](https://splitease-shashank.vercel.app)

## Overview

SplitEasy replaces manual shared-expense arithmetic with a focused workflow. A group of 2–6 people can add themselves, log who paid for what, see each person's equal share and net balance, delete mistakes, and follow a clear “Who pays whom” settlement plan.

The Week 1 React interface is now fully connected to the Week 2 Express and MongoDB API. People and expenses are loaded with `GET` requests when the app starts, created with `POST`, and deleted with `DELETE`. MongoDB is the source of truth; the browser no longer writes group data to `localStorage`.

If the API is unavailable, the interface stays mounted and shows an actionable error with a retry action. Loading states are shown while the initial requests are in flight.

## Problem statement

Splitting shared costs in a small group is easy to get wrong. People usually track expenses in chat, a notes app, or memory, which makes it difficult to answer basic questions:

- How much has the group spent in total?
- What is each person's equal share?
- Who overpaid, who still owes money, and by how much?
- What is the shortest clear set of payments that settles everyone?

SplitEasy solves those problems with an equal-share model, exact currency arithmetic, visible balances, and a suggested payment plan.

## Implemented features

### Group management

- Add and remove 2–6 people through the API
- Trim and normalize names
- Reject empty, overlong, and case-insensitive duplicate names
- Show group capacity, remaining slots, and validation feedback
- Prevent removing a person who is linked to an expense
- Use the real MongoDB `_id` returned by the API for every person

### Expense management

- Add an expense with description, amount, and payer
- Reject empty descriptions, invalid amounts, and unknown payers on both client and server
- List expenses newest first
- Delete any expense with a labelled, keyboard-accessible control
- Send the MongoDB `_id` to `DELETE /api/expenses/:id`
- Recalculate totals, shares, balances, and settlement arrows immediately after the server confirms a change
- Re-fetch the collection after successful writes so the API remains authoritative

### Split summary and balances

- Total spent, equal share, and group size
- Paid amount and equal share for every person
- Positive, negative, and settled balances with `+`, `−`, and `=` markers, so meaning does not depend on color alone
- Exact INR formatting using `Intl.NumberFormat`

### Who pays whom

- Converts balances into a short list of suggested payments
- Shows one animated, hand-drawn arrow per payment
- Handles one debtor paying several people or several debtors paying one person
- Shows an “Everyone is settled up” state when no transfer is needed
- Draws arrows when the section scrolls into view and respects reduced-motion preferences

### API-backed data flow

- `VITE_API_BASE_URL` configures the API origin for each Vite environment
- A reusable service layer centralizes URLs, JSON headers, timeouts, response parsing, and API errors
- `GET /api/people` and `GET /api/expenses` run when the app mounts
- `POST /api/people`, `POST /api/expenses`, and `DELETE /api/expenses/:id` replace the old local mutations
- Successful writes refresh the visible collection from the API
- Inline loading states replace empty states while data is being fetched
- A page-level error banner and in-card retry actions explain API or network failures
- Unsuccessful requests become typed `ApiError` values instead of uncaught exceptions
- `MONGO_URI` exists only in `server/.env`; it is never referenced by the client

### Responsive and accessible UI

- Tested layouts from 320 px mobile through tablet and desktop
- Semantic headings, real labels, visible focus rings, and a skip link
- Inline field errors connected with `aria-invalid` and `aria-describedby`
- Live regions for changing counts, totals, loading, errors, and action feedback
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
| Persistence | MongoDB Atlas through the Express API |
| Money formatting | `Intl.NumberFormat` (`en-IN`, INR) |
| Linting | ESLint 10 with React Hooks and React Refresh plugins |
| Testing | Node's built-in test runner |
| Fonts | Instrument Serif via `@fontsource` |
| API | Node.js, Express 5 |
| Database | MongoDB Atlas with Mongoose 9 |
| Backend config | dotenv, CORS |
| Frontend config | Vite environment variables (`VITE_*` only) |
| Deployment target | Vercel (Vite preset) for the client; the API is deployed separately |

## Integration architecture

```text
React components
      │  render data and emit user actions
      ▼
Custom hooks: usePeople, useExpenses
      │  own loading, error, and mutation state
      ▼
API service layer: peopleApi / expensesApi / apiClient
      │  fetch, JSON, timeout, response parsing, ApiError
      ▼
Express routes and controllers
      │  validation, status codes, pagination-free collections
      ▼
Mongoose models: Person, Expense
      │
      ▼
MongoDB Atlas
```

### Why the service layer exists

Components should not know HTTP method names, JSON headers, or error response shapes. `client/src/services/apiClient.js` provides one `apiRequest` function, and `peopleApi.js` / `expensesApi.js` expose task-focused functions:

```js
fetchPeople()
createPerson(name)
deletePerson(id)
fetchExpenses()
createExpense({ description, amount, paidBy })
deleteExpense(id)
```

Every request returns normalized data or throws an `ApiError` with a user-readable message and optional field details. Network failures, timeouts, non-2xx responses, malformed JSON, and `success: false` payloads all take the same path, so no failed request can crash React.

### Why the data is mapped

The API returns MongoDB documents with `_id` and `paidBy`. The existing Week 1 components and balance utilities use `id` and `payerId`. `client/src/utils/apiMappers.js` performs that translation once at the network boundary:

- `person._id` → `person.id`
- `expense._id` → `expense.id`
- `expense.paidBy` → `expense.payerId`
- payer names are joined from the current people list for display, never stored as a duplicate copy

This preserves all Week 1 calculations while ensuring every id used by the UI is the actual MongoDB id.

### Async flow and `useEffect`

Each data hook fetches its collection in a mount effect. The effect uses an `AbortController` so an unmount or React StrictMode's development remount cancels the first request instead of applying a stale response. State is updated only after the promise settles:

1. Initial state is `isLoading: true`.
2. `useEffect` starts `GET /api/people` and `GET /api/expenses`.
3. On success, the normalized arrays are stored and `hasLoaded` becomes true.
4. On failure, a readable message is stored and `isLoading` becomes false.
5. Mutations call the API, update state from the server response, then re-fetch the collection.

Loading and error state live in the hooks, so `GroupManager` and `ExpenseManager` stay presentational. This also avoids separate, conflicting copies of people or expenses in components.

## Expense calculation

For a group with `n` people:

```text
equal share = total expenditure / n
member balance = amount paid by member - equal share
```

- A **positive balance** means the member is owed money.
- A **negative balance** means the member owes money.
- A **zero balance** means the member is settled.

All arithmetic is performed in integer paise instead of floating-point rupees. When a total cannot be divided evenly, the base share is rounded down and the remaining paise are assigned to the first members, keeping the sum of balances at exactly zero. This logic is unchanged from Week 1 and is covered by unit tests.

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

This example is covered by the balance unit tests.

## API endpoints used by the frontend

| Method | Path | Purpose | Used by |
| --- | --- | --- | --- |
| `GET` | `/api/people` | List people alphabetically | Initial load, refresh after writes |
| `POST` | `/api/people` | Create a person | Add person form |
| `DELETE` | `/api/people/:id` | Delete a person and their expenses | Remove person button |
| `GET` | `/api/expenses` | List expenses, newest first | Initial load, refresh after writes |
| `POST` | `/api/expenses` | Create an expense | Add expense form |
| `DELETE` | `/api/expenses/:id` | Delete one expense | Delete expense button |
| `GET` | `/api/health` | API and database status | Manual/backend checks |
| `PUT` | `/api/expenses/:id` | Update an expense | Available in the API; no edit UI yet |

`POST /api/expenses` accepts `description`, `amount`, and `paidBy`, plus an optional ISO-8601 `date`. `paidBy` must be the MongoDB id of an existing person. Deleting a person deletes every expense paid by that person before removing the person. This is application-level referential integrity because MongoDB does not enforce foreign keys in this schema.

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
│   │   │   ├── DataState.jsx
│   │   │   ├── ExpenseForm.jsx
│   │   │   ├── ExpenseList.jsx
│   │   │   ├── ExpenseManager.jsx
│   │   │   ├── ExpenseSummary.jsx
│   │   │   ├── GroupManager.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── MemberBalances.jsx
│   │   │   ├── MemberForm.jsx
│   │   │   ├── MemberList.jsx
│   │   │   ├── Notice.jsx
│   │   │   └── SettlementPlan.jsx
│   │   ├── hooks/
│   │   │   ├── useExpenses.js
│   │   │   └── usePeople.js
│   │   ├── services/
│   │   │   ├── apiClient.js
│   │   │   ├── expensesApi.js
│   │   │   └── peopleApi.js
│   │   ├── styles/
│   │   │   ├── base.css
│   │   │   ├── components.css
│   │   │   ├── index.css
│   │   │   ├── layout.css
│   │   │   └── tokens.css
│   │   ├── utils/
│   │   │   ├── apiMappers.js
│   │   │   ├── balanceUtils.js
│   │   │   ├── expenseUtils.js
│   │   │   └── memberUtils.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tests/
│   │   ├── apiMappers.test.js
│   │   ├── balanceUtils.test.js
│   │   ├── expenseUtils.test.js
│   │   └── memberUtils.test.js
│   ├── .env.example
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
│   │   ├── controllers/
│   │   │   ├── expense.controller.js
│   │   │   └── person.controller.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── notFound.js
│   │   ├── models/
│   │   │   ├── expense.model.js
│   │   │   └── person.model.js
│   │   ├── routes/
│   │   │   ├── expense.routes.js
│   │   │   ├── health.routes.js
│   │   │   └── person.routes.js
│   │   ├── services/
│   │   │   └── person.service.js
│   │   ├── utils/
│   │   │   ├── apiError.js
│   │   │   └── objectId.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── .editorconfig
├── .gitignore
└── README.md
```

The server separates concerns so it can grow without becoming one large file:

- `server.js` validates configuration, connects to MongoDB, then listens.
- `app.js` builds the Express application and middleware order.
- `config/` loads server-only environment variables and owns the Mongoose connection.
- `routes/` maps each URL and method to a controller.
- `controllers/` validates request input and builds responses.
- `models/` defines Mongoose schemas and database-level rules.
- `services/` holds cross-model rules such as validating a payer reference.
- `middleware/` contains shared 404 and error handling.
- `utils/` contains small shared helpers such as the API error type.

## Installation

Requires Node.js `^20.19.0` or `>=22.12.0`.

```bash
git clone https://github.com/shashank03-dev/splitease-Shashank.git
cd splitease-Shashank

# Frontend
cd client
npm install
cp .env.example .env.local

# Backend
cd ../server
npm install
cp .env.example .env
```

Open `server/.env` and set `MONGO_URI` to your own MongoDB Atlas connection string. Set `PORT` and `CLIENT_ORIGIN`, then make sure `client/.env.local` points at the same API port:

```dotenv
# client/.env.local
VITE_API_BASE_URL=http://localhost:5000/api
```

```dotenv
# server/.env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGO_URI=mongodb+srv://...
```

Never commit either `.env` file. Only `VITE_*` values are exposed to the browser; `MONGO_URI` stays in `server/`.

## Local development

Run the client and server in two separate terminals.

**Terminal 1 - backend (`server/`):**

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API and restart on changes (`node --watch`) |
| `npm start` | Start the API without file watching |

The API listens on `http://localhost:5000` by default. The health check is `GET http://localhost:5000/api/health`.

**Terminal 2 - frontend (`client/`):**

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint all JavaScript and JSX with ESLint |
| `npm test` | Run unit tests with Node's test runner |
| `npm run check` | Run lint, tests, and the production build |

Start at the URL printed by Vite, normally `http://localhost:5173`.

> **macOS note:** AirPlay Receiver often occupies port 5000. If startup fails with `EADDRINUSE`, set `PORT=5001` in `server/.env` and update `VITE_API_BASE_URL` in `client/.env.local` to `http://localhost:5001/api`.

## Manual integration check

1. Start MongoDB connectivity with `cd server && npm run dev`.
2. Start the client with `cd client && npm run dev`.
3. Add two people. Confirm the browser Network panel shows `POST /api/people` followed by `GET /api/people`.
4. Add an expense for one of those people. Confirm `POST /api/expenses` followed by `GET /api/expenses`.
5. Confirm the expense appears, and the total, equal share, balances, and settlement plan are correct.
6. Refresh the browser. The people and expense should return from `GET /api/people` and `GET /api/expenses`.
7. Delete the expense. Confirm the request is `DELETE /api/expenses/<24-character Mongo id>`, the row disappears, totals update, and every balance returns to zero.
8. Stop the backend and refresh. Confirm the notice and card error states appear, the app stays usable, and Retry recovers after the backend restarts.
9. Resize to 320 px and 375 px and confirm there is no horizontal scrolling.

## Environment variables

### Frontend (`client/.env.local`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes for production; development has a local fallback | Full API base URL including `/api` |

### Backend (`server/.env`)

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

The health endpoint returns `200` with `database: "connected"`, or `503` with `database: "disconnected"` if the API is up but the database is not connected.

## CORS and deployment

CORS is configured on the server from `CLIENT_ORIGIN`. Requests without an `Origin` header (curl, Postman, server-to-server) are allowed; browser origins must be in the comma-separated list. The API replies with `403` for an unlisted origin.

The frontend is ready for Vercel's Vite preset. Because the app now lives in `client/`, set the Vercel project's **Root Directory** to `client`:

1. Import the GitHub repository into Vercel.
2. Set **Root Directory** to `client`.
3. Keep the framework preset as **Vite**.
4. Use `npm run build` as the build command.
5. Use `dist` as the output directory.
6. Add `VITE_API_BASE_URL=https://your-api-host.example.com/api` for Production, Preview, and Development.
7. Deploy `server/` separately, set `MONGO_URI` there, and add the deployed frontend origin to `CLIENT_ORIGIN`.

No database secret is ever sent to the browser.

## Data and privacy

- People and expenses are stored in MongoDB through the API, not in `localStorage`.
- The browser keeps only in-memory React state while the page is open.
- The API has no authentication in this assignment version, so anyone who can reach it can read and write the shared group data.
- Week 1 `localStorage` snapshots are not imported automatically.
- The data is not encrypted at the application layer beyond MongoDB Atlas's transport and storage protections.

## Scope and limitations

- Splitting is always equal across current people.
- No custom shares, recurring expenses, settlement history, or “mark as paid” action.
- No authentication, user accounts, or per-group permissions. The API currently exposes one shared collection of people and expenses.
- No optimistic concurrency: a refresh can overwrite a concurrent edit with the latest server response.
- Person deletion is a two-step server operation (delete linked expenses, then the person) and is not wrapped in a MongoDB transaction.
- If the API is unreachable, reads show an error state and writes are rejected; there is no offline queue.
- The edit-expense UI is not implemented even though `PUT /api/expenses/:id` exists.
- Week 1 localStorage data must be re-entered; there is no migration endpoint.
