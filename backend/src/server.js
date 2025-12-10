require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 5000;

// Test database connection and start server
const startServer = async () => {
  try {
    console.log("⏳ Connecting to database...");

    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Sync models: { alter: true } updates models without deleting data
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
