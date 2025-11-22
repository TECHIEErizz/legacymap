/**
 * User Controller - HTTP Handler for User Endpoints (Legacy Code)
 */

const logger = require('../utils/logger');
const UserService = require('../services/userService');
const validator = require('../utils/validator');

class UserController {
  constructor() {
    logger.info('UserController initialized');
    this.userService = new UserService();
  }

  handleRegister(req, res) {
    logger.info('Handling user registration request', { email: req.body.email });
    try {
      logger.info('Validating registration request');
      const userData = validator.sanitizeInput(req.body);
      
      const result = this.userService.registerUser(userData);
      
      logger.success('Registration handled successfully');
      res.send(result);
    } catch (error) {
      logger.error('Failed to handle registration', { error: error.message });
      res.error(error);
    }
  }

  handleLogin(req, res) {
    logger.info('Handling user login request', { email: req.body.email });
    try {
      const { email, password } = req.body;
      
      logger.info('Authenticating user');
      const result = this.userService.authenticateUser(email, password);
      
      logger.success('Login handled successfully');
      res.send(result);
    } catch (error) {
      logger.error('Failed to handle login', { error: error.message });
      res.error(error);
    }
  }

  handleGetUser(req, res) {
    logger.info('Handling get user request', { userId: req.params.id });
    try {
      const userId = req.params.id;
      
      logger.info('Fetching user details');
      const user = this.userService.getUserDetails(userId);
      
      logger.success('User retrieved successfully');
      res.send(user);
    } catch (error) {
      logger.error('Failed to get user', { error: error.message });
      res.error(error);
    }
  }

  handleUpdateUser(req, res) {
    logger.info('Handling user update request', { userId: req.params.id });
    try {
      const userId = req.params.id;
      const updates = req.body;
      
      logger.info('Updating user profile');
      const result = this.userService.updateUserProfile(userId, updates);
      
      logger.success('User updated successfully');
      res.send(result);
    } catch (error) {
      logger.error('Failed to update user', { error: error.message });
      res.error(error);
    }
  }

  handleDeleteUser(req, res) {
    logger.info('Handling user deletion request', { userId: req.params.id });
    try {
      const userId = req.params.id;
      
      logger.info('Initiating user account deletion');
      const result = this.userService.deleteUserAccount(userId);
      
      logger.success('User deleted successfully');
      res.send(result);
    } catch (error) {
      logger.error('Failed to delete user', { error: error.message });
      res.error(error);
    }
  }
}

module.exports = new UserController();
