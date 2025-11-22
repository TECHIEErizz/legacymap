/**
 * Validator Utility - Input validation (Legacy Code)
 */

const logger = require('./logger');

class Validator {
  isValidEmail(email) {
    logger.info('Validating email', { email: email.substring(0, 10) + '...' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    if (!isValid) {
      logger.error('Invalid email format');
    }
    return isValid;
  }

  isValidPassword(password) {
    logger.info('Validating password');
    if (!password || password.length < 8) {
      logger.error('Password too short');
      return false;
    }
    return true;
  }

  isValidName(name) {
    logger.info('Validating name');
    if (!name || name.length < 2) {
      logger.error('Name too short');
      return false;
    }
    return true;
  }

  sanitizeInput(input) {
    logger.info('Sanitizing input');
    return input.trim().replace(/[<>]/g, '');
  }

  validateUserObject(user) {
    logger.info('Validating user object');
    if (!user.id || !user.email || !user.name) {
      logger.error('Invalid user object');
      return false;
    }
    return true;
  }
}

module.exports = new Validator();
