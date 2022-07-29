const userRepository = require('./user');
const awardRepository = require('./award');

module.exports = {
  user: userRepository,
  award: awardRepository,
};
