const { log } = require('../utils/logger');
const user = require('./userService');

function charge(username, amount) {
  log(`Charging ${username} $${amount}`);
  const u = user.getUser(1);
  return { user: u, amount, charged: true };
}

function refund(username, amount) {
  log(`Refunding ${username} $${amount}`);
  return { user: {}, amount, refunded: true };
}

module.exports = { charge, refund };
