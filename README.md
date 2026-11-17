# SplitEasy

A frontend-only shared expense app for small groups, built for the **CodGen MERN Full Stack internship**.

Add 2–6 group members, log who paid for what, and see each person's equal share and net balance in INR.

## Features

- Add and remove 2–6 group members
- Log expenses with description, amount, and payer
- Calculate total spend, equal share, and per-member contributions
- Show who is owed, who owes, and who is settled
- INR formatting with exact paise-based arithmetic
- Safe empty, decimal, and insufficient-member states
- Responsive, accessible UI

## Tech stack

React 19, Vite 8, JavaScript, CSS, ESLint 10, and Node's built-in test runner.

## Getting started

Requires Node.js `^20.19.0` or `>=22.12.0`.

```bash
npm install
npm run dev
```

## Scripts

| Command           | Purpose                         |
| ----------------- | ------------------------------- |
| `npm run dev`     | Start the Vite development server |
| `npm run build`   | Build for production            |
| `npm run preview` | Preview the production build    |
| `npm run lint`    | Run ESLint                      |
| `npm test`        | Run calculation tests           |
| `npm run check`   | Lint, test, and build           |

## How the split works

Each member's share is `total expenditure / number of members`. A member's balance is:

```text
balance = amount paid - equal share
```

Positive means the member is owed money, negative means they owe money, and zero means they are settled.

Money is calculated in integer paise. If a total cannot be split evenly, the base share is rounded down and the remaining paise are assigned to the first members so balances still sum to zero.

## Project structure

```text
src/
├── components/   # Group, expense, summary, and balance UI
├── hooks/        # Group and expense state
├── styles/       # Tokens, layout, and components
├── utils/        # Validation, money, and balance calculations
├── App.jsx
└── main.jsx
tests/            # Calculation tests
```

## Notes

- Data is in memory only; refreshing resets the app.
- Splitting is always equal across current group members.
- Removing a member who paid for an expense leaves their amount in the total; the summary flags it.
- No backend, authentication, custom splits, expense deletion, or settlement suggestions yet.
