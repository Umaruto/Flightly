1. Project skeleton & global setup

Goal: Create the app shell, routing, global styles, Tailwind, and an API helper file.

What to create

frontend/ Vite React app (TypeScript)

src/main.tsx, src/App.tsx

src/index.css + Tailwind config

src/router.tsx (React Router)

src/services/api.ts — centralized axios instance + env BASE_URL switch

src/contexts/AuthContext.tsx (auth provider skeleton)

API dependency

None (uses mock until integration)

Acceptance

npm run dev loads a blank app with a header and routes: /, /login, /signup.

Prompt

Create a Vite React (TypeScript) project skeleton in frontend/ with Tailwind configured. Add App, Router, and an axios service file `src/services/api.ts` that reads base URL from env. Create an AuthContext provider skeleton and mount it in main.tsx. Add routes: /, /login, /signup.

2. Authentication UI (Login & Signup) — UI + local mock

Goal: Build login/signup forms, client validation, and token storage (demo: localStorage).

Files/components

src/pages/Login.tsx, src/pages/Signup.tsx

src/components/AuthForm.tsx (shared)

Update AuthContext to store token and user, with login() & logout() functions.

API endpoints (mock)

POST /api/auth/register

POST /api/auth/login

GET /api/users/me

Acceptance

Fill form → click Login/Signup → AuthContext.login() stores token and navigates to /dashboard. For now responses come from mock (MSW or a local JSON).

Prompt

Create Login and Signup pages with forms and client validation. Implement AuthContext.login that stores a token in localStorage and fetches user profile (mock). Use AuthForm component shared by both pages. After login navigate to /dashboard.

3. Landing page & Search bar (UI only)

Goal: Landing page with search bar; build components for search input and filters.

Files/components

src/pages/Landing.tsx

src/components/SearchBar.tsx (origin, destination, date, passengers)

src/components/OffersSlider.tsx (static mock banners)

API endpoints (mock)

GET /api/flights?origin=&destination=&date=

Acceptance

Enter search → clicking “Search” routes to /search?origin=...&date=... (no backend yet) and shows query in UI.

Prompt

Create Landing page with a SearchBar component (origin, destination, date, passengers) and an OffersSlider. Searching should navigate to /search with query params.

4. Search Results page & FlightCard

Goal: Show a paginated list of flights using mock data, create FlightCard component with key info.

Files/components

src/pages/SearchResults.tsx

src/components/FlightCard.tsx

src/components/Pagination.tsx

Add src/mocks/flights.json (sample flights)

API endpoints (mock)

GET /api/flights → returns paginated list

Acceptance

/search shows FlightCard list generated from mock data; clicking a card goes to /flights/:id.

Prompt

Create SearchResults page that queries /api/flights (mock) with query params and renders FlightCard components. Add Pagination component and use local flights.json as mock data.

5. Flight Details page

Goal: Show full flight info, seats available, and a Book button that goes to Checkout.

Files/components

src/pages/FlightDetails.tsx

src/components/FlightInfo.tsx

API endpoints

GET /api/flights/:id

Acceptance

Visiting /flights/:id displays full details from mock and a "Book" button that opens checkout modal or navigates to /checkout?flight=:id.

Prompt

Create FlightDetails page that fetches /api/flights/:id (mock) and displays details (airline, times, layovers, seats available). Add a Book button that navigates to /checkout with flight id.

6. Checkout & Booking flow (mock payments)

Goal: Build checkout UI, passenger form, summary and submit flow that returns a confirmation id (mock).

Files/components

src/pages/Checkout.tsx

src/components/PassengerForm.tsx

src/components/BookingSummary.tsx

API endpoints (mock)

POST /api/flights/:flight_id/book → returns { confirmation_id, tickets: [...] }

Acceptance

Fill passenger info → Submit → show confirmation page with confirmation id and ticket details. Save booking to local user state so it appears in My Bookings.

Prompt

Create Checkout page with PassengerForm and BookingSummary. Submit form posts to /api/flights/:flight_id/book (mock) and returns confirmation_id. On success show Confirmation page and save booking into AuthContext's user bookings (mock).

7. User Dashboard — My Bookings & Flight Schedules

Goal: Build user dashboard that lists bookings, allows cancel, view schedule.

Files/components

src/pages/Dashboard/UserDashboard.tsx

src/components/TicketCard.tsx

API endpoints

GET /api/users/me/bookings

POST /api/tickets/:ticket_id/cancel

Acceptance

Dashboard lists bookings (from mock), each TicketCard shows status and Cancel button. Cancel triggers mock API and updates UI.

Prompt

Create UserDashboard page that fetches /api/users/me/bookings (mock) and renders TicketCard components. Implement Cancel action calling /api/tickets/:id/cancel (mock) and update UI state.

8. Company Manager Dashboard (split into 3 micro-tasks)

Break into tiny tasks so Copilot can implement each easily:

8.1 — Company flights list & create

GET /api/company/flights, POST /api/company/flights

Pages: CompanyDashboard/FlightsList.tsx, CompanyDashboard/FlightForm.tsx

Prompt

Create Company Flights list page and a FlightForm to create a new flight. Use mock endpoints /api/company/flights (GET/POST). Restrict route to COMPANY_MANAGER role.

8.2 — Flight edit & passenger list

PUT /api/company/flights/:id, GET /api/company/flights/:id/passengers

Prompt

Create flight edit page and passengers list page under company dashboard. Implement passengers listing from /api/company/flights/:id/passengers (mock).

8.3 — Company stats UI

GET /api/company/stats?start=&end=

Prompt

Add Company stats page that fetches /api/company/stats and displays totals and a simple chart or numbers.

9. Admin Panel (split)

9.1 — Users management

GET /api/admin/users, PATCH /api/admin/users/:id (block/unblock)

Prompt

Create Admin Users page that lists users and allows block/unblock via /api/admin/users and /api/admin/users/:id (mock).

9.2 — Companies & content

GET/POST/PUT /api/admin/companies, POST /api/admin/content/banners

Prompt

Create Admin Companies page and a simple Banner content editor for landing page. Use mock endpoints.

9.3 — Admin stats

GET /api/admin/stats

Prompt

Create Admin Stats page that fetches /api/admin/stats and displays platform-wide metrics.

10. Shared UI pieces, styling & responsiveness

Goal: Create a component library and responsive layout.

What to do

Create src/components/Header.tsx, Footer.tsx, Sidebar.tsx, Container.tsx.

Create src/components/ui/\* (Button, Input, Select, Modal).

Ensure mobile & desktop breakpoints via Tailwind.

Prompt

Build a simple UI component library: Header, Footer, Container, Button, Input, Modal. Ensure responsive layout and mobile nav.

11. State management, caching & error handling

Goal: Add React Query (or SWR) to manage server state and cache search/bookings.

What to implement

Wrap app in QueryClientProvider.

Use useQuery for /api/flights and /api/users/me/bookings.

Show loading & error states consistently.

Prompt

Integrate React Query into the app. Replace direct fetches for flights and bookings with useQuery hooks and add global error/loading handling.

12. Testing & Storybook (component dev)

Goal: Write smoke tests and optionally component stories.

What to implement

Add Playwright/Cypress smoke tests for: search → flight → checkout → dashboard.

Add Storybook (optional) and stories for FlightCard, TicketCard, forms.

Prompt

Add Playwright smoke test that runs the key flow: search -> view flight -> checkout -> confirm and then verifies booking appears in dashboard (use mock endpoints).

13. Integrate with backend (switch from mock → real)

Goal: Replace mocks with real API endpoints in a controlled way.

Steps

Make src/services/api.ts read VITE_API_BASE_URL and VITE_USE_MOCK env variables.

Use MSW (Mock Service Worker) during development; when VITE_USE_MOCK=false MSW is disabled.

Replace mock responses with real API calls and adapt data shapes if needed.

Test end-to-end with test backend.

Acceptance

Setting VITE_USE_MOCK=false makes frontend call real backend and flows still work.

Prompt

Add env toggle VITE_USE_MOCK to switch between MSW mock handlers and real API. Implement logic in api.ts to use base URL from VITE_API_BASE_URL. Document how to turn off mocks.

14. Polish, performance & deploy

Goal: Final UI polish, accessibility checks, and produce a production build + deployment instructions.

What to do

Lighthouse quick check

Build npm run build

Create Dockerfile for frontend and add to docker-compose

Deploy on chosen host

Prompt

Prepare the frontend for production build. Add Dockerfile and update docker-compose to serve bui
