const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, RefreshToken } = require('../models');
const { v4: uuidv4 } = require('uuid');

class AuthService {
  async register(userData) {
    const { email, password, role, firstName, lastName, phoneNumber, address, zipCode, city, country } = userData;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || 'customer',
      firstName,
      lastName,
      phoneNumber,
      address,
      zipCode,
      city,
      country
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    return userResponse;
  }

  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    const userResponse = user.toJSON();
    delete userResponse.password;

    return {
      accessToken,
      refreshToken,
      user: userResponse
    };
  }

  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );
  }

  async generateRefreshToken(user) {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      userId: user.id,
      token,
      expiresAt
    });

    return token;
  }

  async refreshAccessToken(refreshToken) {
    const tokenRecord = await RefreshToken.findOne({
      where: { token: refreshToken, isRevoked: false },
      include: [{ model: User, as: 'user' }]
    });

    if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
      throw new Error('Invalid or expired refresh token');
    }

    const accessToken = this.generateAccessToken(tokenRecord.user);

    return { accessToken };
  }

  async logout(refreshToken) {
    const tokenRecord = await RefreshToken.findOne({ where: { token: refreshToken } });
    if (tokenRecord) {
      await tokenRecord.update({ isRevoked: true });
    }
  }
}

module.exports = new AuthService();
