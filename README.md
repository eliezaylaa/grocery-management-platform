# Trinity Grocery - Full Stack Grocery Chain Management System

A comprehensive grocery store management system built with Node.js, Express, PostgreSQL, and React.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)

## 🌐 Live Demo

- **Frontend**: https://trinity-frontend-sd6g.onrender.com
- **Backend API**: https://trinity-api-d2wo.onrender.com
- **API Health**: https://trinity-api-d2wo.onrender.com/health

## 📋 Features

### For Customers
- 🛒 Browse and search products
- ��️ Shopping cart with checkout
- 💳 Multiple payment methods (Card, PayPal, Cash)
- 📦 Order history tracking
- 👤 User registration and profile management

### For Employees
- 📊 Daily operations dashboard
- 📋 Order processing
- 📦 Inventory overview
- ⚠️ Low stock alerts

### For Managers/Admins
- 📈 Sales analytics and reports
- 👥 User management
- 📦 Product management (CRUD)
- 🔄 Open Food Facts integration
- ✅ Order approval (cash payments)
- 📊 KPI dashboards

## 🏗️ Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    (React + Vite + Tailwind)                    │
│                 https://trinity-frontend-sd6g.onrender.com      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS / REST API
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                    (Node.js + Express)                          │
│                 https://trinity-api-d2wo.onrender.com           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Auth      │  │  Products   │  │  Invoices   │             │
│  │  (JWT)      │  │   (CRUD)    │  │  (Orders)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Sequelize ORM
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE                                   │
│                    (PostgreSQL 15)                              │
│                    Render Managed                                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ External API
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   OPEN FOOD FACTS API                           │
│              (Product Data & Nutrition Info)                    │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **ORM**: Sequelize
- **Authentication**: JWT (Access + Refresh tokens)
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React

### DevOps
- **CI/CD**: GitLab CI/CD
- **Hosting**: Render.com
- **Database**: Render PostgreSQL

## 📁 Project Structure
```
trinity-grocery/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth & validation middleware
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic & external APIs
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── docs/                # API documentation
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context (Auth)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   └── App.jsx          # Main app component
│   └── package.json
├── .gitlab-ci.yml           # CI/CD pipeline
└── README.md
```

## 🚀 Getting Started

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
# Edit .env with your database credentials
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with API URL
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
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trinity_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📚 API Documentation

See [docs/API_SPECS.md](docs/API_SPECS.md) for complete API documentation.

### Quick API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/products` | Get all products |
| POST | `/api/products` | Create product |
| GET | `/api/invoices` | Get all invoices |
| POST | `/api/invoices` | Create invoice/order |
| GET | `/api/reports/kpis` | Get dashboard KPIs |

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Customer** | Browse products, place orders, view own orders |
| **Employee** | View orders, view inventory, process orders |
| **Manager** | All employee permissions + manage products, approve orders, view reports |
| **Admin** | All permissions + manage users |

## 🔐 Authentication

The API uses JWT-based authentication:
- **Access Token**: Valid for 15 minutes
- **Refresh Token**: Valid for 7 days

Include the token in requests:
```
Authorization: Bearer <access_token>
```

## 📊 CI/CD Pipeline
```
┌─────────┐    ┌─────────┐    ┌─────────┐
│  BUILD  │───▶│  TEST   │───▶│ DEPLOY  │
└─────────┘    └─────────┘    └─────────┘
     │              │              │
     ▼              ▼              ▼
 npm install    Run tests    Render.com
 npm build      Lint code    (via webhook)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Merge Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Elie Zayla**
- GitLab: [@eliezaylaa](https://gitlab.com/eliezaylaa)

---

Made with ❤️ for EPITECH Paris
