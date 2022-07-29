const jwt = require('jsonwebtoken');

exports.generateAccessToken = function (user) {
  return jwt.sign(user, process.env.JWT_TOKEN_SECRET, {
    expiresIn: '1800000s',
  });
};

exports.generateResetPasswordToken = function (user) {
  return jwt.sign(user, process.env.JWT_TOKEN_SECRET, {
    expiresIn: '1d',
  });
};

exports.decodeToken = function (token) {
  return jwt.decode(token, { complete: true });
};

exports.expiresIn = function (decode) {
  return new Date(decode.payload.exp * 1000);
};
