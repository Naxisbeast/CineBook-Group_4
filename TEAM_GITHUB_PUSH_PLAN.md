# CineBook Team GitHub Push Plan

Use this plan so everyone can contribute without overwriting each other.

## Important Rule

Do not push directly to `main`.

Each person must:

1. Clone the repo.
2. Create their own branch.
3. Add only their assigned files.
4. Commit.
5. Push their branch.
6. Open a Pull Request into `main`.

## First-Time Setup For Each Teammate

```powershell
git clone https://github.com/Naxisbeast/CineBook-Group_4.git
cd CineBook-Group_4
git checkout main
git pull origin main
```

Then create your assigned branch:

```powershell
git checkout -b phase3/your-section-name
```

After copying or editing your assigned files:

```powershell
git status
git add path/to/your/file1 path/to/your/file2
git commit -m "Add Phase 3 your section"
git push origin phase3/your-section-name
```

Then go to GitHub and open a Pull Request from your branch into `main`.

## File Ownership

Only edit the files assigned to your section. This avoids merge conflicts.

| Person | Branch | Files To Own |
|---|---|---|
| Thapelo | `phase3/tables-constraints` | `database/oracle/schema.sql`, final integration, README updates |
| Thato | `phase3/indexes-views` | `database/oracle/indexes_views.sql`, `backend/routes/movies.js`, `backend/routes/shows.js`, `backend/routes/seats.js` |
| Ncobile | `phase3/seed-data` | `database/oracle/seed.sql`, `database/mysql/seed.sql` |
| Dineo | `phase3/frontend-movies` | `frontend/src/pages/HomePage.jsx`, `frontend/src/pages/MoviePage.jsx`, `frontend/src/components/MovieCard.jsx`, `frontend/src/components/MovieHero.jsx` |
| Clifford | `phase3/booking-payment` | `frontend/src/pages/BookingPage.jsx`, `frontend/src/pages/PaymentPage.jsx`, `frontend/src/components/BookingSummary.jsx`, `backend/routes/bookings.js`, `backend/routes/payments.js` |
| Banele | `phase3/components-extra` | `database/oracle/extra.sql`, `frontend/src/components/SeatGrid.jsx`, `frontend/src/components/SeatLegend.jsx`, `frontend/src/components/BookingConfirmation.jsx`, `frontend/src/components/Navbar.jsx` |
| Tshepo | `phase3/auth-profile` | `backend/routes/auth.js`, `backend/middleware/verifyToken.js`, `frontend/src/pages/LoginPage.jsx`, `frontend/src/pages/RegisterPage.jsx`, `frontend/src/pages/ProfilePage.jsx`, `frontend/src/context/AuthContext.jsx` |

## Query File Decision

Queries will not be split between separate files.

Keep the final Phase 3 queries in:

```text
database/oracle/queries.sql
```

If Dineo and Clifford need to show contribution, they can each prepare their query comments and testing notes, but only one person should push the final `queries.sql` file. This avoids both people editing the same file and causing a conflict.

Recommended ownership:

```text
Thapelo owns final database/oracle/queries.sql integration.
Dineo documents queries 1-5.
Clifford documents queries 6-10.
```

## What Thapelo Should Push Separately

Thapelo should push the files that nobody else owns, for example:

```text
README.md
backend/db/db.js
backend/env.example
backend/server.js
backend/routes/admin.js
backend/routes/images.js
backend/routes/manager.js
backend/middleware/requireRole.js
backend/services/emailService.js
database/oracle/queries.sql
database/mysql/schema.sql
frontend/package.json
frontend/package-lock.json
frontend/index.html
frontend/postcss.config.cjs
frontend/tailwind.config.cjs
frontend/vite.config.js
frontend/src/App.jsx
frontend/src/index.css
frontend/src/main.jsx
frontend/src/services/api.js
frontend/src/utils/roles.js
frontend/src/components/Footer.jsx
frontend/src/components/LoyaltyBadge.jsx
frontend/src/components/MovieImage.jsx
frontend/src/components/ShowCard.jsx
frontend/src/components/SkeletonCard.jsx
frontend/src/data/mockData.js
frontend/src/pages/AdminDashboard.jsx
frontend/src/pages/ManagerDashboard.jsx
```

## How Thapelo Can Stage Only His Files

Use `git add` with explicit paths. Do not run `git add .` when teammates still need to push their parts.

Example:

```powershell
git checkout -b phase3/integration-polish

git add README.md
git add backend/db/db.js backend/env.example backend/server.js
git add backend/routes/admin.js backend/routes/images.js backend/routes/manager.js
git add backend/middleware/requireRole.js backend/services/emailService.js
git add database/oracle/queries.sql database/mysql/schema.sql
git add frontend/package.json frontend/package-lock.json frontend/index.html
git add frontend/postcss.config.cjs frontend/tailwind.config.cjs frontend/vite.config.js
git add frontend/src/App.jsx frontend/src/index.css frontend/src/main.jsx
git add frontend/src/services/api.js frontend/src/utils/roles.js
git add frontend/src/components/Footer.jsx frontend/src/components/LoyaltyBadge.jsx frontend/src/components/MovieImage.jsx frontend/src/components/ShowCard.jsx frontend/src/components/SkeletonCard.jsx
git add frontend/src/data/mockData.js
git add frontend/src/pages/AdminDashboard.jsx frontend/src/pages/ManagerDashboard.jsx

git status
git commit -m "Integrate CineBook full-stack polish"
git push origin phase3/integration-polish
```

Then open a Pull Request into `main`.

## Pull Request Order

Merge in this order:

1. `phase3/tables-constraints`
2. `phase3/seed-data`
3. `phase3/indexes-views`
4. `phase3/components-extra`
5. `phase3/auth-profile`
6. `phase3/frontend-movies`
7. `phase3/booking-payment`
8. `phase3/integration-polish`

The integration branch should be last because it connects everything together.

## GitHub Main Branch Protection

In GitHub:

1. Go to the repository.
2. Open `Settings`.
3. Open `Branches`.
4. Add a branch protection rule for `main`.
5. Enable:
   - Require a pull request before merging.
   - Require approvals if your lecturer wants clear review history.
   - Block force pushes.
   - Do not allow direct pushes to `main`.

This makes sure teammates cannot accidentally overwrite the final work.

## Emergency Rule If People Are Pushing Wrong Files

If teammates are already pushing into folders they do not own:

1. Do not merge their Pull Requests yet.
2. Tell them to stop pushing to `main`.
3. Turn on branch protection for `main`.
4. Ask them to create a new clean branch from the latest `main`.
5. Ask them to copy only their assigned files into that branch.
6. Ask them to open a new Pull Request.
7. Close the messy Pull Request.

If someone already pushed bad files directly to `main`, do not panic. Thapelo should create a clean integration branch from the last good version, re-apply the correct files, test the full project, then merge that clean branch.

The safest project-manager rule is:

```text
Team members may push to their own branches.
Only Thapelo merges into main.
No direct pushes to main.
No git add .
```

## Before Anyone Opens A Pull Request

Each teammate should run:

```powershell
git status
git pull origin main
```

Then test their part if possible.

Frontend test:

```powershell
cd frontend
npm install
npm run build
```

Backend test:

```powershell
cd backend
npm install
npm run dev
```

Database test:

Run the assigned SQL file in Oracle SQL Developer and confirm there are no errors.

## What Not To Do

Do not:

- Run `git add .` unless you are responsible for every changed file.
- Edit another teammate's assigned files.
- Push to `main` directly.
- Rerun seed data on a database where you want to keep newly registered users.
- Merge PRs randomly without checking the order above.
