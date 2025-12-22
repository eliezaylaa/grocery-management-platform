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
const invoiceRoutes = require("./routes/invoice.routes");
const reportRoutes = require("./routes/report.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5174'],
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Trinity Grocery Management API",
      version: "2.0.0",
      description: "RESTful API for grocery chain management system",
    },
    servers: [{ url: "http://localhost:5000" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "🚀 Trinity API is running!",
    version: "2.0.0",
    status: "active",
    endpoints: {
      health: "/health",
      docs: "/api-docs",
      auth: "/api/auth",
      products: "/api/products",
      invoices: "/api/invoices",
      reports: "/api/reports",
      users: "/api/users",
    },
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;