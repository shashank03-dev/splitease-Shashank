# SplitEasy

A frontend-only shared expense app for small groups. Built as the Week 1 project
for the **CodGen MERN Full Stack internship**.

> **Day 2 scope:** group management, a reusable expense form, expense validation
> and an in-memory expense log. Calculations, balances, deletion, persistence,
> authentication and backend services are intentionally not part of this build.

## Tech stack

- React 19 with function components and hooks
- Vite 8
- JavaScript ES6+
- HTML5 and CSS3 with custom properties, flexbox, grid and responsive design
- Helvetica Neue / Helvetica for UI text and Instrument Serif for display type,
  self-hosted through Fontsource
- ESLint 10 flat config
- Git and GitHub

## Run locally

Requires Node.js `^20.19.0` or `>=22.12.0`.

```bash
npm install
npm run dev
```

Vite prints the local URL, normally <http://localhost:5173>.

## Scripts

| Command           | Purpose                                    |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Start the Vite development server with HMR |
| `npm run build`   | Create a production build in `dist/`       |
| `npm run preview` | Serve the production build locally         |
| `npm run lint`    | Run ESLint across the project              |
| `npm run lint:fix`| Apply ESLint's safe automatic fixes        |
| `npm run check`   | Run lint and production build together     |

## Folder structure

```text
.
├── public/
│   └── favicon.svg            # SplitEasy brand mark
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── HandNote.jsx   # Out-of-box hand-drawn guidance
│   │   │   └── Icons.jsx      # Inline SVG icons
│   │   ├── ExpenseForm.jsx    # Controlled expense form and validation
│   │   ├── ExpenseList.jsx    # Expense rows
│   │   ├── ExpenseManager.jsx # Expense card composition
│   │   ├── GroupManager.jsx   # Group setup container
│   │   ├── Header.jsx         # Centered brand and section navigation
│   │   ├── MemberForm.jsx     # Controlled add-member form and validation
│   │   └── MemberList.jsx     # Removable member rows
│   ├── hooks/
│   │   ├── useExpenses.js     # Expense state and add rules
│   │   └── useGroupMembers.js # Group state, rules and actions
│   ├── styles/
│   │   ├── index.css          # Style entry point
│   │   ├── tokens.css         # Colour, type, spacing and radius tokens
│   │   ├── base.css           # Reset, global elements, accessibility helpers
│   │   ├── layout.css         # Header, intro and page grid
│   │   └── components.css     # Reusable UI and feature components
│   ├── utils/
│   │   ├── expenseUtils.js    # Validation and currency formatting
│   │   ├── id.js              # Unique member and expense ids
│   │   └── memberUtils.js     # Validation, initials and constants
│   ├── App.jsx                # Page composition and single state owner
│   └── main.jsx               # React entry point
├── eslint.config.js
├── index.html
├── package.json
└── vite.config.js
```

## Day 1 behaviour

- Add between **two and six** group members.
- The header navigation jumps to the rules or the group setup card.
- The six-member limit is enforced in the UI and in the state hook.
- The group status changes to **Ready** at two members.
- Empty, whitespace-only and duplicate names are rejected with inline messages.
  Duplicate detection ignores case and repeated spaces.
- Names are limited to 32 characters.
- Every member receives a unique id (`crypto.randomUUID()` where available).
- Members can be removed, and the status and remaining slots update immediately.
- Group data is in memory only. Refreshing resets the app.

### Out of scope for Day 1

Totals, balances, LocalStorage, API calls, routing, authentication and deployment.

## Day 2 behaviour

- Expenses unlock only when the group has at least two members.
- The paid-by select is generated from the current group members.
- Description, amount and payer are all required.
- Amounts must be numeric, greater than zero and limited to two decimals.
- Valid decimal amounts are stored as numbers and displayed in INR.
- Every expense receives a unique id. The payer is stored by member id.
- The newest expense is prepended to the expense array and listed first.
- A successful submission clears the form and returns focus to Description.
- Removing a member keeps existing expenses readable through a payer name
  snapshot, while the paid-by select updates to the remaining members.
- Empty guidance is written outside the cards as a hand-drawn, arrow-led note.
  Empty lists render no inner header and no boxed empty-state panel.
- The note changes with the current step: add people, log an expense, or read
  the newest-first history.
- The hand-drawn note uses the existing UI sans family, so no third typeface is
  introduced.
- Expenses are held in memory only and are cleared by a page refresh.

### Out of scope for Day 2

Expense totals, equal shares, balances, expense deletion, LocalStorage, API
calls, routing, authentication and deployment.

## React concepts used

- **`useState`** owns the member array, expense array and validation messages.
- **Lifting state up** keeps group data and expense data in `App` so both feature
  cards read from the same member list.
- **Custom hooks** (`useGroupMembers`, `useExpenses`) separate business rules from
  presentation.
- **Controlled inputs** keep member names and every expense field in React state.
- **Derived state** computes the group status, remaining slots, expense lock and
  limits from array lengths instead of duplicating those values.
- **`useCallback`** keeps event handlers stable and documents dependencies.
- **`useId` and `useRef`** provide accessible form relationships and manage
  focus after a successful add.
- **Array updates** use functional `setExpenses((current) => [expense, ...current])`
  so the newest expense is added without mutating the existing array.
- **List keys** use permanent member and expense ids, never array indexes.
- **Component communication** flows down through props and back up through
  callbacks, keeping forms reusable and state ownership clear.
- **Conditional rendering** keeps empty list headers and rows out of the cards
  until real data exists.
- **Derived guidance** computes the hand-drawn note from the member and expense
  counts, so the page always points to the next useful action.
- **Payer identity** is stored as a member id; a display-name snapshot keeps old
  expense rows readable after a member is removed.

## Manual validation

1. Run `npm run dev` and open the printed URL.
2. Submit an empty group name. Submit a spaces-only name. Both should show an error.
3. Add `Aman`. Try `aman` and ` Aman `. Both should be rejected as duplicates.
4. Add a second member. The group status should change from Empty to Ready, and
   the hand-drawn note should move from “Start here” to “One more” as the first
   person is added.
5. Confirm that the expense form unlocks and the paid-by select lists both
   members. The external note should now point to the expense form. Neither card
   should show an inner “Members” or “Expense log” empty-state box.
6. Add members up to six. The group form should lock at six with no seventh input.
7. Remove a group member. The group form should unlock and the counter should drop.
8. Remove members until fewer than two remain. Expense fields should disable, the
   card should return to Locked, and the note should point back to the group form.
9. With two or more members, submit an empty expense. Then try a description with
   no amount, amounts `-5`, `0`, `abc` and `12.345`, and a valid amount with no
   payer. Each case should show a specific inline message.
10. Add `Dinner at Miso` for `1250.75`, paid by Riya. The row should show the
    description, `Paid by Riya` and `₹1,250.75`. The form should reset, the
    counter should show `1 logged`, and the note should switch to the history
    message.
11. Add another expense. It should appear above the first one.
12. Remove Riya. The existing expense should still show `Paid by Riya`, while the
    paid-by select should only list current members.
13. Resize to 390px and 320px. The notes should stack above their cards with a
    downward arrow, remain outside the card borders and cause no horizontal
    scrolling.
14. Confirm the brand and hero display type keep the original Instrument Serif,
    while the hand-drawn note uses the existing UI sans family.
15. Check the browser console. It should contain no errors or warnings.

## Next steps

Day 3 can add equal-split calculations and balances. Expense deletion,
LocalStorage, the backend and authentication arrive later in the internship.
