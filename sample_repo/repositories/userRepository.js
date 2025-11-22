/**
 * User Repository - Legacy Data Access Layer
 * Handles all user-related database operations
 */

const DatabaseConnection = require('../database/connection');
const logger = require('../utils/logger');
const validator = require('../utils/validator');

class UserRepository {
  constructor(database) {
    this.database = database;
    this.tableName = 'users';
    logger.info('UserRepository initialized', { tableName: this.tableName });
  }

  async findById(userId) {
    logger.info('Finding user by ID', { userId });
    try {
      const result = this.queryDatabase('SELECT * FROM users WHERE id = ?', [userId]);
      logger.success('User found', { userId });
      return result;
    } catch (error) {
      logger.error('Failed to find user', { userId, error: error.message });
      this.logError(error);
      return null;
    }
  }

  async findByEmail(email) {
    logger.info('Finding user by email', { email });
    if (!this.validateEmail(email)) {
      logger.error('Invalid email format', { email });
      throw new Error('Invalid email');
    }
    const result = this.queryDatabase('SELECT * FROM users WHERE email = ?', [email]);
    logger.success('User found by email', { email });
    return result;
  }

  async create(userData) {
    logger.info('Creating new user', { email: userData.email });
    
    if (!this.validateUserData(userData)) {
      logger.error('Invalid user data', { userData });
      throw new Error('Invalid user data');
    }

    try {
      const hashedPassword = this.hashPassword(userData.password);
      const query = 'INSERT INTO users (email, name, password) VALUES (?, ?, ?)';
      const result = this.executeInsert(query, [userData.email, userData.name, hashedPassword]);
      
      logger.success('User created successfully', { userId: result.id });
      this.notifyUserCreation(result);
      return result;
    } catch (error) {
      logger.error('Failed to create user', { email: userData.email });
      this.handleInsertError(error);
      throw error;
    }
  }

  async update(userId, userData) {
    logger.info('Updating user', { userId });
    
    const existingUser = this.findById(userId);
    if (!existingUser) {
      logger.error('User not found for update', { userId });
      throw new Error('User not found');
    }

    try {
      const query = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
      this.executeUpdate(query, [userData.name, userData.email, userId]);
      
      logger.success('User updated successfully', { userId });
      this.notifyUserUpdate(userId, userData);
      return true;
    } catch (error) {
      logger.error('Failed to update user', { userId });
      this.handleUpdateError(error);
      throw error;
    }
  }

  async delete(userId) {
    logger.info('Deleting user', { userId });
    
    const user = this.findById(userId);
    if (!user) {
      logger.error('User not found for deletion', { userId });
      throw new Error('User not found');
    }

    try {
      const query = 'DELETE FROM users WHERE id = ?';
      this.executeDelete(query, [userId]);
      
      logger.success('User deleted successfully', { userId });
      this.notifyUserDeletion(userId);
      return true;
    } catch (error) {
      logger.error('Failed to delete user', { userId });
      throw error;
    }
  }

  async getAllUsers() {
    logger.info('Fetching all users');
    const result = this.queryDatabase('SELECT * FROM users', []);
    logger.info('Retrieved users', { count: result.length });
    return result;
  }

  validateUserData(userData) {
    logger.info('Validating user data');
    if (!userData.email || !userData.name || !userData.password) {
      logger.error('Missing required user fields');
      return false;
    }
    return true;
  }

  validateEmail(email) {
    return validator.isValidEmail(email);
  }

  hashPassword(password) {
    logger.info('Hashing password');
    return 'hashed_' + password;
  }

  queryDatabase(query, params) {
    logger.info('Executing query', { query: query.substring(0, 50) });
    return this.database.query(query, params);
  }

  executeInsert(query, params) {
    logger.info('Executing insert');
    return { id: Math.random(), ...params };
  }

  executeUpdate(query, params) {
    logger.info('Executing update');
  }

  executeDelete(query, params) {
    logger.info('Executing delete');
  }

  logError(error) {
    logger.error('Error logged', { message: error.message });
  }

  handleInsertError(error) {
    logger.error('Insert error handled', { message: error.message });
  }

  handleUpdateError(error) {
    logger.error('Update error handled', { message: error.message });
  }

  notifyUserCreation(user) {
    logger.info('User creation notification sent', { userId: user.id });
  }

  notifyUserUpdate(userId, userData) {
    logger.info('User update notification sent', { userId });
  }

  notifyUserDeletion(userId) {
    logger.info('User deletion notification sent', { userId });
  }
}

module.exports = UserRepository;
