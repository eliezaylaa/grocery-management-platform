# Trinity Grocery - API Specifications

## Base URL

- **Production**: `https://trinity-api-d2wo.onrender.com`
- **Development**: `http://localhost:5000`
- **API Documentation**: `/api-docs`

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

### Password Reset

#### Request Password Reset
```http
POST /api/password/forgot
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response** `200 OK`
```json
{
  "message": "Password reset email sent"
}
```

#### Reset Password
```http
POST /api/password/reset
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

**Response** `200 OK`
```json
{
  "message": "Password reset successful"
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
      "nutritionalInfo": {
        "energy_kcal": 539,
        "fat": 30.9,
        "carbohydrates": 57.5,
        "proteins": 6.3
      },
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

#### Get Invoice by ID
```http
GET /api/invoices/:id
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
      "quantity": 2
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

### Payments

#### Get Stripe Publishable Key
```http
GET /api/payments/stripe/key
```

**Response** `200 OK`
```json
{
  "publishableKey": "pk_test_..."
}
```

#### Create Stripe Payment Intent
```http
POST /api/payments/stripe/create-payment-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 29.99,
  "currency": "eur"
}
```

**Response** `200 OK`
```json
{
  "clientSecret": "pi_..._secret_...",
  "paymentIntentId": "pi_..."
}
```

#### Confirm Stripe Payment
```http
POST /api/payments/stripe/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentIntentId": "pi_..."
}
```

#### Get PayPal Client ID
```http
GET /api/payments/paypal/client-id
```

**Response** `200 OK`
```json
{
  "clientId": "AWat0j0K..."
}
```

#### Create PayPal Order
```http
POST /api/payments/paypal/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 29.99,
  "currency": "EUR"
}
```

**Response** `200 OK`
```json
{
  "orderId": "5O190127TN364715T",
  "status": "CREATED"
}
```

#### Capture PayPal Order
```http
POST /api/payments/paypal/capture-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "5O190127TN364715T"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "status": "COMPLETED",
  "paymentId": "5O190127TN364715T",
  "captureId": "2GG279541U471931P"
}
```

---

### Receipts

#### Download Receipt as PDF
```http
GET /api/receipts/:id/download
Authorization: Bearer <token>
```

**Response** `200 OK`
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=receipt-INV-2024-0001.pdf`

#### Send Receipt via Email
```http
POST /api/receipts/:id/email
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "custom@email.com"  // Optional - uses customer email if not provided
}
```

**Response** `200 OK`
```json
{
  "message": "Receipt sent successfully to custom@email.com"
}
```

---

### Users (Admin)

#### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| role | string | Filter by role |
| search | string | Search by name/email |

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
  "totalOrders": {
    "value": 340,
    "change": 8.3
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
  ],
  "revenueByDay": [
    { "date": "2024-01-01", "revenue": 1250.00 },
    { "date": "2024-01-02", "revenue": 980.50 }
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

## Testing

### Test Cards (Stripe)
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 0025 0000 3155`

Use any future expiry date and any 3-digit CVC.

### PayPal Sandbox
Use sandbox accounts from PayPal Developer Dashboard.

---

## Rate Limiting

Currently no rate limiting is implemented. For production use, consider implementing:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated endpoints
