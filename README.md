# CineBook - Online Movie Ticket Booking System

CineBook is a full-stack cinema booking web application built as a CMPG 311 Database Systems group project at North-West University.

The system allows users to browse movies, view show schedules, select seats, make bookings, and complete payments. It also includes role-based dashboards for customers, cinema managers, and administrators.

## Project Context

This was an academic group project completed by 8 students. The goal was to design and implement a database-backed booking system while applying software engineering, database design, and full-stack development concepts.

This repository is part of my student portfolio and shows my growth in system integration, database-backed applications, teamwork, and project documentation.

## My Contribution

My contribution focused on project coordination, integration support, database/backend support, and final documentation.

Based on the project files and team planning document, I worked on:

- Project management and final integration planning.
- Database schema and table constraints for the Oracle submission.
- Supporting the final integration of database, backend, frontend, and documentation files.
- README and setup documentation.
- Supported backend integration work around server setup, database connection, environment configuration, admin/manager routes, image route support, and shared role utilities.
- Helping keep team contributions organised through branch and file ownership planning.

This was a group project, so the repository represents combined team work rather than only individual code.

## Features

- Movie browsing and movie detail pages.
- Show schedule viewing.
- Seat selection for bookings.
- Customer booking flow.
- Simulated payment flow with ticket confirmation handling.
- JWT-based authentication.
- Role-based access for customers, cinema managers, administrators, and system administrators.
- Admin dashboard for users, movies, shows, bookings, and revenue.
- Manager dashboard for theatre-scoped shows, bookings, occupancy, and revenue.
- MySQL database for the React/Node web app.
- Oracle SQL files for the academic database phase.

## Architecture

```text
CineBook/
├── backend/        Express.js API, authentication, routes, email service
├── frontend/       React + Vite user interface
├── database/
│   ├── mysql/      MySQL schema and seed data for the web app
│   └── oracle/     Oracle SQL Developer submission files
└── .github/        Team ownership and pull request templates
```

## Technologies Used

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL, Oracle SQL |
| Authentication | JWT, bcrypt |
| Email / Notifications | Nodemailer, SMTP configuration |
| Security / Middleware | Helmet, CORS, Express rate limiting |
| Tools | npm, Git, GitHub |

## Database Design

The database models the main relationships needed for a cinema booking system:

- `Users` stores customers, managers, administrators, and system administrators.
- `Movie` stores movie information.
- `Theatre`, `Screen`, and `Seat` model the cinema layout.
- `ShowSchedule` links movies to screens and show times.
- `Booking` stores customer bookings.
- `BookingSeat` connects bookings to selected seats.
- `Payment` stores payment information linked to bookings.

The project includes both MySQL files for the web app and Oracle files for the academic database submission.

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm 9+
- MySQL 8+

### 1. Database Setup

Run the MySQL schema and seed files:

```bash
mysql -u root -p < database/mysql/schema.sql
mysql -u root -p cinebook_db < database/mysql/seed.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
copy env.example .env
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Test Accounts

The seed data includes development accounts for testing.

| Role | Email | Password |
|---|---|---|
| Administrator | admin@cinebook.co.za | Admin123 |
| Cinema Manager | manager.sandton@cinebook.co.za | Test123 |
| Customer | customer@test.co.za | Test123 |

These are sample local development credentials, not production credentials.

## Screenshots

Screenshots will be added after the interface is cleaned and tested.

| Screen | Status |
|---|---|
| Home page | To be added |
| Movie details | To be added |
| Seat booking | To be added |
| Customer profile | To be added |
| Admin dashboard | To be added |
| Manager dashboard | To be added |

## What I Learned

- How frontend, backend, and database layers work together in a full-stack system.
- How role-based access changes application flow and dashboard behaviour.
- How database design supports real workflows such as bookings, seats, schedules, and payments.
- How important clear branch ownership and integration planning are in group projects.
- How to document a project so that another person can understand and run it.

## Challenges

- Coordinating work across multiple team members.
- Keeping database files aligned between Oracle academic submission files and MySQL web app files.
- Managing authentication, roles, and protected routes.
- Integrating booking, payment, and email confirmation logic.
- Keeping the repository clean while different people worked on different sections.

## Future Improvements

- Add screenshots and a short demo walkthrough.
- Remove duplicate frontend files after approval.
- Clarify which database files are active and which are academic/reference files.
- Add stronger validation and error handling.
- Add automated tests for core API routes.
- Improve mobile responsiveness and UI polish.
- Add a deployment guide if the project is hosted.

## Repository Cleanup Note

This repository is currently being polished for portfolio presentation. Some duplicate frontend files and overlapping database scripts are being reviewed before removal to avoid deleting any team work that may still be referenced.

## Academic Note

This project was built for learning purposes as part of a university group project. It is presented as a student software engineering and database systems project, not as a commercial production system.
