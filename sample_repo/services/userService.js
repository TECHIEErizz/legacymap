/**
 * User Service - Business Logic Layer (Legacy Code)
 * Orchestrates user operations across multiple repositories
 */

const UserRepository = require('../repositories/userRepository');
const DatabaseConnection = require('../database/connection');
const logger = require('../utils/logger');
const emailService = require('./emailService');
const authService = require('./authService');

class UserService {
  constructor() {
    logger.info('UserService initialized');
    this.database = new DatabaseConnection('localhost', 5432, 'legacy_db');
    this.repository = new UserRepository(this.database);
    this.database.connect();
  }

  registerUser(userData) {
    logger.info('Starting user registration', { email: userData.email });
    
    try {
      if (!this.validateRegistrationData(userData)) {
        logger.error('Invalid registration data');
        throw new Error('Invalid registration data');
      }

      const existingUser = this.repository.findByEmail(userData.email);
      if (existingUser) {
        logger.error('User already exists', { email: userData.email });
        throw new Error('User already exists');
      }

      const newUser = this.repository.create(userData);
      logger.success('User registered successfully', { userId: newUser.id });

      this.sendWelcomeEmail(newUser);

      const token = authService.generateToken(newUser);
      logger.info('Authentication token generated', { userId: newUser.id });

      return {
        success: true,
        user: newUser,
        token: token
      };
    } catch (error) {
      logger.error('User registration failed', { email: userData.email });
      this.handleRegistrationError(error);
      throw error;
    }
  }

  authenticateUser(email, password) {
    logger.info('User authentication attempt', { email });
    
    try {
      const user = this.repository.findByEmail(email);
      if (!user) {
        logger.error('User not found', { email });
        throw new Error('User not found');
      }

      const isPasswordValid = this.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        logger.error('Invalid password', { email });
        this.logFailedAttempt(email);
        throw new Error('Invalid credentials');
      }

      const token = authService.generateToken(user);
      logger.success('User authenticated successfully', { userId: user.id });

      return {
        success: true,
        user: user,
        token: token
      };
    } catch (error) {
      logger.error('Authentication failed', { email });
      throw error;
    }
  }

  updateUserProfile(userId, updates) {
    logger.info('Updating user profile', { userId });
    
    try {
      const user = this.repository.findById(userId);
      if (!user) {
        logger.error('User not found', { userId });
        throw new Error('User not found');
      }

      if (!this.validateUpdateData(updates)) {
        logger.error('Invalid update data');
        throw new Error('Invalid update data');
      }

      this.repository.update(userId, updates);
      logger.success('User profile updated', { userId });

      this.sendProfileUpdateNotification(userId, updates);

      return { success: true };
    } catch (error) {
      logger.error('Failed to update profile', { userId });
      throw error;
    }
  }

  deleteUserAccount(userId) {
    logger.info('Deleting user account', { userId });
    
    try {
      const user = this.repository.findById(userId);
      if (!user) {
        logger.error('User not found', { userId });
        throw new Error('User not found');
      }

      this.repository.delete(userId);
      logger.success('User account deleted', { userId });

      this.sendFarewellEmail(user);

      authService.revokeAllTokens(userId);

      return { success: true };
    } catch (error) {
      logger.error('Failed to delete account', { userId });
      throw error;
    }
  }

  validateRegistrationData(userData) {
    logger.info('Validating registration data');
    if (!userData.email || !userData.name || !userData.password) {
      return false;
    }
    return true;
  }

  validateUpdateData(updates) {
    logger.info('Validating update data');
    return true;
  }

  verifyPassword(password, hashedPassword) {
    logger.info('Verifying password');
    return hashedPassword === 'hashed_' + password;
  }

  sendWelcomeEmail(user) {
    logger.info('Sending welcome email', { email: user.email });
    emailService.sendWelcomeEmail(user);
  }

  sendProfileUpdateNotification(userId, updates) {
    logger.info('Sending profile update notification', { userId });
    emailService.sendUpdateNotification(userId, updates);
  }

  sendFarewellEmail(user) {
    logger.info('Sending farewell email', { email: user.email });
    emailService.sendFarewellEmail(user);
  }

  handleRegistrationError(error) {
    logger.error('Handling registration error', { message: error.message });
  }

  logFailedAttempt(email) {
    logger.info('Failed login attempt logged', { email });
  }
}

module.exports = UserService;
