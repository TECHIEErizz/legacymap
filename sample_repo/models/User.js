/**
 * User Model - Represents a user in the system
 */
class User {
  constructor(id, name, email, role = 'user') {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.createdAt = new Date();
    this.isActive = true;
  }

  validate() {
    if (!this.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    if (this.name.length < 3) {
      throw new Error('Name must be at least 3 characters');
    }
    return true;
  }

  deactivate() {
    this.isActive = false;
  }

  activate() {
    this.isActive = true;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;
