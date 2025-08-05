# 📅 Scheduler Service for Event Notifications

A full-stack web application that allows authenticated users to schedule messages at a future date/time and track their status in real-time.

## 🚀 Features

- ✅ User login with secure password hashing and JWT-based authentication
- ✅ Schedule messages to be sent in the future
- ✅ Message delivery status tracking (Scheduled, Sent, Failed, Retried)
- ✅ Retry failed deliveries up to 3 times with simulated failure (10% chance)
- ✅ View only your own scheduled messages
- ✅ Styled and responsive React + Vite frontend
- ✅ MySQL database integration with Prisma ORM
- ✅ Redis + Bull queue for scheduled execution
- ✅ Polling-based real-time updates
- ✅ Messages are sent to console as simulation

---

## 🛠️ Tech Stack

| Layer    | Technology        |
| -------- | ----------------- |
| Frontend | React + Vite      |
| Backend  | Node.js + Express |
| Auth     | JWT + bcrypt      |
| Queue    | Redis + Bull      |
| ORM      | Prisma            |
| Database | MySQL             |

---

## 📦 Project Structure

scheduler/
│
├── backend/
│ ├── index.js # Express server + Redis queue logic
│ ├── prisma/
│ │ ├── schema.prisma # DB schema
│ │ └── ...
│ └── seed.js # Script to seed test user
│
├── frontend/
│ ├── src/
│ │ └── App.jsx # Main UI logic
│ ├── App.css
│ └── ...
│
├── .env # Environment variables (DB + Redis)
└── package.json
