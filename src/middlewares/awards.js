const assert = require('assert');
const yup = require('yup');
const _ = require('lodash');
const asyncMw = require('async-express-mw');
const repository = require('../repository');
const multer = require('../utils/multer/awards');
const deleteUploadedFile = require('../utils/deleteUploadedFile');
const { Award } = require('../models');
const { AWARD_TYPE } = require('../constants');

const upload = multer.single('file');

exports.createValidationMw = asyncMw(async (req, res, next) => {
  const schema = yup.object().shape({
    title: yup.string().required(),
    poin: yup.number().required(),
    type: yup
      .string()
      .oneOf([AWARD_TYPE.VOUCHERS, AWARD_TYPE.PRODUCTS, AWARD_TYPE.OTHERS])
      .required(),
  });
  try {
    if (!req.imageUrl) {
      throw new Error('imageUrl is required');
    }
    await schema.validate(req.body);
    next();
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

exports.uploadFile = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

exports.insertAwardToDbMw = asyncMw(async (req, res, next) => {
  const dataAward = await repository.award.resourceToModel(req.body);
  dataAward.imageUrl = req.imageUrl.storedFileName;
  const award = await repository.award.create(dataAward);
  req.award = award;
  next();
});

exports.updateAwardMw = asyncMw(async (req, res, next) => {
  const updateData = repository.award.resourceToModel(req.body);
  console.log(req.imageUrl);
  if (req.imageUrl) {
    updateData.imageUrl = req.imageUrl.storedFileName;
    // delete the old file
    if (req.award.imageUrl) {
      await deleteUploadedFile(`.${req.award.imageUrl}`);
    }
  }
  await repository.award.update(req.award.id, updateData);
  next();
});

exports.getAwardsMw = asyncMw(async (req, res, next) => {
  const awards = await repository.award.findAll({}, req.filterQueryParams, {
    ...req.query,
  });
  req.awards = awards.rows;
  req.count = awards.count;
  next();
});

exports.getAwardMw = asyncMw(async (req, res, next) => {
  const id = req.params?.id || req.award?.id;
  assert(id, 'id is required');

  const award = await repository.award.findOne(id, {
    ...req.query,
  });
  if (!award) return res.status(404).json({ message: 'Award not found' });
  req.award = award;
  next();
});

exports.deleteAwardMw = asyncMw(async (req, res) => {
  const award = await repository.award.modelToResource(req.award);
  await deleteUploadedFile(`.${award.imageUrl}`);
  await repository.award.delete({
    id: req.award.id,
  });
  return res.sendStatus(204);
});

exports.streamDocumentFileMw = (req, res) => {
  res.download(req.documentFiles.path, req.clientDocument.originalFileName, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
  });
};

exports.getPaginate = asyncMw(async (req, res, next) => {
  const rows = await Promise.all(
    _.map(req.awards, (award) => repository.award.modelToResource(award))
  );

  req.response = {
    rows,
    total: req.count,
    page: req.query.page ? parseInt(req.query.page, 10) : 1,
  };
  next();
});

exports.returnAwardsDataMw = asyncMw(async (req, res) => res.json(req.response));

exports.returnAwardDataMw = asyncMw(async (req, res) => res.json(req.award));
