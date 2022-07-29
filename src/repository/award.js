require('dotenv').config();
const _ = require('lodash');
const { factory } = require('./baseRepository');
const { Award } = require('../models');

const awardRepository = factory(Award);

awardRepository.resourceToModel = async (resource) => {
  // hash password/passcode if available
  const model = _.pick(resource, ['title', 'poin', 'imageUrl', 'type']);
  return model;
};

awardRepository.modelToResource = async (model) => {
  model.dataValues.imageUrlFull = `${process.env.URL}:${process.env.PORT}/tmp/awards/${model.imageUrl}`;
  const resource = model.toJSON();
  return resource;
};

module.exports = awardRepository;
