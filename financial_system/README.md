# Financial System

A simple shared-expense tracker that lets roommates or student groups record spending, calculate individual balances, and receive settlement suggestions. The backend exposes a REST API built with Express, while the frontend is a Vite + React single-page app.

## Features

- Record expenses with payer, category, amount, description, and involved participants.
- In-memory storage to keep the setup lightweight (ready for a database later).
- Automatic balance calculation for every participant.
- Greedy settlement suggestions that show who should pay whom.
- Modern UI designed for quick data entry and at-a-glance insights.

## Project Structure

```
financial_system/
├── backend/
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── controllers/
│       ├── data/
│       ├── routes/
│       ├── services/
│       └── utils/
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── main.jsx
│       ├── components/
│       └── services/
└── README.md
```

## Getting Started

### 1. Run the API server

```powershell
cd financial_system/backend
npm install
npm run dev
```

The API listens on `http://localhost:5000` by default.

### 2. Run the React app

```powershell
cd financial_system/frontend
npm install
npm run dev
```

Vite exposes the UI at `http://localhost:5173`. During development, all requests to `/api/*` are proxied to `http://localhost:5000` (configure `VITE_API_BASE_URL` if you change ports).

## REST API

### POST `/api/expenses` (alias `/api/expense`)

Creates a new expense.

```json
{
  "payer": "Sara",
  "amount": 60000,
  "category": "Groceries",
  "participants": ["Ali", "Sara", "Mojtaba"],
  "description": "Dinner ingredients"
}
```

### GET `/api/expenses` (alias `/api/expense`)

Returns the stored expenses array.

### DELETE `/api/expenses/:id` (alias `/api/expense/:id`)

Removes a previously stored expense.

### GET `/api/balance`

Returns:

```json
{
  "balances": [
    { "member": "Ali", "balance": -20000 },
    { "member": "Mojtaba", "balance": 40000 },
    { "member": "Sara", "balance": -20000 }
  ],
  "settlements": [
    { "from": "Ali", "to": "Mojtaba", "amount": 20000 },
    { "from": "Sara", "to": "Mojtaba", "amount": 20000 }
  ]
}
```

## Customization Ideas

- Persist data with MongoDB, PostgreSQL, or SQLite.
- Add authentication so each group has a private workspace.
- Generate charts (pie/bar) to visualize spending categories.
- Integrate push notifications or WebSockets for real-time updates among multiple users.
- Support multiple currencies and exchange rates.

## Notes

- The backend keeps everything in memory for clarity; restarting the server resets data.
- All numbers are normalized to two decimal places when balances and settlements are calculated.
- The UI labels use Persian copy to match the project brief, but you can translate strings inside `frontend/src/components` easily.
