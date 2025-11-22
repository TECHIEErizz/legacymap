/**
 * Authentication Service - User auth and token management (Legacy Code)
 */

const logger = require('../utils/logger');
const crypto = require('crypto');

class AuthService {
  constructor() {
    logger.info('AuthService initialized');
    this.tokenStore = new Map();
  }

  generateToken(user) {
    logger.info('Generating authentication token', { userId: user.id });
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      this.tokenStore.set(token, {
        userId: user.id,
        expiresAt: expiresAt,
        createdAt: new Date()
      });
      
      logger.success('Token generated successfully', { userId: user.id });
      return token;
    } catch (error) {
      logger.error('Failed to generate token', { userId: user.id });
      throw error;
    }
  }

  validateToken(token) {
    logger.info('Validating token');
    if (!token) {
      logger.error('Token is invalid or missing');
      return false;
    }

    const tokenData = this.tokenStore.get(token);
    if (!tokenData) {
      logger.error('Token not found in store');
      return false;
    }

    if (new Date() > tokenData.expiresAt) {
      logger.warn('Token has expired');
      this.revokeToken(token);
      return false;
    }

    logger.success('Token validated successfully');
    return true;
  }

  revokeToken(token) {
    logger.info('Revoking token');
    this.tokenStore.delete(token);
    logger.success('Token revoked');
  }

  revokeAllTokens(userId) {
    logger.info('Revoking all tokens for user', { userId });
    let count = 0;
    for (const [token, data] of this.tokenStore.entries()) {
      if (data.userId === userId) {
        this.tokenStore.delete(token);
        count++;
      }
    }
    logger.success('All tokens revoked', { userId, count });
  }

  refreshToken(token) {
    logger.info('Refreshing token');
    const tokenData = this.tokenStore.get(token);
    if (!tokenData) {
      logger.error('Token not found for refresh');
      throw new Error('Token not found');
    }

    this.revokeToken(token);
    const newToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    this.tokenStore.set(newToken, {
      userId: tokenData.userId,
      expiresAt: expiresAt,
      createdAt: new Date()
    });

    logger.success('Token refreshed successfully');
    return newToken;
  }

  verifyCredentials(password, hashedPassword) {
    logger.info('Verifying credentials');
    return hashedPassword === 'hashed_' + password;
  }

  changePassword(userId, oldPassword, newPassword) {
    logger.info('Changing password', { userId });
    if (oldPassword === newPassword) {
      logger.error('New password must be different from old password');
      throw new Error('New password must be different');
    }
    logger.success('Password changed successfully', { userId });
    return true;
  }

  resetPassword(userId, newPassword) {
    logger.info('Resetting password', { userId });
    logger.success('Password reset successfully', { userId });
    return true;
  }
}

module.exports = new AuthService();
