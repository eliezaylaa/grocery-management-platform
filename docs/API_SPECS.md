# Trinity Grocery - API Specifications

## Base URL

- **Production**: `https://trinity-api-d2wo.onrender.com`
- **Development**: `http://localhost:5000`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "city": "Paris",
  "zipCode": "75001",
  "country": "France"
}
```

**Response** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "customer",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "customer"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Products

#### Get All Products
```http
GET /api/products
Authorization: Bearer <token>
```

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| search | string | Search by name, brand, barcode |
| category | string | Filter by category |
| brand | string | Filter by brand |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |
| lowStock | boolean | Show only low stock items |
| inStock | boolean | Show only in-stock items |
| sortBy | string | Sort field (name, price, stockQuantity) |
| sortOrder | string | ASC or DESC |

**Response** `200 OK`
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Nutella",
      "barcode": "3017620422003",
      "price": "5.99",
      "brand": "Ferrero",
      "category": "Spreads",
      "pictureUrl": "https://...",
      "stockQuantity": 50,
      "restockDate": "2024-02-01",
      "restockQuantity": 100
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 8,
  "filters": {
    "categories": ["Spreads", "Beverages", "Snacks"],
    "brands": ["Ferrero", "Coca-Cola", "Nestlé"]
  }
}
```

#### Get Product by ID
```http
GET /api/products/:id
Authorization: Bearer <token>
```

#### Create Product (Manager+)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "barcode": "1234567890123",
  "price": 9.99,
  "brand": "Brand",
  "category": "Category",
  "stockQuantity": 100,
  "restockDate": "2024-02-01",
  "restockQuantity": 50,
  "pictureUrl": "https://...",
  "description": "Product description"
}
```

#### Update Product (Manager+)
```http
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 10.99,
  "stockQuantity": 75
}
```

#### Delete Product (Manager+)
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

#### Search Open Food Facts
```http
GET /api/products/search/openfoodfacts?query=nutella
Authorization: Bearer <token>
```

**Response** `200 OK`
```json
{
  "products": [
    {
      "barcode": "3017620422003",
      "name": "Nutella",
      "brand": "Ferrero",
      "category": "Spreads",
      "pictureUrl": "https://..."
    }
  ],
  "total": 24,
  "page": 1,
  "totalPages": 1
}
```

#### Bulk Import from Open Food Facts (Manager+)
```http
POST /api/products/import/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "barcodes": ["3017620422003", "5449000000996"]
}
```

---

### Invoices (Orders)

#### Get All Invoices (Manager+)
```http
GET /api/invoices
Authorization: Bearer <token>
```

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| status | string | Filter by payment status |
| userId | string | Filter by user ID |

#### Get My Orders (Customer)
```http
GET /api/invoices/my-orders
Authorization: Bearer <token>
```

#### Create Invoice/Order
```http
POST /api/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "unitPrice": 5.99
    }
  ],
  "paymentMethod": "card",
  "paymentStatus": "completed"
}
```

**Payment Methods**: `card`, `cash`, `paypal`
**Payment Status**: `pending`, `completed`, `failed`, `refunded`

#### Update Invoice (Manager+)
```http
PUT /api/invoices/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentStatus": "completed"
}
```

---

### Users (Admin)

#### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

#### Create User
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "employee@company.com",
  "password": "password123",
  "role": "employee",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

**Roles**: `customer`, `employee`, `manager`, `admin`

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "manager",
  "firstName": "Jane"
}
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

---

### Reports (Manager+)

#### Get Dashboard KPIs
```http
GET /api/reports/kpis
Authorization: Bearer <token>
```

**Response** `200 OK`
```json
{
  "totalRevenue": {
    "value": "15420.50",
    "change": 12.5
  },
  "averageTransaction": {
    "value": "45.30"
  },
  "salesGrowth": {
    "growthRate": "8.5"
  },
  "topProducts": [
    {
      "id": "uuid",
      "name": "Nutella",
      "quantitySold": 150
    }
  ],
  "lowStock": [
    {
      "id": "uuid",
      "name": "Product",
      "stockQuantity": 5
    }
  ],
  "paymentDistribution": [
    { "method": "card", "count": 45 },
    { "method": "cash", "count": 30 },
    { "method": "paypal", "count": 25 }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request body"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production use, consider implementing:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated endpoints

---

## Versioning

API versioning is not currently implemented. Future versions will use URL path versioning:
- `/api/v1/products`
- `/api/v2/products`
