/**
 * User Service - User business logic
 */

const logger = require('../utils/logger');
const User = require('../models/User');

class UserService {
  constructor(database, authService) {
    this.database = database;
    this.authService = authService;
    logger.info('UserService initialized');
  }

  createUser(email, name, password) {
    logger.info('Creating new user', { email, name });
    
    try {
      const user = this.authService.register(email, name, password);
      logger.success('User created successfully', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Failed to create user', { email, error: error.message });
      throw error;
    }
  }

  getUser(userId) {
    logger.info('Fetching user', { userId });
    
    const users = this.database.query('users');
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      logger.warn('User not found', { userId });
      return null;
    }
    
    return user;
  }

  updateUser(userId, updates) {
    logger.info('Updating user', { userId, updates });
    
    const user = this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const updated = this.database.update('users', userId, updates);
    logger.success('User updated successfully', { userId });
    
    return updated;
  }

  deleteUser(userId) {
    logger.info('Deleting user', { userId });
    
    const deleted = this.database.delete('users', userId);
    logger.success('User deleted successfully', { userId });
    
    return deleted;
  }

  listUsers(limit = 10) {
    logger.info('Listing users', { limit });
    
    const users = this.database.query('users').slice(0, limit);
    logger.info('Users listed', { count: users.length });
    
    return users;
  }

  activateUser(userId) {
    logger.info('Activating user', { userId });
    return this.updateUser(userId, { isActive: true });
  }

  deactivateUser(userId) {
    logger.info('Deactivating user', { userId });
    return this.updateUser(userId, { isActive: false });
  }
}

module.exports = UserService;
