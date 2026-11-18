# SplitEasy

A frontend-only shared expense app for small groups, built for the **CodGen MERN Full Stack internship**.

Add 2–6 group members, log who paid for what, and see each person's equal share and net balance in INR.

## Features

- Add and remove 2–6 group members
- Log expenses with description, amount, and payer
- Delete any expense, with totals, shares, and balances recalculated immediately
- Calculate total spend, equal share, and per-member contributions
- Show who is owed, who owes, and who is settled, with visible `+`, `−`, and `=` markers
- Draw an animated “Who pays whom” arrow for every suggested payment, including multiple arrows when one person owes several people
- Save members and expenses in the browser and restore them after a refresh
- Recover safely from missing, unreadable, or edited saved data
- Keep member–expense relationships consistent by blocking removal of a member who paid for an expense
- INR formatting with exact paise-based arithmetic
- Safe empty, decimal, and insufficient-member states
- Responsive, accessible UI with visible keyboard focus and labelled controls

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
| `npm test`        | Run calculation and storage tests |
| `npm run check`   | Lint, test, and build           |

## How the split works

Each member's share is `total expenditure / number of members`. A member's balance is:

```text
balance = amount paid - equal share
```

Positive means the member is owed money, negative means they owe money, and zero means they are settled.

Money is calculated in integer paise. If a total cannot be split evenly, the base share is rounded down and the remaining paise are assigned to the first members so balances still sum to zero.

## Who pays whom

The “Who pays whom” section turns the member balances into a short payment plan. Debtors are paired with creditors largest balance first, which clears at least one member per payment and keeps the number of arrows small. Each arrow carries the exact amount to transfer, and all amounts are calculated in paise, so the plan always clears the group exactly.

If one person owes two people, they get two arrows. If two people owe the same person, that person receives two arrows. When every balance is zero, the section shows an “Everyone is settled up” state instead. Arrows draw themselves in sequence when the plan changes; users who prefer reduced motion see them immediately.

## Saving data

Members and expenses are saved together as one versioned snapshot in `localStorage` under `splitease:state:v1`. The app reads that snapshot once when it loads and writes a fresh snapshot after every member or expense change. Keeping both lists in one key means a refresh can never restore half of a group.

Saved data is treated as untrusted. On load, the app:

- ignores malformed JSON and starts with an empty group;
- drops entries with missing or invalid fields, duplicate ids, or duplicate names;
- enforces the 6-member limit and name/description limits again;
- keeps an expense only when its payer still exists, and rebuilds the payer name from the current member record;
- reports how many invalid entries were skipped.

If browser storage is unavailable or a save fails (private mode, quota, permissions), the app keeps working in memory and shows a visible warning instead of silently losing data.

## Member and expense integrity

An expense must always point to a current member. Removing a member who has paid for one or more expenses is blocked, and an inline message asks you to delete those expenses first. This avoids orphaned expenses and prevents financial history from disappearing silently. Deleting an expense is always allowed and updates every total immediately.

## Project structure

```text
src/
├── components/   # Group, expense, summary, balance, and status UI
├── hooks/        # Group and expense state
├── styles/       # Tokens, base styles, layout, and components
├── utils/        # Validation, money, balances, and localStorage handling
├── App.jsx
└── main.jsx
tests/            # Calculation, validation, and storage tests
```

## Notes

- Splitting is always equal across current group members.
- Data stays in the current browser and is not synced anywhere.
- No backend, authentication, custom splits, or automatic money transfers yet.
