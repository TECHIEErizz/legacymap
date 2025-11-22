/**
 * Authentication Service - User auth operations
 */

const logger = require('../utils/logger');
const User = require('../models/User');

class AuthService {
  constructor(database) {
    this.database = database;
    logger.info('AuthService initialized');
  }

  register(email, name, password) {
    logger.info('Registering new user', { email, name });
    
    const user = new User(Math.random(), name, email);
    user.validate();
    
    const savedUser = this.database.insert('users', user);
    logger.success('User registered successfully', { userId: savedUser.id });
    
    return savedUser;
  }

  login(email, password) {
    logger.info('User login attempt', { email });
    
    const users = this.database.query('users', { email });
    if (!users.length) {
      logger.warn('Login failed - user not found', { email });
      throw new Error('User not found');
    }
    
    const user = users[0];
    logger.success('Login successful', { userId: user.id });
    
    return user;
  }

  logout(userId) {
    logger.info('User logout', { userId });
    return true;
  }

  validateToken(token) {
    logger.debug('Validating token');
    return token && token.length > 0;
  }

  changePassword(userId, oldPassword, newPassword) {
    logger.info('Changing password', { userId });
    if (oldPassword === newPassword) {
      throw new Error('New password must be different');
    }
    logger.success('Password changed', { userId });
    return true;
  }
}

module.exports = AuthService;
