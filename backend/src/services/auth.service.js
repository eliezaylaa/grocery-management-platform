const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, RefreshToken } = require("../models");
const { v4: uuidv4 } = require("uuid");

class AuthService {
  async register(email, password, role = "employee") {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "15m" }
    );
  }

  async generateRefreshToken(user) {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      token,
      userId: user.id,
      expiresAt,
    });

    return token;
  }

  async refreshAccessToken(refreshToken) {
    const tokenRecord = await RefreshToken.findOne({
      where: { token: refreshToken, isRevoked: false },
      include: [{ model: User, as: "user" }],
    });

    if (!tokenRecord) {
      throw new Error("Invalid refresh token");
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new Error("Refresh token expired");
    }

    const accessToken = this.generateAccessToken(tokenRecord.user);
    return accessToken;
  }

  async logout(refreshToken) {
    const tokenRecord = await RefreshToken.findOne({
      where: { token: refreshToken },
    });
    if (tokenRecord) {
      tokenRecord.isRevoked = true;
      await tokenRecord.save();
    }
  }
}

module.exports = new AuthService();
