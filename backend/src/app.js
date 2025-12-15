require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const {
  errorHandler,
  notFound,
} = require("./middleware/errorHandler.middleware");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const customerRoutes = require("./routes/customer.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const reportRoutes = require("./routes/report.routes");

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5174"],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Trinity Grocery Management API",
      version: "1.0.0",
      description: "RESTful API for grocery chain management system",
      contact: {
        name: "API Support",
        email: "support@trinity.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/models/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/reports", reportRoutes);

// ROOT ROUTE - ADD THIS!
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Trinity API is running!",
    version: "1.0.0",
    status: "active",
    endpoints: {
      health: "/health",
      docs: "/api-docs",
      auth: "/api/auth",
      products: "/api/products",
      customers: "/api/customers",
      invoices: "/api/invoices",
      reports: "/api/reports",
    },
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
