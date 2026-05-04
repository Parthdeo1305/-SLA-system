# Product Specification — Shipment Tracking System (STS)
**Version:** 1.0  
**Status:** Approved for Development  
**Date:** April 2026  
**Owner:** Product & Engineering

---

## 1. Problem Statement

Logistics operations teams lose money and customer trust every day because they lack real-time visibility into shipment status. Delayed orders go undetected for hours. Operations managers spend their mornings manually calling warehouses to find out what's late. By the time they act, the SLA window has already closed.

**The cost is real:**
- Every delayed shipment can trigger contractual penalty clauses (commonly 0.5–2% of shipment value per day late).
- Operations teams spend 2–4 hours per shift on status calls instead of exception handling.
- Customer satisfaction drops sharply after the first missed delivery commitment.

**What we're building:**  
A centralised Shipment Tracking System (STS) that gives logistics teams a single source of truth for all shipments, automatically flags SLA breaches the moment they happen, and lets managers take action without leaving the dashboard.

---

## 2. User Personas

### 👤 Operations Manager — "Sarah"
**Goal:** Full operational visibility. No surprises at end of shift.  
**Frustration:** Finding out a shipment was delayed 3 hours after the SLA expired.  
**Uses STS for:** Morning briefing dashboard, delayed shipments list, escalations.  
**Needs:**
- At-a-glance summary of delayed vs. on-track shipments
- Delay duration clearly displayed (not just "delayed")
- Ability to update status and add notes on exceptions

---

### 👤 Warehouse Staff — "Raj"
**Goal:** Log accurate status updates quickly, without errors.  
**Frustration:** Complex forms, unclear status flows.  
**Uses STS for:** Marking pickups, dispatching shipments, confirming deliveries.  
**Needs:**
- Simple status progression (Created → Picked → In Transit → Delivered/Failed)
- Mobile-friendly update interface
- Immediate confirmation after status update

---

### 👤 Admin — "Alex"
**Goal:** Control who accesses the system; ensure data integrity.  
**Frustration:** Shared logins, no audit trail.  
**Uses STS for:** User management, reviewing system health, onboarding new staff.  
**Needs:**
- Role-based access control
- Full order history
- Ability to create/deactivate users

---

## 3. Scope

### ✅ In Scope (v1.0)

| Feature | Description |
|---|---|
| Authentication | Sign up, login, JWT-based sessions, protected routes |
| Order Management | Create, view, update orders with full status lifecycle |
| SLA Breach Detection | Automatic flagging when `currentTime > promisedDeliveryTime && status ≠ Delivered` |
| Delay Duration Display | Human-readable delay (e.g., "Delayed by 2h 15m") |
| Dashboard | KPI summary cards, orders table, filter by status/delayed |
| Role System | Admin, Operations Manager, Warehouse Staff |
| Seed Data | 20 sample shipments for demo purposes |
| API | RESTful JSON API with rate limiting and validation |

### ❌ Out of Scope (v1.0)

| Feature | Reason |
|---|---|
| Real-time WebSocket updates | Complexity; planned for v2 |
| Email/SMS notifications | Third-party dependency; future roadmap |
| Map-based tracking | Requires GPS integration |
| Customer-facing portal | Separate product; out of current charter |
| Billing & invoicing | Finance system integration needed |
| Microservices architecture | Monolith first, split when scale demands |
| Mobile native app | Web-first, responsive design covers this for now |

---

## 4. Assumptions

1. **Single Tenant v1:** All users belong to one logistics organisation. Multi-tenancy is deferred.
2. **SLA = Promised Delivery Time:** The SLA deadline is set at order creation as a `promisedDeliveryTime` timestamp.
3. **SLA is computed server-side:** The backend always computes `isDelayed` dynamically at query time — no batch jobs needed.
4. **Statuses are linear:** The status flow is sequential. Reversing a status (e.g., Delivered → In Transit) is not permitted in v1.
5. **UTC Timestamps:** All timestamps stored in UTC; frontend displays in local time.
6. **MongoDB hosted locally or on Atlas:** No managed relational DB required.
7. **No real carrier integration:** Shipment data is entered manually by warehouse staff.

---

## 5. Acceptance Criteria

### Authentication
- [x] A new user can register with name, email, and password
- [x] A registered user can log in and receive a valid JWT
- [x] Accessing `/dashboard` without a valid JWT redirects to `/login`
- [x] Logout invalidates the session and redirects to `/login`
- [x] Invalid credentials return a 401 with a clear error message

### Order Management
- [x] An authenticated user can create an order with: customer name, promised delivery time
- [x] Created orders default to status `Created`
- [x] A user can update an order's status following the allowed flow: `Created → Picked → In Transit → Delivered / Failed`
- [x] Each order displays: Order ID, Customer Name, Status, Created Time, Promised Delivery Time, Last Updated

### SLA Breach Detection
- [x] An order is automatically marked `Delayed` when `currentTime > promisedDeliveryTime` AND `status ≠ Delivered` AND `status ≠ Failed`
- [x] Delay duration is displayed in human-readable format: "Delayed by Xh Ym"
- [x] Orders due within the next 60 minutes display "Due in X minutes" as a warning
- [x] Delivering an order that was delayed clears the delayed flag

### Dashboard
- [x] Summary cards display: Total Orders, Delivered, In Transit, Delayed (count)
- [x] Delayed card is highlighted in red
- [x] Orders table shows all orders with colour-coded status badges
- [x] Filter by status (Created, Picked, In Transit, Delivered, Failed) works correctly
- [x] "Show Delayed Only" toggle filters to delayed orders only

### Performance & Security
- [x] API rate limited to 100 requests per 15 minutes per IP
- [x] Passwords hashed with bcrypt (min cost 10)
- [x] JWT secret is configurable via environment variable
- [x] All API inputs validated server-side; invalid inputs return 400 with field-level errors
