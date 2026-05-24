# Smart Offer Slot Booking System

A production-ready SaaS MVP for service-based businesses (restaurants, gyms, salons, clinics, turfs, coaching classes) to publish limited-time offer slots, and for customers to reserve them in real time with high operational reliability.

This repository contains the complete full-stack codebase submitted for the Willovate Hackathon. It features a robust multi-tenant backend architecture with strong transaction boundaries, optimistic concurrency control for slot bookings, a highly responsive public and admin dashboard, and high-quality frontend UI implementation in React + TypeScript.

---

## 🚀 Mandatory Tech Stack & Architecture

- **Frontend**: React (v19), TypeScript, Tailwind CSS, Vite (v8), TanStack Query (v5), React Router DOM (v7), React Hook Form, Zod (Validation).
- **Backend**: .NET 8 Web API, C#, Entity Framework Core, PostgreSQL (Database Provider), AutoMapper, FluentValidation, System.Text.Json.
- **Database**: PostgreSQL (relational storage with index optimizations for date range queries, active statuses, and unique reference indices).
- **API Documentation**: Swagger/OpenAPI with pre-configured JWT Bearer authentication controls.

---

## 📦 Project Structure

```text
├── Backend/                                # .NET 8 Web API
│   ├── Common/                             # Core API Response models and base DTOs
│   ├── Controllers/                        # REST Controllers with dual singular/plural endpoints
│   ├── Data/                               # EF Core Database Context, Configurations, and Migrations
│   ├── DTOs/                               # Layer-decoupled Request and Response DTOs
│   ├── Exceptions/                         # Domain-specific custom exceptions
│   ├── Extensions/                         # Dependency Injection and Startup Extensions
│   ├── Helpers/                            # Cryptographically secure random generators
│   ├── Interfaces/                         # Service contracts (IBookingService, IOfferService, etc.)
│   ├── Mappings/                           # AutoMapper Profile mapping models to DTOs
│   ├── Middleware/                         # Global Exception Handler and Auth Middlewares
│   ├── Models/                             # DB Entities (User, Business, Offer, OfferSlot, Booking)
│   ├── Services/                           # Business logic layers enforcing transactional boundaries
│   └── Validators/                         # FluentValidation schemas for input sanitization
│
├── Frontend/                               # React + TypeScript SPA
│   ├── public/                             # Static assets and favicons
│   ├── src/
│   │   ├── api/                            # Axios client with request interceptors for JWT Bearer
│   │   ├── components/                     # Core reusable UI elements (Buttons, Badges, Modals)
│   │   ├── constants/                      # Route maps and endpoint definitions
│   │   ├── hooks/                          # Accessibility (A11y) dialog traps and utility hooks
│   │   ├── layouts/                        # Admin, Public, and Auth layout wrappers
│   │   ├── pages/                          # Screen Views (Dashboard, Bookings, Public Directory)
│   │   ├── routes/                         # Lazy-loaded Router configuration
│   │   ├── services/                       # API integration modules mapping axios promises
│   │   ├── styles/                         # Tailwind CSS global styles
│   │   ├── types/                          # TypeScript type definitions and interfaces
│   │   └── utils/                          # Currency, Date, and HTTP error formatters
```

---

## 🎨 Implemented Screens (100% Fully Functional)

The following eight core screens are built, integrated, and fully functional:
1. **Admin Login Page**: Secure authentication verifying emails and passwords, persisting JWT credentials.
2. **Admin Dashboard**: Live business metrics aggregate panel (Total/Active Offers, Bookings, Capacity, Utilization Rate, Conversion Rates) with recent reservations.
3. **Create Offer Page**: Clean slide-over modal for creating multi-slot promotions.
4. **Manage Offers Page**: Detailed offer manager with inline status triggers (Active, Pause, Expired) and Slot Management drawer.
5. **Manage Bookings Page**: Multi-status reservation tracker (Completed, No Show, Cancelled) with instant action triggers and custom data export.
6. **Public Offer Listing Page**: Customer-facing promotional directory with advanced responsive filters (Business Type, Category, Date, Price, Available Only) and dynamic countdown clocks.
7. **Public Offer Detail Page**: Deep-dive promotional details displaying location coordinates, terms and conditions, and full slot lists.
8. **Booking Confirmation Page**: Post-reservation portal showing receipt summary, reference number, and a dynamically rendered, printable QR Code.

---

## ⚡ Concurrency & Business Rules Engine

The booking system operates on a rigorous transactional boundary to prevent double-booking and data inconsistencies.

1. **Optimistic Concurrency (DbUpdateConcurrencyException)**:
   - When a booking request is made, the backend fetches the `OfferSlot`.
   - The slot records a concurrency token (`RowVersion` or timestamp) along with `BookedCount`.
   - When updating the slot during seat deduction, EF Core verifies that the slot has not been updated since it was read. If another transaction modified the slot concurrently, a `DbUpdateConcurrencyException` is thrown, rolls back the transaction, and the client receives a distinct **409 Conflict** error.
2. **Differentiated Concurrency UX**:
   - The frontend intercepts the **409 Conflict** response. Instead of showing a generic error toast, it renders a custom **Booking Collision Alert** modal, prompts the user about the real-time seat depletion, automatically refetches active slots in the background, and requests the user to pick an alternate slot.
3. **Strict Domain Rules Enforced**:
   - Offers price must be strictly less than the original price.
   - Bookings are blocked if the target slot has reached capacity or if the request is placed after the slot's end time.
   - Same-phone booking threshold prevents spamming.
   - Booking reference codes are cryptographically generated and unique.

---

## 🎁 Bonus Features Included

- **Dynamic QR Code Generation**: Instant ticket check-in mapping via scannable QR Codes generated per booking.
- **Client-Side CSV Export**: Download and backup business reservations directly from the Admin Bookings panel in standard UTF-8 CSV format.
- **Countdown Expiry Timers**: Public listing cards display high-accuracy ticking timers showing time left before the slot closes.
- **Calender & Print-Friendly Receipts**: The confirmation page is formatted for printing receipts with physical print stylesheets.

---

## 🔑 REST API Documentation

The system exposes high-performance REST endpoints with strict validation.

### Authentication
- `POST /api/auth/login`: Authenticates user credentials. Returns JWT Token, Expiration, and User details.

### Businesses
- `POST /api/businesses` / `/api/business`: Creates a new Business Profile (Admin only).
- `GET /api/businesses` / `/api/business`: Fetches all businesses.
- `PUT /api/businesses/{id}` / `/api/business/{id}`: Modifies a business profile.
- `DELETE /api/businesses/{id}`: Restricts removal of businesses (validates empty businesses only).

### Offers
- `POST /api/offers`: Creates a promotional offer.
- `GET /api/offers`: Lists offers with advanced query parameters (Category, Type, Search, Page).
- `GET /api/offers/{id}`: Fetches detailed offer metadata.
- `PUT /api/offers/{id}`: Edits offer details.
- `DELETE /api/offers/{id}`: Deletes an offer.
- `POST /api/offers/{id}/activate`: Promotes an offer to `Active`.
- `POST /api/offers/{id}/pause`: Pauses an active offer.

### Slots
- `POST /api/slots`: Schedules a new slot under an offer.
- `GET /api/slots`: Fetches slots.
- `GET /api/offers/{offerId}/slots`: Fetches all slots under a specific offer.
- `PUT /api/slots/{id}`: Edits slot timings and capacity.
- `DELETE /api/slots/{id}`: Cancels/Deletes a slot.

### Bookings
- `POST /api/bookings`: Submits a booking request (Validates limits, dates, and concurrency).
- `GET /api/bookings`: Lists all bookings under multi-tenant scopes.
- `GET /api/bookings/{id}`: Retrieves guest booking receipt anonymously for confirmation screen.
- `PUT /api/bookings/{id}/status`: Updates reservation attendance (Confirmed, Cancelled, Completed, NoShow).

### Dashboard
- `GET /api/dashboard/summary`: Computes aggregate tenant stats (Conversion, BookedSeats, Total/Active Offers, utilization).

---

## 🛠️ Step-by-Step Installation & Setup

### Prerequisites
- .NET 8.0 SDK
- Node.js (v18+) & npm
- PostgreSQL Database Server

---

### 1. Database Setup

Create a local PostgreSQL database:
```sql
CREATE DATABASE smart_offer_booking;
```

---

### 2. Backend Setup

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Copy the `.env.example` file and configure it with your local credentials:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` (or `appsettings.json` / `appsettings.Development.json`) and verify:
   - Make sure `ConnectionStrings__DefaultConnection` has the correct `Host`, `Port`, `Username`, and `Password` to access your PostgreSQL.
   - Adjust `Jwt__SigningKey` with a strong 32-character secret key.
4. Install Entity Framework Core CLI tools if you haven't:
   ```bash
   dotnet tool install --global dotnet-ef
   ```
5. Apply database migrations to update your local schema:
   ```bash
   dotnet ef database update
   ```
6. Restore dependencies and start the backend:
   ```bash
   dotnet restore
   ```
   ```bash
   dotnet run
   ```
The backend server will launch at:
- Secure: `https://localhost:7084`
- HTTP: `http://localhost:5084`
- Swagger Documentation: `https://localhost:7084/swagger/index.html`

---

### 3. Frontend Setup

1. Navigate to the `Frontend` directory:
   ```bash
   cd ../Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Verify the API target URL in `.env`:
   ```env
   VITE_API_BASE_URL=https://localhost:7084/api
   ```
5. Run the frontend local development server:
   ```bash
   npm run dev
   ```
The application will launch at `http://localhost:5173`. Open it in your web browser to interact with the full stack booking system.

---

### 🔐 Seeded Test Accounts

Use the pre-seeded credentials inside `Backend/Data/Seed/` to test both tenant and administrative roles immediately:

- **Admin/Business Owner**: `admin@willovate.com` / `willovate123`
- **Demo Business**: Fully populated Salon & Spa Profile with active demo weekend and happy hour offers, and multiple slots scheduled.

---

## 🛡️ Hackathon Originality & Intellectual Property Notice
- Built from scratch specifically for the Willovate Hackathon submission.
- Fully compliant with terms regarding originality, open-source attribution, and integrated rights.
