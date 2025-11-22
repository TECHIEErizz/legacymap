/**
 * Database Utility - Mock database connection and operations
 */

const logger = require('./logger');

class Database {
  constructor(config) {
    this.config = config;
    this.connected = false;
    this.data = {};
  }

  connect() {
    logger.info('Connecting to database...', { host: this.config.host });
    this.connected = true;
    this.data = { users: [], orders: [], payments: [] };
    logger.success('Database connected');
  }

  disconnect() {
    logger.info('Disconnecting from database...');
    this.connected = false;
  }

  isConnected() {
    return this.connected;
  }

  query(table, filter) {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    logger.debug(`Querying ${table}`, { filter });
    return this.data[table] || [];
  }

  insert(table, data) {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    logger.info(`Inserting into ${table}`, data);
    if (!this.data[table]) {
      this.data[table] = [];
    }
    const newRecord = { ...data, id: Date.now() };
    this.data[table].push(newRecord);
    logger.success(`Record inserted into ${table}`, { id: newRecord.id });
    return newRecord;
  }

  update(table, id, data) {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    logger.info(`Updating ${table}`, { id, data });
    const records = this.data[table] || [];
    const index = records.findIndex(r => r.id === id);
    if (index !== -1) {
      records[index] = { ...records[index], ...data };
      logger.success(`Record updated in ${table}`, { id });
      return records[index];
    }
    return null;
  }

  delete(table, id) {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    logger.info(`Deleting from ${table}`, { id });
    const records = this.data[table] || [];
    const filtered = records.filter(r => r.id !== id);
    this.data[table] = filtered;
    logger.success(`Record deleted from ${table}`, { id });
    return true;
  }

  clear(table) {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    this.data[table] = [];
    logger.info(`Table ${table} cleared`);
  }
}

module.exports = Database;
