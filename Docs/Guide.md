# Step-by-step Implementation Guide — Flight Ticketing Web Service

This document is a practical step-by-step guide you can paste into the project file for implementation. It is written so Cursor / Windsurf (or any assistant coder) can take each step as a task and produce code. Each step contains concrete sub-tasks, endpoints, DB schema fields, acceptance criteria, and a ready-to-copy prompt you can give to the assistant.

---

## Recommended stack (pick one; these prompts assume **FastAPI + React + PostgreSQL**)

- **Backend:** FastAPI (Python)
- **ORM / Migrations:** SQLAlchemy + Alembic
- **Auth:** JWT (using `pyjwt` or `fastapi-jwt-auth`) + password hashing (bcrypt)
- **Frontend:** React (Vite) + Tailwind CSS + React Router
- **HTTP client:** axios or fetch; optional React Query / SWR
- **DB:** PostgreSQL
- **Background jobs (optional):** Redis + RQ / Celery / APScheduler for reminders
- **Dev / Deploy:** Docker & docker-compose, optionally host on Railway / Heroku / PythonAnywhere

---

## Repository layout (monorepo suggestion)

```
/ (repo root)
├─ backend/
│  ├─ app/
│  │  ├─ main.py
│  │  ├─ api/            # routers: auth, users, flights, tickets, admin, company
│  │  ├─ core/           # settings, security, jwt helpers
│  │  ├─ models/         # SQLAlchemy models
│  │  ├─ schemas/        # Pydantic schemas
│  │  ├─ crud/           # DB operations
│  │  └─ services/       # business logic (booking, refunds, stats)
│  ├─ alembic/
│  └─ Dockerfile
├─ frontend/
│  ├─ src/
│  │  ├─ pages/
│  │  ├─ components/
│  │  ├─ services/      # API calls
│  │  └─ App.jsx
│  └─ Dockerfile
├─ infra/
│  └─ docker-compose.yml
├─ docs/
│  ├─ tech-spec.md
│  └─ step-by-step.md   # this file
└─ README.md
```

---

# Phase 0 — Project initialization (Dev environment)

**Goal:** Create repo, docker compose, skeleton backend and frontend so you can iterate quickly.

**Tasks:**

1. Initialize git repo, add `.gitignore`, README.
2. Create `backend/` and `frontend/` folders, basic `Dockerfile` and `docker-compose.yml` with services: `db`, `backend`, `frontend`.
3. Add `.env.example` (DB URL, JWT_SECRET, etc.).

**Acceptance:** Running `docker-compose up --build` creates containers for backend and PostgreSQL (frontend optional) without crashing.

**Cursor prompt (copy):**

```
Create a FastAPI project skeleton in `backend/` with an entry `main.py` and router mounting. Add Dockerfile and a docker-compose.yml that starts postgres and the backend. Include .env.example with placeholders: DATABASE_URL, JWT_SECRET, ACCESS_TOKEN_EXPIRE_MINUTES.
```

---

# Phase 1 — Authentication & Roles

**Goal:** Implement registration, login, and role-based access.

**DB model (Users):**

- id: UUID / SERIAL (PK)
- name: string
- email: string (unique)
- password_hash: string
- role: enum('USER','COMPANY_MANAGER','ADMIN')
- is_active: boolean
- created_at, updated_at

**Endpoints:**

- `POST /api/auth/register` — body: {name, email, password, role?}
- `POST /api/auth/login` — body: {email, password} → returns `{access_token, token_type, expires_in}`
- `GET /api/users/me` — returns current user info

**Security:**

- Passwords hashed with bcrypt
- JWT access tokens signed with JWT_SECRET; include `sub=user_id` and `role` in payload
- Dependency to assert role on protected routes

**Acceptance:**

- Users can register and login; token allows access to `/api/users/me`.
- Role-based decorator blocks normal users from company/admin routes.

**Cursor prompt (copy):**

```
Implement FastAPI auth: User SQLAlchemy model, Pydantic schemas, register and login endpoints with bcrypt and JWT. Include dependency `get_current_user` and `require_role(role)` for route protection. Use DATABASE_URL from environment.
```

---

# Phase 2 — Database models & migrations

**Goal:** Create core models and schema migrations for Flights, Tickets, AirlineCompany.

**Flights model:**

- id: UUID / SERIAL
- company_id -> AirlineCompany.id (FK)
- flight_number: string
- origin: string (IATA or city)
- destination: string
- departure_time: timestamp
- arrival_time: timestamp
- duration_minutes: integer (or computed)
- stops: integer
- price: numeric (decimal)
- seats_total: integer
- seats_available: integer
- active: boolean
- created_at, updated_at

**Tickets model:**

- id: UUID / SERIAL
- user_id -> Users.id
- flight_id -> Flights.id
- status: enum('PAID','REFUNDED','CANCELED')
- confirmation_id: string (unique)
- price_paid: numeric
- purchased_at: timestamp
- canceled_at: timestamp nullable

**AirlineCompany model:**

- id, name, is_active, manager_id (FK to Users), created_at

**Migrations:**

- Use Alembic to initialize migrations and create initial schema.

**Acceptance:**

- Tables created and accessible; foreign keys enforced.

**Cursor prompt (copy):**

```
Create SQLAlchemy models for Users, AirlineCompany, Flights, Tickets. Add Alembic revision for initial schema. Ensure fields and FKs match the spec. Add uniqueness on Users.email and Tickets.confirmation_id.
```

---

# Phase 3 — Search API & Flight details

**Goal:** Implement search with filters and flight details.

**Endpoint:**

- `GET /api/flights` query params:

  - origin, destination, date (YYYY-MM-DD), passengers, min_price, max_price, stops, airline, sort
  - pagination: limit, offset

- `GET /api/flights/{flight_id}` returns details + seats_available

**Search behavior:**

- Filter by origin/destination (partial match), date range (departure_time between day start and end), price range, stops, airline/company
- Sort by price or departure_time

**Acceptance:**

- Searching returns matching flights, pages correctly, and data includes flight id and pricing.

**Cursor prompt (copy):**

```
Add `/api/flights` GET endpoint implementing search with filters origin, destination, date, min_price, max_price, stops, airline, and pagination. Implement `/api/flights/{id}` to return details and seats_available.
```

---

# Phase 4 — Booking / Ticket purchase flow

**Goal:** Allow users to buy tickets, prevent oversell, generate confirmation ID.

**Endpoint:**

- `POST /api/flights/{flight_id}/book`

  - body: { passengers: [{name, birthdate?}], payment_method: 'placeholder' }
  - Auth required (USER)
  - Steps inside transaction:

    1. Verify seats_available >= passengers_count
    2. Deduct seats (transactional update)
    3. Create Ticket row(s) with `status='PAID'` and `confirmation_id` generated
    4. Return `{confirmation_id, tickets: [...]}`

**Confirmation ID pattern:** `CONF-{YYYYMMDDHHMMSS}-{random6}` or use UUID truncated for readability.

**Cancel rules:**

- `DELETE /api/tickets/{ticket_id}` or `POST /api/tickets/{ticket_id}/cancel`

  - If `flight.departure_time - now >= 24 hours` → mark `status='REFUNDED'` and `seats_available += 1` and `refunded=True`
  - Else → mark `status='CANCELED'` (no refund), `seats_available += 1`

**Acceptance:**

- Cannot book more seats than available; seats decrement transactionally; booking returns confirmation id.
- Cancellation enforces 24-hour rule and updates ticket and seats accordingly.

**Cursor prompt (copy):**

```
Implement `POST /api/flights/{flight_id}/book` with DB transaction: check seats_available, decrement atomically, create Ticket(s) with status PAID and generated confirmation_id. Implement cancellation endpoint that enforces 24-hour refund rule and restores seats. Return clear error codes for insufficient seats and invalid cancels.
```

---

# Phase 5 — Company Manager dashboard APIs

**Goal:** Company managers can CRUD flights, set seat counts and pricing, view passenger lists and company stats.

**Endpoints:**

- `POST /api/company/flights` — create flight (company manager only)
- `PUT /api/company/flights/{id}` — edit
- `DELETE /api/company/flights/{id}`
- `GET /api/company/flights` — list company's flights (filters: upcoming, completed)
- `GET /api/company/flights/{id}/passengers` — list tickets for that flight
- `GET /api/company/stats?start=&end=&period=` — returns: total_flights_created, active_flights, completed_flights, total_passengers, total_revenue

**Acceptance:**

- Manager can only manage flights for their company.
- Stats endpoints compute sums and counts for given range.

**Cursor prompt (copy):**

```
Create company routes under `/api/company/*` for flight CRUD and passenger listing. Add `GET /api/company/stats` returning counts and revenue aggregated by date range, restricted to manager's company.
```

---

# Phase 6 — Admin APIs

**Goal:** Admin can manage users, companies and landing content.

**Endpoints:**

- `GET /api/admin/users`, `PATCH /api/admin/users/{id}` (block/unblock)
- `GET /api/admin/companies`, `POST /api/admin/companies`, `PATCH /api/admin/companies/{id}` (assign manager, deactivate)
- `POST /api/admin/content/banners` — create/update landing banners
- `GET /api/admin/stats` — platform-wide stats (same shape as company stats)

**Acceptance:**

- Admin-only access enforced.

**Cursor prompt (copy):**

```
Implement admin routes for user management (list, block/unblock), company CRUD and content/banners management. Add platform-level statistics endpoint aggregating across companies.
```

---

# Phase 7 — Frontend pages & components (React)

**Goal:** Build UI pages & components to match backend APIs. Prioritize functionality over polish for demo reliability.

**Pages to implement (minimum viable):**

1. **LandingPage** — SearchBar, OffersSlider, Login/Signup buttons
2. **SearchResults** — list flights with filters (price slider, stops selector, airline), sort controls
3. **FlightDetails** — detailed info + "Book" button leading to checkout
4. **Checkout** — passenger form, confirm booking; show confirmation id on success
5. **UserDashboard** — My Bookings (list by confirmation id), Flight Schedules
6. **CompanyDashboard** — List/Create/Edit flights, Passengers list, Stats
7. **AdminPanel** — Users table, Companies table, Content editor, Stats

**Components:**

- `SearchBar`, `FlightCard`, `Pagination`, `FilterPanel`, `BookingForm`, `TicketCard`, `StatsChart`

**API details:**

- Use `services/api.js` to centralize axios + auth token handling.
- Store token in memory or secure storage (localStorage acceptable for demo but mention security note).

**Acceptance:**

- User can search → open flight → book → see confirmation on the dashboard.

**Cursor prompt (copy):**

```
Create React LandingPage and SearchResults page. Implement SearchBar component that calls `/api/flights` with query params and displays FlightCard components with price, time, airline and a link to FlightDetails.
```

---

# Phase 8 — Stats & Reporting (backend + frontend)

**Goal:** Implement endpoints and UI to show counts and revenue per company and platform.

**API shape examples:**

- `GET /api/company/stats?start=2025-01-01&end=2025-01-31`

  ```json
  {
    "total_flights": 42,
    "active_flights": 12,
    "completed_flights": 30,
    "total_passengers": 1234,
    "total_revenue": "12345.67"
  }
  ```

**Frontend:** Use a simple chart library or just show numbers; a table and small line chart suffices.

**Acceptance:** Aggregations match the DB queries and respect time filters.

**Cursor prompt (copy):**

```
Add stats endpoints for company and admin. Implement sums/counts and allow date range filters. Return numbers and a simple time-series bucketed daily.
```

---

# Phase 9 — Notifications (bonus)

**Options:**

1. **Browser push**: use Web Push API (service worker) and background job that schedules a push 24 hours / 3 hours before departure.
2. **Email**: integrate SMTP or third-party (SendGrid) and schedule email reminders.

**Implementation (simple):**

- Add a `reminders` background worker (APScheduler or Celery) to check upcoming flights and push reminders to users who have tickets.

**Acceptance:** At least one functional reminder channel (console log or email) demonstrates the feature.

**Cursor prompt (copy):**

```
Implement a reminder job that runs every 15 minutes and logs (or sends) reminders for flights departing in 24 hours. Use a simple APScheduler setup for demo if Celery is heavy.
```

---

# Phase 10 — Testing & QA

**Goal:** Ensure core flows work.

**Tests to add:**

- Backend unit tests for: auth, flight search, booking (including insufficient seats), cancel rules.
- Integration tests: booking flow end-to-end using test DB.
- Frontend: smoke tests with Playwright / Cypress for: search → book → see confirmation.

**Acceptance:** Tests pass locally in CI and on the dev machine.

**Cursor prompt (copy):**

```
Add pytest tests for auth, flights search, and booking endpoints. Include fixtures for test DB and a sample flight with seats for booking tests.
```

---

# Phase 11 — Docker & Deployment

**Goal:** Make a reproducible deployment setup. Provide scripts to run migrations and start app.

**Deliverables:**

- `Dockerfile` for backend and frontend
- `docker-compose.yml` with services: db, backend, frontend
- `entrypoint` script in backend that runs Alembic migrations before start
- `deploy.md` with steps for chosen host (example: Heroku, Railway, or PythonAnywhere notes)

**Cursor prompt (copy):**

```
Create Dockerfile for backend (uvicorn + gunicorn optional). Add docker-compose.yml with postgres and backend. Add entrypoint script to run alembic upgrade head on container start.
```

---

# Engineering details & recommended constraints

1. **Booking transaction:** Use DB transaction and `SELECT ... FOR UPDATE` or ORM equivalent to lock flight row while decrementing seats.
2. **Money type:** Use `numeric`/`decimal` in DB. Avoid float.
3. **Timezones:** Store datetimes in UTC; convert to user's timezone on the client. Use ISO8601 in APIs.
4. **Confirmation codes:** Keep human-friendly but unique. Index them.
5. **Pagination & rate-limiting:** Add pagination to large lists and basic rate limiting for public endpoints.
6. **Logs & errors:** Return structured errors with HTTP status codes and log server-side exceptions.

---

# How to split tasks for Cursor / Windsurf (copy-ready prompt templates)

Below are short, copy-paste prompts; feed them one-by-one to the assistant to implement each step.

**Initialize repo + docker-compose:**

```
Create project skeleton: FastAPI backend in `backend/` with main.py, Dockerfile; docker-compose.yml with services: postgres, backend. Add .env.example file.
```

**Auth implementation:**

```
Implement user registration and login with JWT. Add Users model, schemas, register/login endpoints and dependency get_current_user. Use bcrypt for password hashing.
```

**Models & migrations:**

```
Add SQLAlchemy models for AirlineCompany, Flights, Tickets. Create alembic initial migration. Ensure FK constraints and indexes.
```

**Search & flight details:**

```
Add GET /api/flights with filters origin,destination,date,min_price,max_price,stops,airline; add GET /api/flights/{id}.
```

**Booking flow:**

```
Add POST /api/flights/{flight_id}/book implementing transactional seat decrement, ticket creation, confirmation_id generation. Add cancel endpoint with 24-hour refund rule.
```

**Company routes & stats:**

```
Add company routes for flight CRUD, passengers list and GET /api/company/stats aggregated by date range.
```

**Admin routes & content:**

```
Add admin routes for user management, company management, and banner/content CRUD. Add /api/admin/stats for platform-wide metrics.
```

**Frontend landing + search:**

```
Create React LandingPage with SearchBar and SearchResults page. Implement SearchBar to call GET /api/flights with query params and display FlightCard components.
```

**Deploy config:**

```
Add Dockerfile and docker-compose, and an entrypoint script that runs alembic migrations. Provide deploy.md for Heroku/Railway instructions.
```

---

# Definition of Done (for each major feature)

- **Code implemented** and merged to `main` (or dev branch)
- **Automated tests** exist for critical paths
- **Basic UI** implements the flow end-to-end (not necessarily pretty)
- **Docs**: README updated with run and deploy instructions
- **Demo**: You can sign up, login, search, book a ticket, and view it in the dashboard.

---

## Final notes & security reminders

- This guide focuses on a minimal but correct implementation ideal for classroom/demo use. For production consider PCI compliance if you accept real payments.
- Use HTTPS and secure storage for secrets.
- Consider rate limiting, input validation, and stronger auth (refresh tokens) if expanding.

---

If you want, I can split this file into smaller, numbered task files (one prompt per task) ready to paste to Cursor/Windsurf. Say "split into tasks" and I'll produce them.
