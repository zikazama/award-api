const express = require('express');

const router = express.Router();
const user = require('../middlewares/users');

// GET /users
router.get('/', user.getAllUsersMw, user.returnUsersMw);

// GET /users/:id
router.get('/:id', user.getUserByIdMw, user.returnUserMw);

// POST /users
router.post('/', user.createUserMw, user.returnUserMw);

// PATCH /users/:id
router.patch(
  '/:id',
  user.getUserByIdMw,
  user.updateValidationMw,
  user.patchUserByIdMw,
  user.getUserByIdMw,
  user.returnUserMw
);

// Delete /users/:id
router.delete('/:id', user.getUserByIdMw, user.deleteUserByIdMw);

module.exports = router;
