# AGIL — Fuel Distribution Management System

Full-stack web app (NestJS + Angular 21) for managing AGIL's fuel truck distribution.

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+

### 1. Database
Create a MySQL database:
```sql
CREATE DATABASE agil_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend
```bash
cd optbackend

# Copy and edit env
cp .env .env.local
# Edit DB_USER, DB_PASS, DB_NAME as needed

# Install dependencies (already done if you cloned)
npm install

# Seed the database
npm run seed

# Start dev server (port 3000)
npm run start:dev
```

### 3. Frontend
```bash
cd OPTfront
npm install

# Start dev server (port 4200)
npm start
```

Open [http://localhost:4200](http://localhost:4200)

## Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@agil.tn | Admin123! |
| Customer 1 (North) | client1@agil.tn | Customer123! |
| Customer 2 (Center) | client2@agil.tn | Customer123! |
| Customer 3 (South) | client3@agil.tn | Customer123! |

## .env Template

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=agil_db
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=change-me-refresh-in-production
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
```

## API Base URL
`http://localhost:3000`

## Key Endpoints

### Auth
- `POST /auth/login` — `{ email, password }`
- `POST /auth/refresh` — `{ refreshToken }`

### Admin
- `GET/POST /admin/trucks` — manage trucks (max 10, combo A–E)
- `GET/POST /admin/governorate-groups`
- `GET/POST /admin/governorates`
- `GET/POST /admin/places`
- `GET/POST /admin/customers`
- `GET /admin/orders` — filter by status/customer/date
- `PATCH /admin/orders/:id/confirm`
- `PATCH /admin/orders/:id/deliver`

### Customer
- `GET /customer/trucks` — available trucks in customer's group
- `POST /customer/orders` — `{ items: [{ compartmentId, gasType }] }`
- `GET /customer/orders`
- `DELETE /customer/orders/:id` — cancel PENDING

### Profile
- `GET /me`

## Business Rules Enforced
- Max 10 trucks (400 if exceeded)
- Compartment combos A–E only (validated at creation)
- Total capacity ≤ 32 units per truck
- Customer sees only trucks in their governorate group
- Transactional order creation with row-level locks (SELECT FOR UPDATE)
- 409 Conflict if compartment taken concurrently
- Order lifecycle: PENDING → CONFIRMED → DELIVERED (no skipping)
- Compartments released on DELIVERED or cancelled PENDING
