# Trinity Grocery - System Architecture

## Overview

Trinity Grocery is a full-stack web application designed for grocery chain management. The system follows a three-tier architecture with clear separation of concerns.

## System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        React Frontend                                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Pages     │  │ Components  │  │  Services   │  │   Context   │  │  │
│  │  │  - Login    │  │  - Layout   │  │  - api.js   │  │  - Auth     │  │  │
│  │  │  - Register │  │  - Navbar   │  │  - product  │  │             │  │  │
│  │  │  - Dashboard│  │  - Modals   │  │  - invoice  │  │             │  │  │
│  │  │  - Shop     │  │  - Cards    │  │  - report   │  │             │  │  │
│  │  │  - Cart     │  │             │  │             │  │             │  │  │
│  │  │  - Products │  │             │  │             │  │             │  │  │
│  │  │  - Invoices │  │             │  │             │  │             │  │  │
│  │  │  - Users    │  │             │  │             │  │             │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS (REST API)
                                      │ JWT Authentication
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            APPLICATION TIER                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     Node.js + Express Backend                          │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │  │
│  │  │                        Middleware Layer                           │ │  │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │ │  │
│  │  │  │  CORS   │  │  Auth   │  │  JSON   │  │  Morgan │            │ │  │
│  │  │  │         │  │  (JWT)  │  │ Parser  │  │ (Logs)  │            │ │  │
│  │  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │ │  │
│  │  └──────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │  │
│  │  │                         Routes Layer                              │ │  │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │ │  │
│  │  │  │  Auth   │  │ Products│  │Invoices │  │ Reports │            │ │  │
│  │  │  │ Routes  │  │ Routes  │  │ Routes  │  │ Routes  │            │ │  │
│  │  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │ │  │
│  │  └──────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │  │
│  │  │                      Controllers Layer                            │ │  │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │ │  │
│  │  │  │  Auth   │  │ Product │  │ Invoice │  │ Report  │            │ │  │
│  │  │  │Controller│ │Controller│ │Controller│ │Controller│            │ │  │
│  │  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │ │  │
│  │  └──────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │  │
│  │  │                       Services Layer                              │ │  │
│  │  │  ┌─────────────────────┐  ┌─────────────────────┐               │ │  │
│  │  │  │  OpenFoodFacts      │  │  Report Service     │               │ │  │
│  │  │  │  Service            │  │  (KPIs, Analytics)  │               │ │  │
│  │  │  └─────────────────────┘  └─────────────────────┘               │ │  │
│  │  └──────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │  │
│  │  │                        Models Layer                               │ │  │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │ │  │
│  │  │  │  User   │  │ Product │  │ Invoice │  │  Item   │            │ │  │
│  │  │  │  Model  │  │  Model  │  │  Model  │  │  Model  │            │ │  │
│  │  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │ │  │
│  │  └──────────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Sequelize ORM
                                      │ SQL Queries
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA TIER                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      PostgreSQL Database                               │  │
│  │                                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │  │
│  │  │   users     │  │  products   │  │  invoices   │                   │  │
│  │  │  - id       │  │  - id       │  │  - id       │                   │  │
│  │  │  - email    │  │  - name     │  │  - userId   │                   │  │
│  │  │  - password │  │  - barcode  │  │  - total    │                   │  │
│  │  │  - role     │  │  - price    │  │  - status   │                   │  │
│  │  │  - ...      │  │  - stock    │  │  - ...      │                   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                   │  │
│  │                                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐                                    │  │
│  │  │invoice_items│  │refresh_tokens│                                    │  │
│  │  │  - id       │  │  - id       │                                    │  │
│  │  │  - invoiceId│  │  - token    │                                    │  │
│  │  │  - productId│  │  - userId   │                                    │  │
│  │  │  - quantity │  │  - expiresAt│                                    │  │
│  │  └─────────────┘  └─────────────┘                                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Open Food Facts API                                 │  │
│  │              https://world.openfoodfacts.org                          │  │
│  │                                                                        │  │
│  │  - Product search by name                                             │  │
│  │  - Product lookup by barcode                                          │  │
│  │  - Nutritional information                                            │  │
│  │  - Product images                                                     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow
```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  Server  │         │   Auth   │         │    DB    │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │  POST /auth/login  │                    │                    │
     │───────────────────▶│                    │                    │
     │                    │  Validate Creds    │                    │
     │                    │───────────────────▶│                    │
     │                    │                    │  Query User        │
     │                    │                    │───────────────────▶│
     │                    │                    │◀───────────────────│
     │                    │  Generate JWT      │                    │
     │                    │◀───────────────────│                    │
     │  {accessToken,     │                    │                    │
     │   refreshToken}    │                    │                    │
     │◀───────────────────│                    │                    │
     │                    │                    │                    │
```

### Shopping Flow
```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  Server  │         │Controller│         │    DB    │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │  GET /products     │                    │                    │
     │───────────────────▶│                    │                    │
     │                    │  getAll()          │                    │
     │                    │───────────────────▶│                    │
     │                    │                    │  SELECT * FROM     │
     │                    │                    │───────────────────▶│
     │                    │                    │◀───────────────────│
     │  [products]        │◀───────────────────│                    │
     │◀───────────────────│                    │                    │
     │                    │                    │                    │
     │  POST /invoices    │                    │                    │
     │  {items, payment}  │                    │                    │
     │───────────────────▶│                    │                    │
     │                    │  create()          │                    │
     │                    │───────────────────▶│                    │
     │                    │                    │  INSERT invoice    │
     │                    │                    │───────────────────▶│
     │                    │                    │  UPDATE stock      │
     │                    │                    │───────────────────▶│
     │  {invoice}         │◀───────────────────│                    │
     │◀───────────────────│                    │                    │
     │                    │                    │                    │
```

## Database Schema

### Entity Relationship Diagram
```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      users      │       │    invoices     │       │    products     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ PK id           │       │ PK id           │       │ PK id           │
│    email        │       │ FK userId       │───────│    name         │
│    password     │───────│    invoiceNumber│       │    barcode      │
│    role         │       │    totalAmount  │       │    price        │
│    firstName    │       │    paymentMethod│       │    brand        │
│    lastName     │       │    paymentStatus│       │    category     │
│    phoneNumber  │       │    createdAt    │       │    stockQuantity│
│    address      │       └────────┬────────┘       │    restockDate  │
│    city         │                │                │    pictureUrl   │
│    zipCode      │                │                └────────┬────────┘
│    country      │                │                         │
└─────────────────┘                │                         │
                                   │                         │
                           ┌───────┴─────────┐               │
                           │  invoice_items  │               │
                           ├─────────────────┤               │
                           │ PK id           │               │
                           │ FK invoiceId    │───────────────┘
                           │ FK productId    │
                           │    quantity     │
                           │    unitPrice    │
                           │    subtotal     │
                           └─────────────────┘

┌─────────────────┐
│ refresh_tokens  │
├─────────────────┤
│ PK id           │
│ FK userId       │
│    token        │
│    expiresAt    │
└─────────────────┘
```

## Security Architecture

### Authentication & Authorization
```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Layers                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CORS Policy                                                  │
│     └── Restricts cross-origin requests                         │
│                                                                  │
│  2. JWT Authentication                                           │
│     ├── Access Token (15 min expiry)                            │
│     └── Refresh Token (7 day expiry)                            │
│                                                                  │
│  3. Role-Based Access Control (RBAC)                            │
│     ├── Customer: Browse, Order, View own orders                │
│     ├── Employee: + View all orders, inventory                  │
│     ├── Manager:  + CRUD products, approve orders, reports      │
│     └── Admin:    + User management                             │
│                                                                  │
│  4. Password Security                                            │
│     └── bcrypt hashing (10 rounds)                              │
│                                                                  │
│  5. Input Validation                                             │
│     └── Request body validation                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        GitLab                                    │
│                    (Source Code)                                 │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ Push to main
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   GitLab CI/CD                                   │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                     │
│  │  Build  │───▶│  Test   │───▶│ Deploy  │                     │
│  └─────────┘    └─────────┘    └─────────┘                     │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ Deploy Hook
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Render.com                                  │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │  trinity-api    │  │trinity-frontend │                       │
│  │  (Web Service)  │  │ (Static Site)   │                       │
│  │  Node.js        │  │ React/Vite      │                       │
│  └────────┬────────┘  └─────────────────┘                       │
│           │                                                      │
│           │                                                      │
│  ┌────────┴────────┐                                            │
│  │   trinity-db    │                                            │
│  │  (PostgreSQL)   │                                            │
│  └─────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Decisions

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Backend Runtime | Node.js 18 | Async I/O, large ecosystem, JavaScript everywhere |
| Backend Framework | Express.js | Minimalist, flexible, well-documented |
| Database | PostgreSQL | ACID compliance, JSON support, reliability |
| ORM | Sequelize | Full-featured, migrations, associations |
| Frontend Framework | React 18 | Component-based, hooks, large community |
| Build Tool | Vite | Fast HMR, optimized builds |
| Styling | Tailwind CSS | Utility-first, rapid prototyping |
| Authentication | JWT | Stateless, scalable, standard |
| Hosting | Render.com | Free tier, easy deployment, managed services |
