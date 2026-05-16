# CineBook — Online Movie Ticket Booking System

CineBook is a full-stack web application built as a CMPG 311 Database Systems group project by 8 students. It allows users to browse movies, view show schedules, select seats, book tickets, and make payments online.

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React.js (Vite), Tailwind CSS, React Router, Axios |
| Backend    | Node.js, Express.js                             |
| Database   | MySQL                                           |
| Auth       | JWT, bcrypt                                     |
| Dev Tools  | dotenv, nodemon, mysql2, cors                   |

---

## Project Structure

```
cinebook/
├── .gitignore
├── README.md
├── database/
│   ├── oracle/           # Phase 3 Oracle SQL Developer submission files
│   ├── mysql/            # MySQL schema + seed for the web app
│   ├── schema.sql        # Older working file kept for reference
│   ├── seed.sql          # Older working file kept for reference
│   └── queries.sql       # Older working file kept for reference
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   ├── db/db.js
│   ├── middleware/verifyToken.js
│   └── routes/
│       ├── auth.js
│       ├── movies.js
│       ├── shows.js
│       ├── seats.js
│       ├── bookings.js
│       └── payments.js
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── index.js
        ├── App.jsx
        ├── services/api.js
        ├── context/AuthContext.jsx
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── MoviePage.jsx
        │   ├── BookingPage.jsx
        │   ├── PaymentPage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── ProfilePage.jsx
        └── components/
            ├── Navbar.jsx
            ├── MovieCard.jsx
            ├── SeatGrid.jsx
            └── BookingConfirmation.jsx
```

---

## Setup Instructions

### Prerequisites

- Node.js >= 18
- MySQL >= 8
- npm >= 9

### 1. Database Setup

#### Oracle SQL Developer (Phase 3 submission)

Run these files in this order:

```sql
database/oracle/schema.sql
database/oracle/seed.sql
database/oracle/indexes_views.sql
database/oracle/extra.sql
database/oracle/queries.sql
```

#### MySQL (React + Node app)

```bash
mysql -u root -p < database/mysql/schema.sql
mysql -u root -p cinebook_db < database/mysql/seed.sql
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy the environment template and fill in your values
copy env.example .env
# Edit .env with your MySQL credentials and a JWT secret
# Optional: add TMDB_API_KEY or TMDB_ACCESS_TOKEN for poster/backdrop fallback images
# Optional: add SMTP settings to send real ticket confirmation emails

# Start the development server
npm run dev
```

The backend will run on **http://localhost:5000**.

### Email Setup

Welcome emails are sent after successful registration. Ticket emails are sent after a successful payment.

For development, you can leave email disabled:

```env
EMAIL_ENABLED=false
```

The backend will print the ticket email preview in the backend terminal.

For real emails, add SMTP settings to `backend/.env`:

```env
EMAIL_ENABLED=true
MAIL_FROM="CineBook <your_email@example.com>"
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password_or_app_password
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start the Vite dev server
npm run dev
```

The frontend will run on **http://localhost:5173**.

---

## Running the Project

1. Ensure MySQL is running and the database has been initialised.
2. Start the backend: `cd backend && npm run dev`
3. Start the frontend: `cd frontend && npm run dev`
4. Open **http://localhost:5173** in your browser.

### Test Credentials (from seed data)

| Role     | Email                   | Password   |
|----------|-------------------------|------------|
| Administrator | admin@cinebook.co.za | Admin123 |
| Cinema Manager | manager.sandton@cinebook.co.za | Test123 |
| Customer | customer@test.co.za | Test123 |

Role-specific pages:

- Customers use `/profile` for booking history and loyalty status.
- Administrators and System Administrators use `/admin` for users, movies, shows, bookings, and revenue.
- Cinema Managers use `/manager` for theatre-scoped shows, bookings, occupancy, and revenue.
- `/dashboard` redirects each signed-in user to the correct page for their role.

---

## Group Members

CMPG 311 Database Systems — Group Project (8 members)
