# SplitEasy

A frontend-only shared expense app for small groups. Built as the Week 1 project
for the **CodGen MERN Full Stack internship**.

> **Day 1 scope:** project foundation, design system, application shell and
> group management. Expense management, balances, persistence, authentication
> and backend services are intentionally not part of this build.

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
│   │   │   ├── EmptyState.jsx # Reusable empty-state presentation
│   │   │   └── Icons.jsx      # Inline SVG icons
│   │   ├── GroupManager.jsx   # Group setup container
│   │   ├── Header.jsx         # Centered brand and section navigation
│   │   ├── MemberForm.jsx     # Controlled add-member form and validation
│   │   └── MemberList.jsx     # Empty state and removable member rows
│   ├── hooks/
│   │   └── useGroupMembers.js # Group state, rules and actions
│   ├── styles/
│   │   ├── index.css          # Style entry point
│   │   ├── tokens.css         # Colour, type, spacing and radius tokens
│   │   ├── base.css           # Reset, global elements, accessibility helpers
│   │   ├── layout.css         # Header, intro and page grid
│   │   └── components.css     # Reusable UI and feature components
│   ├── utils/
│   │   ├── id.js              # Unique member ids
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

Expenses, totals, equal shares, balances, LocalStorage, API calls, routing,
authentication and deployment.

## React concepts used

- **`useState`** owns the member array and validation message.
- **Lifting state up** keeps group data in `App` so future expense features can
  use the same source of truth.
- **Custom hooks** (`useGroupMembers`) separate business rules from presentation.
- **Controlled inputs** keep the member name field in React state.
- **Derived state** computes the group status, remaining slots and limits from
  `members.length` instead of duplicating those values.
- **`useCallback`** keeps event handlers stable and documents dependencies.
- **`useId` and `useRef`** provide accessible form relationships and manage
  focus after a successful add.
- **List keys** use permanent member ids, never array indexes.

## Manual validation

1. Run `npm run dev` and open the printed URL.
2. Submit an empty field. Submit a spaces-only name. Both should show an error.
3. Add `Aman`. Try `aman` and ` Aman `. Both should be rejected as duplicates.
4. Add a second member. The group status should change from Empty to Ready.
5. Add members up to six. The form should lock at six with no seventh input.
6. Remove a member. The form should unlock and the counter should decrease.
7. Resize to 390px and 320px. The layout should remain usable.
8. Check the browser console. It should contain no errors.

## Next steps

Day 2 adds the expense form, expense list and equal-split totals. LocalStorage,
the backend and authentication arrive later in the internship.
