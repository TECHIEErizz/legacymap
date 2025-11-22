const { log } = require('../utils/logger');

function createUser(name) {
  log(`Creating user: ${name}`);
  return { id: 1, name };
}

function getUser(id) {
  log(`Fetching user ${id}`);
  return { id, name: "user" };
}

module.exports = { createUser, getUser };
