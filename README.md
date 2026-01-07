# Trinity Grocery - Full Stack Grocery Chain Management System

A comprehensive grocery store management system built with Node.js, Express, PostgreSQL, and React.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)

## Live Demo

- **Frontend**: https://trinity-frontend-sd6g.onrender.com
- **Backend API**: https://trinity-api-d2wo.onrender.com
- **API Docs (Swagger)**: https://trinity-api-d2wo.onrender.com/api-docs

## Features

### For Customers

- Browse and search products with filters
- Shopping cart with real-time updates
- Multiple payment methods (Stripe Card, PayPal Sandbox, Cash)
- Order history tracking
- PDF receipt download & email
- User registration and profile management
- Password reset via email

### For Employees

- Daily operations dashboard
- Order processing & management
- Inventory overview
- Low stock alerts
- Invoice management

### For Managers/Admins

- Sales analytics with interactive charts
- Full user management (CRUD)
- Product management with Open Food Facts integration
- Cash order approval workflow
- Advanced KPI dashboards
- Revenue trends & payment distribution charts

### Bonus Features ✨

- **Payment Options**: Stripe (EUR), PayPal Sandbox, Cash on Delivery
- **PDF Receipts**: Professional PDF generation with pdfkit
- **Email Receipts**: Send receipts via Resend API
- **Guided Tour**: Interactive onboarding with React Joyride
- **Nutritional Info**: Product details from Open Food Facts

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    (React + Vite + Tailwind)                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS / REST API
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                    (Node.js + Express)                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │  Auth   │  │Products │  │Invoices │  │Payments │           │
│  │  (JWT)  │  │ (CRUD)  │  │(Orders) │  │(Stripe) │           │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Sequelize ORM
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE                                   │
│                    (PostgreSQL 15)                              │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Backend

| Technology    | Purpose           |
| ------------- | ----------------- |
| Node.js 18+   | Runtime           |
| Express.js    | Web Framework     |
| PostgreSQL 15 | Database          |
| Sequelize     | ORM               |
| JWT           | Authentication    |
| Stripe        | Card Payments     |
| PayPal SDK    | PayPal Payments   |
| PDFKit        | PDF Generation    |
| Resend        | Email Service     |
| Swagger       | API Documentation |

### Frontend

| Technology      | Purpose            |
| --------------- | ------------------ |
| React 18        | UI Framework       |
| Vite            | Build Tool         |
| Tailwind CSS    | Styling            |
| React Router v6 | Routing            |
| Recharts        | Data Visualization |
| Lucide React    | Icons              |
| React Joyride   | Guided Tours       |
| Stripe.js       | Payment UI         |
| PayPal React    | PayPal Buttons     |

### DevOps

| Technology   | Purpose          |
| ------------ | ---------------- |
| GitLab CI/CD | Pipeline         |
| Render.com   | Hosting          |
| Docker       | Containerization |

## Project Structure

```
trinity-grocery/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth & validation
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── app.js           # Express setup
│   │   └── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth & Cart context
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── App.jsx          # Main app
│   └── package.json
├── docs/                    # Documentation
├── .gitlab-ci.yml           # CI/CD pipeline
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Local Development

1. **Clone the repository**

```bash
git clone https://gitlab.com/eliezaylaa/trinity-grocery.git
cd trinity-grocery
```

2. **Setup Backend**

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

3. **Setup Frontend**

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

4. **Access the application**

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

### Environment Variables

#### Backend (.env)

```env
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trinity_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# PayPal
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_SECRET=your-secret
PAYPAL_MODE=sandbox

# Email (Resend)
RESEND_API_KEY=re_...

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## API Documentation

Interactive API documentation available at `/api-docs` (Swagger UI).

### Quick API Reference

| Method | Endpoint                                     | Description            | Auth     |
| ------ | -------------------------------------------- | ---------------------- | -------- |
| POST   | `/api/auth/register`                         | Register user          | No       |
| POST   | `/api/auth/login`                            | Login                  | No       |
| POST   | `/api/password/forgot`                       | Request password reset | No       |
| POST   | `/api/password/reset`                        | Reset password         | No       |
| GET    | `/api/products`                              | List products          | Yes      |
| POST   | `/api/products`                              | Create product         | Manager+ |
| GET    | `/api/invoices`                              | List invoices          | Manager+ |
| GET    | `/api/invoices/my-orders`                    | My orders              | Customer |
| POST   | `/api/invoices`                              | Create order           | Yes      |
| GET    | `/api/payments/stripe/key`                   | Stripe key             | No       |
| POST   | `/api/payments/stripe/create-payment-intent` | Create payment         | Yes      |
| GET    | `/api/payments/paypal/client-id`             | PayPal client ID       | No       |
| POST   | `/api/payments/paypal/create-order`          | Create PayPal order    | Yes      |
| GET    | `/api/receipts/:id/download`                 | Download PDF           | Yes      |
| POST   | `/api/receipts/:id/email`                    | Email receipt          | Yes      |
| GET    | `/api/reports/kpis`                          | Dashboard KPIs         | Manager+ |
| GET    | `/api/users`                                 | List users             | Admin    |

## User Roles

| Role         | Permissions                                                         |
| ------------ | ------------------------------------------------------------------- |
| **Customer** | Browse products, place orders, view own orders, download receipts   |
| **Employee** | + View all orders, inventory, process orders                        |
| **Manager**  | + CRUD products, approve cash orders, view reports, import from OFF |
| **Admin**    | + Full user management                                              |

## Payment Testing

### Stripe Test Cards

| Card Number           | Result        |
| --------------------- | ------------- |
| `4242 4242 4242 4242` | Success       |
| `4000 0000 0000 0002` | Decline       |
| `4000 0025 0000 3155` | Requires Auth |

Use any future expiry date and any 3-digit CVC.

### PayPal Sandbox

Use sandbox buyer account from PayPal Developer Dashboard.

## Authentication

JWT-based authentication with:

- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry

## CI/CD Pipeline

```
┌─────────┐    ┌─────────┐    ┌─────────┐
│  BUILD  │───▶│  TEST   │───▶│ DEPLOY  │
└─────────┘    └─────────┘    └─────────┘
```

- **Build**: Install dependencies, build frontend
- **Test**: Linting, unit tests
- **Deploy**: Auto-deploy to Render.com

## Documentation

- [API Specifications](docs/API_SPECS.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [UML Diagrams](docs/UML_DIAGRAMS.md)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Merge Request

## License

This project is licensed under the Epitech License.

## Developers

**Elie Zaylaa**

- GitLab: [@eliezaylaa](https://gitlab.com/eliezaylaa)
  **Momodou Jallow**
- GitLab: [@momodoujallow](https://gitlab.com/momodoujallow)

---
