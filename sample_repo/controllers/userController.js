const logger = require('../utils/logger');
const UserService = require('../services/userService');

class UserController {
  constructor(userService) {
    this.userService = userService;
    logger.info('UserController initialized');
  }

  registerUser(req, res) {
    try {
      const { email, name, password } = req.body;
      const user = this.userService.createUser(email, name, password);
      res.json({ success: true, data: user });
    } catch (error) {
      logger.error('Registration failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  getUser(req, res) {
    try {
      const user = this.userService.getUser(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  updateUser(req, res) {
    try {
      const user = this.userService.updateUser(req.params.id, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  deleteUser(req, res) {
    try {
      this.userService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  listUsers(req, res) {
    try {
      const limit = req.query.limit || 10;
      const users = this.userService.listUsers(limit);
      res.json({ success: true, data: users, count: users.length });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = UserController;
