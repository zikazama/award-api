const express = require('express');

const router = express.Router({ mergeParams: true });
const awards = require('../middlewares/awards');

// GET /awards
router.get('/', awards.getAwardsMw, awards.getPaginate, awards.returnAwardsDataMw);

// POST /awards
router.post(
  '/',
  awards.uploadFile,
  awards.createValidationMw,
  awards.insertAwardToDbMw,
  awards.getAwardMw,
  awards.returnAwardDataMw
);

// PATCH /awards/{id}
router.patch(
  '/:id',
  awards.getAwardMw,
  awards.uploadFile,
  awards.updateAwardMw,
  awards.getAwardMw,
  awards.returnAwardDataMw
);

// GET /awards
router.get('/:id', awards.getAwardMw, awards.returnAwardDataMw);

// DELETE /awards/{id}
router.delete('/:id', awards.getAwardMw, awards.deleteAwardMw);

module.exports = router;
