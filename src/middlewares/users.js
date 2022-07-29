require('dotenv').config();
const _ = require('lodash');
const yup = require('yup');
const asyncMw = require('async-express-mw');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const repository = require('../repository');
const { hashText } = require('../utils/encryption');

exports.getAllUsersMw = asyncMw(async (req, res, next) => {
  const userData = await repository.user.findAll({}, req.filterQueryParams, req.query);

  req.users = userData.rows;
  req.count = userData.count;
  next();
});

exports.getUserByIdMw = asyncMw(async (req, res, next) => {
  const user = await repository.user.findOne(req.params.id, req.query);
  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  req.user = user;

  next();
});

exports.updateValidationMw = asyncMw(async (req, res, next) => {
  if (req.body.email) {
    const validationEmail = await repository.user.findOne({
      email: req.body.email,
      id: {
        [Sequelize.Op.not]: req.user.id,
      },
    });
    if (validationEmail) {
      return res.status(409).json({
        message: 'Email already exist',
      });
    }
    const validationUsername = await repository.user.findOne({
      username: req.body.username,
      id: {
        [Sequelize.Op.not]: req.user.id,
      },
    });
    if (validationUsername) {
      return res.status(409).json({
        message: 'Username already exist',
      });
    }
  }
  next();
});

exports.createUserMw = asyncMw(async (req, res, next) => {
  const { email } = req.body;
  const schema = yup.object().shape({
    firstName: yup.string().required(),
    lastName: yup.string(),
    email: yup.string().required(),
    password: yup.string(),
  });
  try {
    const validationEmail = await repository.user.findOne({ email: req.body.email });
    if (validationEmail) {
      return res.status(409).json({
        message: 'Email already exist',
      });
    }
    const validationUsername = await repository.user.findOne({ username: req.body.username });
    if (validationUsername) {
      return res.status(409).json({
        message: 'Username already exist',
      });
    }
    await schema.validate({ ...req.body });

    // check email and user role
    const user = await repository.user.findOne({ email });
    if (user) throw new Error('Email already registered');

    const dataForUsersTable = await repository.user.resourceToModel({
      ...req.body,
    });
    const newUser = await repository.user.create(dataForUsersTable);

    req.user = newUser;
    next();
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

exports.patchUserByIdMw = asyncMw(async (req, res, next) => {
  try {
    const { oldPassword, password } = req.body;
    if (oldPassword || password) {
      const checkPassword = await bcrypt.compare(oldPassword, req.user.password);
      if (!checkPassword) {
        return res.status(401).json({
          message: 'Invalid old password',
        });
      }
    }

    const data = await repository.user.resourceToModel({
      ...req.body,
    });

    if (req.body.password) {
      data.password = await hashText(req.body.password);
    }

    await repository.user.update(req.params.id, data);

    next();
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

exports.getUserByEmailMw = asyncMw(async (req, res, next) => {
  const options = { ...req.query };

  const user = await repository.user.findOne({ email: req.body.email }, options);
  if (!user) {
    return res.status(404).json('User not found');
  }

  req.user = user;

  next();
});

exports.returnUsersMw = asyncMw(async (req, res) => {
  const rows = await Promise.all(
    _.map(req.users, (result) => repository.user.modelToResource(result))
  );
  const result = {
    rows,
    total: req.count,
    page: req.query.page ? parseInt(req.query.page, 10) : 1,
  };

  return res.status(200).json(result);
});

exports.returnUserMw = asyncMw(async (req, res) => {
  const result = await repository.user.modelToResource(req.user);

  return res.status(200).json(result);
});

exports.deleteUserByIdMw = asyncMw(async (req, res) => {
  // delete user
  await repository.user.delete({ id: req.user.id });
  return res.status(204).send({});
});
