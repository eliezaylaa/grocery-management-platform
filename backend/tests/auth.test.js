const request = require("supertest");
const app = require("../src/app");
const { sequelize } = require("../src/models");

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("Authentication", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "password123",
        role: "employee",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe("test@example.com");
    });

    it("should not register with duplicate email", async () => {
      await request(app).post("/api/auth/register").send({
        email: "duplicate@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/auth/register").send({
        email: "duplicate@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(500);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully", async () => {
      await request(app).post("/api/auth/register").send({
        email: "login@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
    });

    it("should fail with wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(500);
    });
  });
});
