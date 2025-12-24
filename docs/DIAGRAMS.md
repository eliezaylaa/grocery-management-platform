# Trinity Grocery - UML Diagrams

## Use Case Diagram
```mermaid
graph TB
    subgraph Actors
        C[Customer]
        E[Employee]
        M[Manager]
        A[Admin]
    end

    subgraph "Customer Actions"
        UC1[Browse Products]
        UC2[Search Products]
        UC3[Add to Cart]
        UC4[Checkout]
        UC5[View Orders]
        UC6[Register/Login]
    end

    subgraph "Employee Actions"
        UC7[View All Orders]
        UC8[View Inventory]
        UC9[Process Orders]
    end

    subgraph "Manager Actions"
        UC10[Manage Products]
        UC11[Approve Cash Orders]
        UC12[View Reports]
        UC13[Import from OFF]
    end

    subgraph "Admin Actions"
        UC14[Manage Users]
        UC15[Assign Roles]
    end

    C --> UC1
    C --> UC2
    C --> UC3
    C --> UC4
    C --> UC5
    C --> UC6

    E --> UC1
    E --> UC7
    E --> UC8
    E --> UC9

    M --> UC7
    M --> UC8
    M --> UC10
    M --> UC11
    M --> UC12
    M --> UC13

    A --> UC14
    A --> UC15
    A --> UC10
    A --> UC12
```

## Class Diagram
```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +String password
        +String role
        +String firstName
        +String lastName
        +String phoneNumber
        +String address
        +String city
        +String zipCode
        +String country
        +Date createdAt
        +Date updatedAt
    }

    class Product {
        +UUID id
        +String name
        +String barcode
        +Decimal price
        +String brand
        +String category
        +String pictureUrl
        +String description
        +JSON nutritionalInfo
        +Integer stockQuantity
        +Date restockDate
        +Integer restockQuantity
        +Date createdAt
    }

    class Invoice {
        +UUID id
        +UUID userId
        +String invoiceNumber
        +Decimal totalAmount
        +String paymentMethod
        +String paymentStatus
        +Date createdAt
    }

    class InvoiceItem {
        +UUID id
        +UUID invoiceId
        +UUID productId
        +Integer quantity
        +Decimal unitPrice
        +Decimal subtotal
    }

    class RefreshToken {
        +UUID id
        +UUID userId
        +String token
        +Date expiresAt
    }

    User "1" --> "*" Invoice : places
    User "1" --> "*" RefreshToken : has
    Invoice "1" --> "*" InvoiceItem : contains
    Product "1" --> "*" InvoiceItem : included in
```

## Sequence Diagram - User Login
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    U->>F: Enter credentials
    F->>B: POST /api/auth/login
    B->>DB: Find user by email
    DB-->>B: User data
    B->>B: Verify password (bcrypt)
    B->>B: Generate JWT tokens
    B->>DB: Store refresh token
    B-->>F: {user, accessToken, refreshToken}
    F->>F: Store tokens in localStorage
    F-->>U: Redirect to Dashboard
```

## Sequence Diagram - Place Order
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    U->>F: Click Checkout
    F->>F: Get cart from localStorage
    F->>B: POST /api/invoices {items, payment}
    B->>B: Validate JWT token
    B->>DB: Create invoice record
    DB-->>B: Invoice created
    
    loop For each item
        B->>DB: Create invoice item
        B->>DB: Update product stock
    end
    
    B-->>F: {invoice}
    F->>F: Clear cart
    F-->>U: Show confirmation
```

## Sequence Diagram - Manager Approves Order
```mermaid
sequenceDiagram
    participant M as Manager
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    M->>F: View pending orders
    F->>B: GET /api/invoices?status=pending
    B->>DB: Query pending invoices
    DB-->>B: Invoices list
    B-->>F: {invoices}
    F-->>M: Display pending orders

    M->>F: Click Approve
    F->>B: PUT /api/invoices/:id {status: completed}
    B->>B: Validate manager role
    B->>DB: Update invoice status
    DB-->>B: Updated
    B-->>F: {invoice}
    F-->>M: Show success
```

## State Diagram - Order Status
```mermaid
stateDiagram-v2
    [*] --> Pending: Customer places order (cash)
    [*] --> Completed: Customer pays (card/paypal)
    
    Pending --> Completed: Manager approves
    Pending --> Failed: Manager rejects
    
    Completed --> Refunded: Refund requested
    
    Failed --> [*]
    Refunded --> [*]
    Completed --> [*]
```

## Component Diagram
```mermaid
graph TB
    subgraph "Frontend (React)"
        Pages[Pages]
        Components[Components]
        Services[API Services]
        Context[Auth Context]
        
        Pages --> Components
        Pages --> Services
        Pages --> Context
        Services --> Context
    end

    subgraph "Backend (Express)"
        Routes[Routes]
        Controllers[Controllers]
        Models[Models]
        Middleware[Middleware]
        ExtServices[External Services]
        
        Routes --> Middleware
        Routes --> Controllers
        Controllers --> Models
        Controllers --> ExtServices
    end

    subgraph "Database"
        PostgreSQL[(PostgreSQL)]
    end

    subgraph "External"
        OFF[Open Food Facts API]
    end

    Services -->|HTTP/REST| Routes
    Models -->|Sequelize| PostgreSQL
    ExtServices -->|HTTP| OFF
```

## Deployment Diagram
```mermaid
graph TB
    subgraph "Client"
        Browser[Web Browser]
    end

    subgraph "Render.com"
        subgraph "Static Site"
            Frontend[trinity-frontend<br/>React/Vite]
        end
        
        subgraph "Web Service"
            Backend[trinity-api<br/>Node.js/Express]
        end
        
        subgraph "Database"
            DB[(trinity-db<br/>PostgreSQL 15)]
        end
    end

    subgraph "External"
        OFF[Open Food Facts<br/>API]
    end

    subgraph "CI/CD"
        GitLab[GitLab<br/>Repository]
        Pipeline[CI/CD<br/>Pipeline]
    end

    Browser -->|HTTPS| Frontend
    Browser -->|HTTPS| Backend
    Backend -->|SQL| DB
    Backend -->|HTTPS| OFF
    
    GitLab -->|Trigger| Pipeline
    Pipeline -->|Deploy Hook| Backend
    Pipeline -->|Deploy Hook| Frontend
```

## Activity Diagram - Shopping Flow
```mermaid
graph TD
    A[Start] --> B[Browse Products]
    B --> C{Found Product?}
    C -->|No| B
    C -->|Yes| D[Add to Cart]
    D --> E{Continue Shopping?}
    E -->|Yes| B
    E -->|No| F[View Cart]
    F --> G{Cart OK?}
    G -->|No| H[Modify Cart]
    H --> F
    G -->|Yes| I[Proceed to Checkout]
    I --> J[Select Payment Method]
    J --> K{Payment Type}
    K -->|Card/PayPal| L[Process Payment]
    K -->|Cash| M[Create Pending Order]
    L --> N[Order Completed]
    M --> O[Wait for Approval]
    O --> P{Approved?}
    P -->|Yes| N
    P -->|No| Q[Order Failed]
    N --> R[End]
    Q --> R
```
