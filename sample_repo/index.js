const { log } = require('./utils/logger');
const user = require('./services/userService');
const billing = require('./services/billingService');

function main() {
  log("starting app");
  user.createUser("alice");
  billing.charge("alice", 100);
}

main();
