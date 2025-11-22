const userService = require('./userService');

function charge(user, amount) {
  console.log("charging", user, amount);
  // call userService for some reason
  userService.createUser(user + "_charged");
}

module.exports = { charge };

