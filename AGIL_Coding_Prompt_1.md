# AGIL — Fuel Distribution Management System

## Project overview

Build a full-stack web application for managing AGIL's fuel truck distribution to customers across Tunisian governorates. Two distinct interfaces: **Admin** (full CRUD + truck management) and **Customer** (browse trucks, order compartments by gas type).

## Tech stack

- **Frontend**: Angular 17+ (standalone components, Angular Material or Bootstrap, RxJS)
- **Backend**: NestJS (TypeScript, modular architecture)
- **Database**: MySQL 8+ with TypeORM
- **Auth**: JWT (access + refresh tokens), bcrypt for password hashing
- **API style**: REST, JSON
- **Folder structure**: monorepo with `/frontend` (Angular) and `/backend` (NestJS), separate `package.json` each, optional `docker-compose.yml` at root

---

## Business domain

### Entities and constraints

**1. User (base)**
- Fields: `id`, `email` (unique), `passwordHash`, `role` (`ADMIN` | `CUSTOMER`), `createdAt`
- Two role types: Admin and Customer (table inheritance or single-table with role column — pick single-table)

**2. Admin**
- One row in `users` table with `role = ADMIN`
- Full system access

**3. Customer**
- Linked to one User row + extra profile (`customers` table)
- Fields: `userId` (FK), `fullName`, `phone`, `placeId` (FK, unique)
- Belongs to exactly one Place (1-to-1, permanent)

**4. GovernorateGroup**
- Logical grouping of governorates for route optimization
- Fields: `id`, `name` (e.g. "North", "Center", "South")
- Trucks are assigned to one group and can only travel within it

**5. Governorate**
- 24 Tunisian governorates (Tunis, Ariana, Ben Arous, Manouba, Bizerte, Nabeul, Zaghouan, Beja, Jendouba, Kef, Siliana, Sousse, Monastir, Mahdia, Kairouan, Kasserine, Sidi Bouzid, Sfax, Gabes, Medenine, Tataouine, Gafsa, Tozeur, Kebili)
- Fields: `id`, `name`, `governorateGroupId` (FK)
- Belongs to one GovernorateGroup

**6. Place**
- Specific delivery location (customer's address/site)
- Fields: `id`, `name`, `governorateId` (FK), `customerId` (FK, unique nullable)
- One Place is permanently linked to one Customer (`customerId` is unique)
- When admin creates a customer, they must assign a place; that place becomes locked to that customer

**7. Truck**
- Fields: `id`, `name` (unique, e.g. "CAM-201"), `governorateGroupId` (FK), `status` (`AVAILABLE` | `IN_TRANSIT` | `MAINTENANCE`), `totalCapacity` (computed, ≤ 32)
- Maximum **10 trucks total** in the system (enforce at creation: count trucks, reject if = 10)
- Each truck serves exactly one GovernorateGroup
- Truck has 6 or 7 compartments (variable)

**8. Compartment**
- Fields: `id`, `truckId` (FK), `position` (1–7), `capacity` (in units, where 1 unit = 1000 m³), `gasType` (nullable — set when ordered), `isAvailable` (bool)
- Sum of all compartment capacities per truck must be ≤ 32 units
- 5 fixed combos allowed at truck creation (admin picks one):
  - Combo A: `[7, 7, 5, 4, 6, 3]` (6 compartments, sum = 32)
  - Combo B: `[6, 6, 6, 5, 5, 4]` (6 compartments, sum = 32)
  - Combo C: `[7, 6, 4, 4, 3, 2, 5]` (7 compartments, sum = 31)
  - Combo D: `[7, 7, 5, 4, 4, 3, 2]` (7 compartments, sum = 32)
  - Combo E: `[7, 7, 6, 4, 3, 3, 2]` (7 compartments, sum = 32)
- `gasType` is assigned **dynamically** when a customer places an order (not locked at truck creation)
- After an order is delivered, the compartment becomes available again with `gasType = null`

**9. GasType (enum)**
- `GASOIL`, `GASOIL_SSP`, `GASOIL_SSF` — exactly 3 types, no others

**10. Order**
- Fields: `id`, `customerId` (FK), `createdAt`, `status` (`PENDING` | `CONFIRMED` | `DELIVERED`), `totalQuantity` (computed)
- Lifecycle: `PENDING` (customer placed) → `CONFIRMED` (admin approved) → `DELIVERED` (admin marked done)
- Cancelling allowed only while `PENDING`

**11. OrderItem**
- Fields: `id`, `orderId` (FK), `compartmentId` (FK), `gasType` (enum), `quantity` (units)
- One OrderItem reserves one Compartment
- `quantity` must equal the compartment's `capacity` (compartments are not subdivided)
- Multiple OrderItems can belong to one Order, across multiple Trucks (as long as all those Trucks serve the customer's governorate group)
- Different OrderItems in the same Order can have different `gasType` values (customer can mix gas types in one order — even across compartments of the same truck)

---

## Business rules (enforce in backend)

1. **Truck cap**: Max 10 trucks. Creating an 11th → 400 error.
2. **Compartment combo**: Must match one of the 5 allowed combos at truck creation. After creation, compartments cannot be added/removed.
3. **Total capacity ≤ 32 units** per truck.
4. **Place 1-to-1 with Customer**: Cannot assign a place that's already linked to another customer.
5. **Group routing**: When customer browses trucks, only show trucks whose `governorateGroupId` matches the customer's governorate group (via `customer → place → governorate → group`).
6. **Compartment availability**: Only show compartments where `isAvailable = true` AND parent truck `status = AVAILABLE`.
7. **Order creation**:
   - Lock the chosen compartments atomically (transaction): set `isAvailable = false`, set `gasType` to what the customer chose.
   - If any compartment was taken between the customer's browse and submit, fail with 409 Conflict.
8. **Status transitions**:
   - Order: `PENDING → CONFIRMED → DELIVERED` (no skipping, no going back).
   - Truck: any → any, but warn if changing to `MAINTENANCE` while compartments are reserved.
9. **On `DELIVERED`**: Release all compartments belonging to this order (`isAvailable = true`, `gasType = null`).
10. **On Order cancel (only while PENDING)**: Release compartments same as above.
11. **Auth**: All routes require JWT except `/auth/login`. Customer routes check `role = CUSTOMER`; admin routes check `role = ADMIN`.

---

## REST API endpoints

### Auth
- `POST /auth/login` → `{ accessToken, refreshToken, user }`
- `POST /auth/refresh` → `{ accessToken }`
- `POST /auth/logout`

### Admin — Trucks
- `GET /admin/trucks` (filters: status, group)
- `POST /admin/trucks` (body: `{ name, governorateGroupId, comboKey }` where comboKey is A/B/C/D/E)
- `GET /admin/trucks/:id` (includes compartments)
- `PATCH /admin/trucks/:id` (name, group, status)
- `DELETE /admin/trucks/:id` (only if no active orders reference its compartments)

### Admin — Governorate groups
- `GET /admin/governorate-groups`
- `POST /admin/governorate-groups`
- `PATCH /admin/governorate-groups/:id`
- `DELETE /admin/governorate-groups/:id`

### Admin — Governorates
- `GET /admin/governorates`
- `POST /admin/governorates`
- `PATCH /admin/governorates/:id` (rename, reassign group)
- `DELETE /admin/governorates/:id`

### Admin — Places
- `GET /admin/places` (filters: governorate, unassigned)
- `POST /admin/places`
- `PATCH /admin/places/:id`
- `DELETE /admin/places/:id`

### Admin — Customers
- `GET /admin/customers`
- `POST /admin/customers` (body: `{ email, password, fullName, phone, placeId }` — creates User + Customer atomically)
- `PATCH /admin/customers/:id`
- `DELETE /admin/customers/:id` (also frees the place: set `customerId = null`)

### Admin — Orders
- `GET /admin/orders` (filters: status, customer, dateRange)
- `GET /admin/orders/:id`
- `PATCH /admin/orders/:id/confirm` (PENDING → CONFIRMED)
- `PATCH /admin/orders/:id/deliver` (CONFIRMED → DELIVERED, frees compartments)

### Customer — Trucks & ordering
- `GET /customer/trucks` (returns only AVAILABLE trucks in customer's governorate group, with available compartments)
- `GET /customer/trucks/:id` (compartments breakdown)
- `POST /customer/orders` (body: `{ items: [{ compartmentId, gasType }] }`)
- `GET /customer/orders` (own orders only)
- `GET /customer/orders/:id`
- `DELETE /customer/orders/:id` (only PENDING)

### Profile
- `GET /me` (returns user + customer profile or admin info)

---

## Database schema (MySQL DDL)

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','CUSTOMER') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE governorate_groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(80) UNIQUE NOT NULL
);

CREATE TABLE governorates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(80) UNIQUE NOT NULL,
  governorate_group_id INT NOT NULL,
  FOREIGN KEY (governorate_group_id) REFERENCES governorate_groups(id)
);

CREATE TABLE places (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  governorate_id INT NOT NULL,
  customer_id INT UNIQUE NULL,
  FOREIGN KEY (governorate_id) REFERENCES governorates(id)
);

CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30),
  place_id INT UNIQUE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (place_id) REFERENCES places(id)
);

ALTER TABLE places
  ADD CONSTRAINT fk_place_customer
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

CREATE TABLE trucks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(40) UNIQUE NOT NULL,
  governorate_group_id INT NOT NULL,
  status ENUM('AVAILABLE','IN_TRANSIT','MAINTENANCE') DEFAULT 'AVAILABLE',
  total_capacity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (governorate_group_id) REFERENCES governorate_groups(id)
);

CREATE TABLE compartments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  truck_id INT NOT NULL,
  position INT NOT NULL,
  capacity INT NOT NULL,
  gas_type ENUM('GASOIL','GASOIL_SSP','GASOIL_SSF') NULL,
  is_available BOOLEAN DEFAULT TRUE,
  UNIQUE KEY uk_truck_position (truck_id, position),
  FOREIGN KEY (truck_id) REFERENCES trucks(id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  status ENUM('PENDING','CONFIRMED','DELIVERED') DEFAULT 'PENDING',
  total_quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  compartment_id INT NOT NULL,
  gas_type ENUM('GASOIL','GASOIL_SSP','GASOIL_SSF') NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (compartment_id) REFERENCES compartments(id)
);
```

---

## Backend (NestJS) — module structure

```
backend/
  src/
    auth/              (login, JWT strategy, guards)
    users/             (User entity, base)
    customers/         (Customer entity, service, controller)
    admin/             (admin-only endpoints)
    trucks/            (Truck + Compartment, combo validation)
    compartments/      (queries, availability)
    governorates/      (Governorate, GovernorateGroup)
    places/            (Place CRUD + uniqueness)
    orders/            (Order, OrderItem, transactional creation)
    common/            (decorators, guards, interceptors, dto base)
    config/            (env, database, jwt)
    main.ts
    app.module.ts
  ormconfig.ts
  package.json
```

Use decorators:
- `@Roles('ADMIN')` / `@Roles('CUSTOMER')` for role guards
- Class-validator on all DTOs (`@IsEnum`, `@Min`, `@IsInt`, etc.)
- Global `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true`
- Global exception filter for clean error responses

Order creation must be **transactional** with row-level locks (`SELECT … FOR UPDATE` on compartments via QueryRunner).

---

## Frontend (Angular) — module structure

```
frontend/
  src/app/
    core/
      services/        (auth.service, api.service, token-interceptor)
      guards/          (auth.guard, role.guard)
      models/          (TypeScript interfaces matching backend DTOs)
    shared/
      components/      (data-table, confirm-dialog, status-badge, etc.)
      pipes/           (gas-type, status)
    features/
      auth/login/
      admin/
        dashboard/
        trucks/          (list, create, edit, detail)
        governorate-groups/
        governorates/
        places/
        customers/
        orders/
      customer/
        dashboard/
        browse-trucks/   (list available trucks in customer's group)
        order-builder/   (cart-like: pick compartments + assign gas type)
        my-orders/
        profile/
    app.routes.ts
    app.config.ts
  angular.json
  package.json
```

Use:
- Standalone components (Angular 17+)
- Lazy-loaded feature routes
- Reactive forms for all inputs
- HttpInterceptor for JWT + 401 refresh logic
- Route guards for role separation
- A shared `<app-truck-card>` component used in both admin list and customer browse view

---

## Customer order flow (key feature)

The order builder is the most complex screen. Spec:

1. Customer logs in → dashboard shows their place + governorate + group.
2. They click "New order" → see all trucks where `truck.governorateGroupId == customer.place.governorate.governorateGroupId` AND `truck.status == AVAILABLE`.
3. For each truck, show compartments grid: each compartment shows capacity + an "Add" button (disabled if unavailable).
4. When customer clicks "Add" on a compartment, prompt for gas type (GASOIL / GASOIL_SSP / GASOIL_SSF). Add to cart.
5. Cart sidebar shows: selected compartments, total units, ability to remove.
6. No quantity input — compartments are not subdivided. Customer takes the full compartment or nothing.
7. Customer can mix compartments across multiple trucks and multiple gas types — as long as all trucks serve their group.
8. Submit → POST `/customer/orders` with the array of `{ compartmentId, gasType }`.
9. Backend locks compartments atomically. Success → redirect to "My orders" with PENDING status.

---

## Seed data (provide a NestJS seed script)

- 1 admin user: `admin@agil.tn` / `Admin123!`
- 3 governorate groups: North, Center, South
- 24 governorates assigned to groups (North: Tunis, Ariana, Ben Arous, Manouba, Bizerte, Nabeul, Zaghouan, Beja, Jendouba, Kef ; Center: Siliana, Sousse, Monastir, Mahdia, Kairouan, Kasserine, Sidi Bouzid ; South: Sfax, Gabes, Medenine, Tataouine, Gafsa, Tozeur, Kebili)
- 5 trucks, one per combo (A through E), distributed across groups
- 3 customers in different governorates with assigned places
- A few sample orders in each status

---

## Deliverables

1. Backend with all endpoints, DTOs, guards, transactional order logic
2. Frontend with all admin pages (CRUD) and the customer order flow
3. README with setup instructions: `npm install`, `.env` template, `npm run seed`, `npm run start:dev` for both
4. Optional `docker-compose.yml` running MySQL + backend + frontend
5. Postman collection or `.http` file with example requests

## Acceptance criteria

- A customer can log in, see only the trucks for their group, build an order across multiple trucks and gas types, and submit it.
- Admin can CRUD all entities, enforce truck cap of 10, enforce combo rules, and move orders through the lifecycle.
- A second customer cannot order a compartment another customer already reserved (concurrent test passes).
- Deleting a customer frees their place; deleting a place is blocked if a customer references it.
- Truck status `MAINTENANCE` hides its compartments from customer view.
- JWT expires correctly; refresh works; 401 from frontend triggers logout.
