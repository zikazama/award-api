require('dotenv').config();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncMw = require('async-express-mw');
const repository = require('../repository');
const { generateAccessToken } = require('../utils/generateToken');

exports.getUserByEmailOrUsernameMw = asyncMw(async (req, res, next) => {
  const options = { ...req.query };

  if (!req.body.email) {
    return res.status(400).json({
      message: 'Please fill email',
    });
  }

  const user = await repository.user.findOne({ email: req.body.email }, options);

  if (!user) {
    return res.status(404).json({ message: 'Email Address is not exists' });
  }

  req.user = user;

  next();
});

exports.loginMw = asyncMw(async (req, res) => {
  const userToken = await generateAccessToken(_.pick(req.user, ['id', 'email']));

  return res.status(200).json({ id: req.user.id, email: req.user.email, token: userToken });
});

exports.getUserByLoginTokenMw = asyncMw(async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({
      message: 'No token found!',
    });
  }

  const bearer = authorization && authorization.split(' ')[1];

  jwt.verify(bearer, process.env.JWT_TOKEN_SECRET, async (err, payload) => {
    if (err) return res.sendStatus(403);

    const user = await repository.user.findOne(payload.id, {});

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    req.currentUser = user;
    next();
  });
});
