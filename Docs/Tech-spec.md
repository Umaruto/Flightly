Flight Ticketing Web Service
1. Overview
The system is a web application where:
    ● Users can search, view, and buy flight tickets.
    ● Users can view their purchased tickets and flight schedules if logged in
    ● Airline companies can manage their own flights via a company dashboard.
    ● Administrators can manage users, companies, and the overall platform.
    ● The system supports browser notifications for flight reminders (bonus)

2. Functional Requirements
    2.1 User Features
    1. Landing Page
        ○ Advertisement banners slider (promote your service or some cool offer).
        ○ Flight search (origin, destination, date, passengers).
        ○ Highlighted offers.
        ○ Login / Sign up.
    2. Authentication
        ○ User registration and login.
        ○ User roles:
        ■ Regular User
        ■ Company Manager
        ■ Admin
    3. Dashboard (for Regular Users)
        ○ Search available flights with filters (price, airline, time, stops).
        ○ View flight details (airline, flight number, duration, layovers).
        ○ Buy tickets (simple checkout, mark as paid in system) -> return confirmation id
        ○ View purchased tickets (with booking details) by confirmation id. 
        ○ View flight schedules.
        ○ Tickets can be canceled up to 24 hours before the flight → the user receives a
        refund (system just marks “refunded”). Non-refundable period: Tickets canceled
        less than 24 hours before the flight → no refund (system marks “canceled”) 
2.2 Airline Company Dashboard
    1. Management:
        ○ Add, edit, and delete flights.
        ○ Set seat availability and pricing.
        ○ View list of passengers booked on their flights.
    2. Statistics of the Company
        ○ View total number of flights created.
        ○ View number of active (upcoming) and completed flights.
        ○ See total number of passengers booked.
        ○ View total revenue earned (sum of all ticket sales).
        ○ Basic time filters for statistics (e.g., today, this week, this month, all time).
2.3 Admin Panel
    1. User Management
        ○ View all users, block/unblock.
    2. Airline Company Management
        ○ Add new airline companies.
        ○ Assign company managers. 
        ○ Remove or deactivate companies.
    3. Content Management
        ○ Update landing page banners and featured offers.
    4. Statistics of the Service
        ○ View total number of flights created.
        ○ View number of active (upcoming) and completed flights.
        ○ See total number of passengers booked.
        ○ View total revenue earned (sum of all ticket sales).
        ○ Basic time filters for statistics (e.g., today, this week, this month, all time).
3. Other Requirements
    ● Responsive design.
    ● Basic reliability: system should function smoothly for classroom/demo usage.
    ● Implementation must be a web application (any technology stack may be used).
4. Bonus: Deployment
    ● Deploy the system to make it publicly accessible (e.g., using pythonanywhere.com,
    Heroku, or similar hosting services).